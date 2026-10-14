const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('public/os/direction.js','utf8').split('pages.northstar=')[0];
function setup(){
 const stored=new Map();
 const context={structuredClone,fronts:[{id:'c',name:'Cozii',rank:2,status:'active',activity:[],tasks:[{text:'Keep me',done:true}]},{id:'v',name:'Valley of Grace',rank:1,status:'active',activity:[]},{id:'s',name:'Other',rank:3,status:'active',activity:[]}],db:{preferences:[{id:'personal'}],tasks:[{id:'t',front:'s',name:'Keep linked work'}]},localStorage:{setItem:(k,v)=>stored.set(k,v)},key:'fronts',wsKey:'workspace',recoverySave:async()=>{},toast:()=>{}};
 context.prefs=()=>context.db.preferences[0];context.bundle=()=>structuredClone({version:1,fronts:context.fronts,workspace:context.db});
 vm.createContext(context);vm.runInContext(source,context);return {context,stored};
}
test('focus migration preserves IDs, tasks and a complete backup, and is idempotent',()=>{const {context:c,stored}=setup();c.focusMigration();assert.equal(c.fronts.filter(f=>f.status==='active').length,2);assert.equal(c.fronts[0].rank,1);assert.equal(c.fronts[2].status,'parked');assert.equal(c.db.tasks[0].front,'s');assert.equal(c.fronts[0].tasks[0].done,true);assert.equal(JSON.parse(stored.get('bxb-before-direction-v1')).fronts[2].status,'active');const once=JSON.stringify(c.bundle());c.focusMigration();assert.equal(JSON.stringify(c.bundle()),once)});
test('never revives a scrapped primary front or invents missing businesses',()=>{const {context:c,stored}=setup();c.fronts[0].status='scrapped';const before=JSON.stringify(c.bundle());c.focusMigration();assert.equal(JSON.stringify(c.bundle()),before);assert.equal(stored.size,0)});
test('storage failure leaves workspace unchanged',()=>{const {context:c}=setup();const before=JSON.stringify(c.bundle());let fail=true;c.localStorage.setItem=(k)=>{if(k==='workspace'&&fail){fail=false;throw Error('full')}};c.focusMigration();assert.equal(JSON.stringify(c.bundle()),before)});
