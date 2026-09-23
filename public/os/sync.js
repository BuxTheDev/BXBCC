/* Automatic snapshot sync. Cloud revisions prevent stale devices overwriting newer changes. */
const syncMetaKey='bxb-sync-state-v1';
let syncState=null,syncRunning=false,syncPrompt=null,syncMessage='Sign in to sync',syncStopped=false;
try{syncState=JSON.parse(localStorage.getItem(syncMetaKey))}catch{}
function syncFingerprint(value){return JSON.stringify({fronts:value.fronts,workspace:value.workspace})}
function syncOwner(){return cloudSession?cloudConfig.url+':'+cloudSession.user.id:null}
function syncRemember(revision,fingerprint){syncState={owner:syncOwner(),revision,fingerprint};localStorage.setItem(syncMetaKey,JSON.stringify(syncState))}
function syncStatus(message){syncMessage=message;document.querySelectorAll('[data-sync-status]').forEach(el=>el.textContent=message)}
function syncEditing(){return !!document.querySelector('dialog[open]')||document.activeElement?.matches('input,textarea,select,[contenteditable=true]')}
async function syncInstall(payload){const next=validateBundle(payload),old=bundle();await recoverySave(old,'Before device sync');try{localStorage.setItem(key,JSON.stringify(next.fronts));localStorage.setItem(wsKey,JSON.stringify(next.workspace))}catch(error){localStorage.setItem(key,JSON.stringify(old.fronts));localStorage.setItem(wsKey,JSON.stringify(old.workspace));throw error}fronts=next.fronts;for(const k of Object.keys(db))db[k]=next.workspace[k]||[];lastStable=bundle();render();renderPage()}
function syncAsk(remote){syncPrompt={remote,local:bundle(),owner:syncOwner()};syncStatus(remote?'Choose which copy to use':'Ready to connect this device');if(syncEditing())return;$('#sync-choice-content').innerHTML=`<header class="dialog-header"><h2 id="sync-choice-title">${remote?'Connect your workspace':'Start syncing'}</h2><button class="icon-button" data-close="sync-choice" aria-label="Decide later">×</button></header><div class="hq-body"><p>Account: ${esc(cloudSession.user.email)}</p><p>${remote?'This device and the cloud have different records. Choose which complete copy to keep. The other copy will be saved in local recovery first.':'Save this device’s workspace to your account. Future saved changes will sync automatically while this app is open and online.'}</p><p>This device: ${fronts.length} fronts${remote?' · Cloud: '+remote.payload.fronts.length+' fronts':''}</p><div class="backup-buttons">${remote?'<button class="primary" id="sync-use-cloud">Use cloud copy on this device</button>':''}<button class="secondary" id="sync-use-local">${remote?'Replace cloud with this device':'Start syncing this device'}</button></div><p class="small-notice">Different edits made on two devices are never silently combined or discarded. Download a backup first if you want to compare copies.</p></div>`;$('#sync-choice').showModal()}
async function syncTick(){
 if(syncRunning||cloudBusy||restoreBusy||syncStopped)return;
 if(!cloudSession){syncStatus('Sign in to sync');return}
 if(!navigator.onLine){syncStatus('Offline · changes saved on this device');return}
 syncRunning=true;
 try{
 const owner=syncOwner(),local=bundle(),fp=syncFingerprint(local),remote=await cloudRead();
 if(owner!==syncOwner())return;
 if(!syncState||syncState.owner!==owner){
  if(remote&&syncFingerprint(validateBundle(remote.payload))===fp){syncRemember(remote.revision,fp);syncStatus('Up to date');return}
  if(!syncPrompt){syncAsk(remote)}return;
 }
 const dirty=fp!==syncState.fingerprint,remoteChanged=(remote?.revision??null)!==syncState.revision;
 if(remoteChanged){
  if(dirty){if(!syncPrompt)syncAsk(remote);return}
  if(!remote){syncStatus('Cloud copy missing · reconnect in Settings');return}
  if(syncEditing()){syncStatus('Cloud update waiting · finish editing');return}
  // Recheck local edits after the network request before applying an incoming copy.
  if(syncFingerprint(bundle())!==fp)return;
  await syncInstall(remote.payload);syncRemember(remote.revision,syncFingerprint(bundle()));syncStatus('Up to date');return;
 }
 if(dirty){syncStatus('Saving…');const revision=await cloudFetch('/rest/v1/rpc/save_bxb_workspace',{method:'POST',body:{p_payload:local,p_expected_revision:syncState.revision}});if(owner!==syncOwner())return;syncRemember(revision,fp);syncStatus(syncFingerprint(bundle())===fp?'Up to date':'Saving new changes…')}
 else syncStatus('Up to date');
 }catch(error){syncStatus('Sync paused · '+error.message)}finally{syncRunning=false}
}
async function syncLocked(){if(navigator.locks)return navigator.locks.request('bxb-cloud-sync',{ifAvailable:true},async lock=>{if(lock)await syncTick()});return syncTick()}
document.body.insertAdjacentHTML('beforeend','<dialog id="sync-choice" aria-labelledby="sync-choice-title"><div id="sync-choice-content"></div></dialog>');
$('.topbar').insertAdjacentHTML('beforeend','<a href="#/settings" class="sync-indicator" data-sync-status>Sign in to sync</a>');
const syncCloudPanel=cloudPanel;cloudPanel=function(){return syncCloudPanel().replace('Save to cloud</button>','Sync now</button>').replace('Preview cloud copy</button>','Resolve copies</button>').replace('Save before switching devices. Preview and restore the cloud copy on your other device. Signing out leaves this device’s records in place.','Once connected, saved changes sync automatically while online. Wait for Up to date before closing. Signing out leaves local records on this device.')};
$('.sidebar-bottom').innerHTML=$('.sidebar-bottom').innerHTML.replace('Local prototype','BXB workspace').replace('Local workspace · no cloud sync.','Connect devices in Settings & recovery.');
const syncSettingsPage=settingsPage;settingsPage=function(){return syncSettingsPage()+`<section class="panel"><h2>Device sync</h2><p data-sync-status>${esc(syncMessage)}</p><button class="secondary" id="sync-now">Sync now / resolve copies</button><p class="small-notice">Sync checks every 10 seconds while open. Offline changes stay here until you reconnect. To move records from the old Wi-Fi preview, download its backup, then import it here before choosing this device’s copy.</p><button class="secondary" id="open-scrapped">Scrapped fronts</button></section>`};
document.addEventListener('click',async e=>{
 const b=e.target.closest('button');if(!b)return;
 if(['cloud-save','cloud-load','cloud-confirm-save'].includes(b.id)){e.preventDefault();e.stopImmediatePropagation();syncPrompt=null;await syncLocked();return}
 if(b.id==='cloud-logout'){syncStopped=true;localStorage.removeItem('bxb-cloud-session');syncStatus('Signed out');return}
 if(b.id==='sync-now'){syncPrompt=null;syncStopped=false;await syncLocked();return}
 if(!['sync-use-cloud','sync-use-local'].includes(b.id)||!syncPrompt||syncRunning)return;
 const choice=syncPrompt;if(choice.owner!==syncOwner()){toast('Account changed. Reconnect this device.');return}syncRunning=true;b.disabled=true;
 try{const latest=await cloudRead();if((latest?.revision??null)!==(choice.remote?.revision??null)){throw Error('Cloud changed again. Close this dialog and choose Sync now to review the latest copy.')}
 if(b.id==='sync-use-cloud'){if(!latest)throw Error('Cloud copy no longer exists');await syncInstall(latest.payload);syncRemember(latest.revision,syncFingerprint(bundle()))}
 else{if(latest)await recoverySave(validateBundle(latest.payload),'Before choosing this device over cloud');const local=bundle(),revision=await cloudFetch('/rest/v1/rpc/save_bxb_workspace',{method:'POST',body:{p_payload:local,p_expected_revision:latest?.revision??null}});syncRemember(revision,syncFingerprint(local))}
 syncPrompt=null;$('#sync-choice').close();syncStatus('Up to date');toast('This device is connected. Changes will sync automatically.');
 }catch(error){syncStatus(error.message);toast(error.message)}finally{syncRunning=false;b.disabled=false}
},true);
const syncKeepSession=keepSession;keepSession=function(data){syncKeepSession(data);localStorage.setItem('bxb-cloud-session',JSON.stringify(cloudSession));syncStopped=false};
if(!cloudSession){try{const stored=JSON.parse(localStorage.getItem('bxb-cloud-session'));if(stored?.project===cloudConfig.url&&stored.user?.id){cloudSession=stored;sessionStorage.setItem('bxb-cloud-session',JSON.stringify(stored))}}catch{}}
window.addEventListener('online',syncLocked);window.addEventListener('focus',syncLocked);
window.addEventListener('storage',e=>{if(e.key==='bxb-cloud-session'&&e.newValue){try{const session=JSON.parse(e.newValue);if(session.project===cloudConfig.url)cloudSession=session}catch{}return}if(e.key==='bxb-cloud-session'&&!e.newValue){cloudSession=null;sessionStorage.removeItem('bxb-cloud-session');syncStatus('Signed out');return}if(e.key===key||e.key===wsKey){syncStopped=true;syncStatus('Another tab changed this workspace · reload to continue safely')}});
setInterval(syncLocked,10000);setTimeout(syncLocked,1500);
/* Recoverable removal: retain the front ID so related records stay connected. */
const syncHQ=openHQ;openHQ=function(id){syncHQ(id);$('.hq-controls').insertAdjacentHTML('beforeend',`<button class="secondary danger" data-scrap-front="${esc(id)}">Scrap front</button>`)};
const syncRender=render;render=function(){syncRender();$('#archives').insertAdjacentHTML('beforeend',`<details><summary>Scrapped <span>${fronts.filter(f=>f.status==='scrapped').length}</span></summary>${scrappedHTML()}</details>`)};
function scrappedHTML(){return fronts.filter(f=>f.status==='scrapped').map(f=>`<div class="linked-row"><div>${esc(f.name)}<small>Related records are retained.</small></div><button class="secondary" data-restore-front="${esc(f.id)}">Restore front</button></div>`).join('')||'<p>No scrapped fronts.</p>'}
document.body.insertAdjacentHTML('beforeend','<dialog id="scrap-dialog"><header class="dialog-header"><h2>Scrap this front?</h2><button class="icon-button" data-close="scrap-dialog" aria-label="Cancel scrapping">×</button></header><div class="hq-body"><p>Remove it from active work and task lists. Its notes and related records stay safe, and you can restore it under Scrapped.</p><button class="primary" id="confirm-scrap">Scrap front</button></div></dialog><dialog id="scrapped-dialog"><header class="dialog-header"><h2>Scrapped fronts</h2><button class="icon-button" data-close="scrapped-dialog" aria-label="Close scrapped fronts">×</button></header><div class="hq-body" id="scrapped-list"></div></dialog>');
let scrapId=null;
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.scrapFront){scrapId=b.dataset.scrapFront;$('#scrap-dialog').showModal()}if(b.id==='confirm-scrap'){const f=fronts.find(f=>f.id===scrapId);if(f){f.previousStatus=f.status;f.status='scrapped';f.activity.push('Scrapped · '+localDay());saveEverything();$('#scrap-dialog').close();$('#hq').close();render();renderPage();toast('Front scrapped. You can restore it later.')}}if(b.id==='open-scrapped'){$('#scrapped-list').innerHTML=scrappedHTML();$('#scrapped-dialog').showModal()}if(b.dataset.restoreFront){const f=fronts.find(f=>f.id===b.dataset.restoreFront);if(f){f.status=['active','parked','done'].includes(f.previousStatus)?f.previousStatus:'parked';saveEverything();render();renderPage();$('#scrapped-list').innerHTML=scrappedHTML();toast('Front restored')}}});
render();if(route==='settings')renderPage();
