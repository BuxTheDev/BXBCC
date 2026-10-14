/* Sign-in is the entry point. Database access is independently protected by RLS. */
let gateChecking=false,gateVerified=false;
const gate=$('#auth-gate'),gateStatus=$('#gate-status');
function lockWorkspace(message='Sign in to your private workspace.'){
 gateVerified=false;syncStopped=true;document.body.dataset.auth='locked';gate.hidden=false;document.title='Sign in · BXB OS';
 document.querySelectorAll('dialog[open]').forEach(d=>d.close());gateStatus.textContent=message;
}
async function verifyWorkspaceSession(){
 if(gateChecking)return;gateChecking=true;
 try{
  if(!cloudSession){lockWorkspace();return}
  const user=await cloudFetch('/auth/v1/user');
  if(!user.email_confirmed_at||user.email?.toLowerCase()!=='bxbuksoontorn@gmail.com')throw Error('Use the verified owner account to open this workspace.');
  cloudSession.user=user;gateVerified=true;document.body.dataset.auth='unlocked';gate.hidden=true;syncStopped=false;navigate();
 }catch(error){lockWorkspace(error.message||'Sign in again to continue.')}finally{gateChecking=false}
}
const gateKeepSession=keepSession;keepSession=function(data){gateKeepSession(data);queueMicrotask(()=>{if(!gateChecking)verifyWorkspaceSession()})};
document.addEventListener('submit',async e=>{
 if(!['gate-email','gate-password'].includes(e.target.id))return;e.preventDefault();const form=e.target,button=form.querySelector('button');button.disabled=true;
 try{const email=form.elements.email.value.trim();if(email.toLowerCase()!=='bxbuksoontorn@gmail.com')throw Error('Use your BXB workspace owner email.');
  if(form.id==='gate-email'){gateStatus.textContent='Sending your sign-in link…';await cloudFetch('/auth/v1/otp?redirect_to='+encodeURIComponent('https://bxbcc.vercel.app/os'),{method:'POST',authenticated:false,body:{email,create_user:false}});gateStatus.textContent='Check your email. Open the link on this device to sign in.'}
  else{gateStatus.textContent='Signing in…';const session=await cloudFetch('/auth/v1/token?grant_type=password',{method:'POST',authenticated:false,body:{email,password:form.elements.password.value}});keepSession(session);form.elements.password.value='';await verifyWorkspaceSession()}
 }catch(error){gateStatus.textContent=error.message}finally{button.disabled=false}
});
document.addEventListener('click',e=>{if(e.target.closest('#cloud-logout')){e.preventDefault();e.stopImmediatePropagation();const token=cloudSession?.access_token;cloudSession=null;sessionStorage.removeItem('bxb-cloud-session');localStorage.removeItem('bxb-cloud-session');lockWorkspace('You’re signed out. Your workspace is hidden.');if(token)fetch(cloudConfig.url+'/auth/v1/logout',{method:'POST',headers:{apikey:cloudConfig.publicKey,Authorization:'Bearer '+token}}).catch(()=>{})}},true);
window.addEventListener('storage',e=>{if(e.key==='bxb-cloud-session'){if(!e.newValue)lockWorkspace('Signed out on another tab.');else verifyWorkspaceSession()}});
window.addEventListener('pageshow',()=>{if(!cloudSession)lockWorkspace()});
setInterval(()=>{if(gateVerified&&(!cloudSession||cloudSession.expires_at<Date.now()/1000+60))verifyWorkspaceSession()},30000);
lockWorkspace(cloudSession?'Checking your sign-in…':'Sign in to your private workspace.');verifyWorkspaceSession();
