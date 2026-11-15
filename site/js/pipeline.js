/* ---------- Pipeline: simulate -> baseline -> z-scores -> composites ---------- */
const BASE = 45, DAYS = 120, N = BASE + DAYS;       // index i: day = i - BASE + 1
const DOMAINS = [
  {id:'attention', name:'Attention'},
  {id:'mood',      name:'Mood'},
  {id:'sleep',     name:'Sleep'},
  {id:'body',      name:'Body'},
  {id:'social',    name:'Social and voice'}
];
// dir: +1 means higher is better, -1 means higher is worse
const METRICS = [
  {id:'rt',    domain:'attention', name:'Reaction time',          unit:'ms',      dir:-1, mean:250, between:30,  within:10,  dp:0},
  {id:'wm',    domain:'attention', name:'Working memory score',   unit:'%',       dir:+1, mean:88,  between:3,   within:2.2, dp:1},
  {id:'mood',  domain:'mood',      name:'Mood rating',            unit:'/10',     dir:+1, mean:7,   between:.7,  within:.55, dp:1},
  {id:'stress',domain:'mood',      name:'Stress rating',          unit:'/10',     dir:-1, mean:3.5, between:.7,  within:.6,  dp:1},
  {id:'sleeph',domain:'sleep',     name:'Sleep duration',         unit:'h',       dir:+1, mean:6.41,between:.65, within:.8,  dp:1},
  {id:'sleepe',domain:'sleep',     name:'Sleep efficiency',       unit:'%',       dir:+1, mean:87,  between:2.5, within:2.2, dp:1},
  {id:'hrv',   domain:'body',      name:'Heart-rate variability', unit:'ms',      dir:+1, mean:55,  between:13,  within:4.5, dp:0},
  {id:'rhr',   domain:'body',      name:'Resting heart rate',     unit:'bpm',     dir:-1, mean:58,  between:6,   within:2,   dp:0},
  {id:'crew',  domain:'social',    name:'Time with crew',         unit:'min/day', dir:+1, mean:95,  between:22,  within:13,  dp:0},
  {id:'speech',domain:'social',    name:'Speech rate',            unit:'words/min',dir:+1,mean:150, between:14,  within:6.5, dp:0},
  {id:'irritability',domain:'mood',  name:'Irritability rating',    unit:'/10',     dir:-1, mean:2.5, between:.6,  within:.55, dp:1},
  {id:'pitch', domain:'social',    name:'Voice pitch variability',unit:'Hz',      dir:+1, mean:22,  between:5,   within:2.2, dp:1},
  {id:'pauses',domain:'social',    name:'Pause length in speech', unit:'s',       dir:-1, mean:.55, between:.1,  within:.05, dp:2}
];
const CREW = [
  {id:'amara', name:'Amara', role:'Commander',          seed:11},
  {id:'kenji', name:'Kenji', role:'Pilot',              seed:23, shift:{rt:-1.3}},
  {id:'sofia', name:'Sofia', role:'Flight engineer',    seed:37},
  {id:'tomas', name:'Tomas', role:'Mission specialist', seed:41},
  {id:'leila', name:'Leila', role:'Science officer',    seed:59, vary:1.8, shift:{rt:1.4}},
  {id:'erik',  name:'Erik',  role:'Medical officer',    seed:73}
];
const EVENTS = [
  {from:52, to:56, who:'all',   domains:['attention'],    label:'Cabin CO₂ above limit (scrubber fault)', short:'CO₂ high'},
  {from:85, to:90, who:'tomas', domains:['sleep','mood'], label:'Spacewalk preparation week',             short:'Spacewalk prep'}
];

function rng32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function gauss(r){let u=0,v=0;while(!u)u=r();v=r();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const ramp=(d,s,e,peak)=>peak*clamp((d-s)/(e-s),0,1);
const mean=a=>a.reduce((s,v)=>s+v,0)/a.length;
const sd=a=>{const m=mean(a);return Math.sqrt(a.reduce((s,v)=>s+(v-m)*(v-m),0)/(a.length-1))};

// The hidden "truth" of the simulation, in SD units (negative = worse).
function effect(pid, m, day){
  if(day<1) return 0;
  let e=0;
  if(m.domain==='attention'){ if(day>=52&&day<=56)e-=2.3; else if(day===57)e-=1.0; else if(day===58)e-=.4; }
  if(pid==='erik'){ if(day===73){ if(m.id==='rhr')e-=5; if(m.id==='hrv')e-=3; } if(day===74&&m.id==='rhr')e-=2; }   // individual, no known cause
  if(day===30&&m.id==='rhr')e-=4;                                                                                 // whole crew, emergency drill
  if(day===101){ if(m.id==='rhr')e-=4; if(m.id==='hrv')e-=2.4; } if(day===102&&m.id==='rhr')e-=2;                  // whole crew, no logged cause
  if(day===93&&(pid==='tomas'||pid==='kenji')&&m.id==='rhr')e-=4;                                                    // spacewalk day
  if(pid==='kenji'&&m.id==='irritability')e+=ramp(day,50,80,-1.6);   // irritability climbs before his mood dips
  if(pid==='kenji'){
    if(m.domain==='sleep')e+=ramp(day,40,75,-2.5);
    if(m.domain==='mood')e+=ramp(day,65,100,-1.0);
  }
  if(pid==='sofia'){            // withdraws, but keeps reporting a normal mood
    if(m.domain==='social')e+=ramp(day,68,92,-2.4);
    if(m.domain==='body')e+=ramp(day,72,100,-1.2);
  }
  if(pid==='tomas'){
    if(day>=85&&day<=90){ if(m.domain==='sleep')e-=2.0; if(m.domain==='mood')e-=.9; }
    if(day===91&&m.domain==='sleep')e-=.8;
  }
  return e;
}

const LAMBDA = 0.9;                    // share of sleep debt carried to the next day
const BETA_TRUE = {amara:.14,kenji:.25,sofia:.12,tomas:.07,leila:.15,erik:.16};  // hidden truth: SD of attention lost per hour of debt
function debtSeries(sleep, need){let D=0;return sleep.map(s=>{D=Math.max(0,LAMBDA*D+(need-s));return D})}

// Sleep effects are set in hours so they can be compared with published values.
const FLIGHT_SLEEP_SHIFT = -0.32;      // ISS crews: 6.41 h before flight, 6.09 h in flight (Barger 2014)
function sleepHours(pid, day){
  if(day<1) return 0;
  let e=FLIGHT_SLEEP_SHIFT;
  if(pid==='kenji')e+=ramp(day,40,75,-0.6);
  if(pid==='tomas'){ if(day>=85&&day<=90)e-=1.5; if(day===91)e-=.6; if(day===92)e-=1.0; if(day===93)e-=1.2; }   // spacewalk prep, then the early sleep shift
  if(pid==='kenji'&&(day===92||day===93))e-=1.0;
  if(pid==='tomas'&&day===26)e-=1.5;      // late maintenance overlapped the sleep window
  if(pid==='erik'&&day===38)e-=0.8;       // night alarm
  if(pid==='leila'&&day===71)e-=1.0;      // warm sleep station
  return e;
}
function simulate(c){
  const r=rng32(c.seed), raw={}, par={}, noise={};
  const shock={}; DOMAINS.forEach(d=>{shock[d.id]=Array.from({length:N},()=>gauss(r))});
  METRICS.forEach(m=>{
    const mu=m.mean+m.between*((c.shift&&c.shift[m.id]!==undefined)?c.shift[m.id]:gauss(r)*.8);
    const s=m.within*(c.vary||1)*(.8+.45*r());
    par[m.id]={mu,s};
    let prev=0; const out=[];
    for(let i=0;i<N;i++){
      const fresh=Math.sqrt(.35)*shock[m.domain][i]+Math.sqrt(.65)*gauss(r);
      prev=.3*prev+Math.sqrt(1-.09)*fresh; out.push(prev);      // day-to-day carry-over
    }
    noise[m.id]=out;
  });
  const value=(m,i,extra)=>{
    let x=m.id==='sleeph'?clamp(par[m.id].mu+par[m.id].s*noise[m.id][i]+sleepHours(c.id,i-BASE+1),3,9.5)
      :par[m.id].mu+m.dir*par[m.id].s*(noise[m.id][i]+effect(c.id,m,i-BASE+1)+(extra||0));
    if(m.unit==='/10')x=clamp(x,0,10); if(m.unit==='%')x=clamp(x,0,100);
    return x;
  };
  const sleepM=METRICS.find(m=>m.id==='sleeph');
  raw.sleeph=Array.from({length:N},(_,i)=>value(sleepM,i));
  const debt=debtSeries(raw.sleeph,par.sleeph.mu);
  METRICS.forEach(m=>{
    if(m.id==='sleeph')return;
    raw[m.id]=Array.from({length:N},(_,i)=>value(m,i,m.domain==='attention'?-BETA_TRUE[c.id]*debt[i]:0));
  });
  return raw;
}

function trailing(a,w){return a.map((_,i)=>mean(a.slice(Math.max(0,i-w+1),i+1)))}
function standardise(a){const b=a.slice(0,BASE),m=mean(b),s=sd(b);return a.map(v=>(v-m)/s)}

function analyse(c){
  const raw=simulate(c), base={}, z={};
  METRICS.forEach(m=>{
    const b=raw[m.id].slice(0,BASE), mu=mean(b), s=sd(b);
    base[m.id]={mean:mu,sd:s};
    z[m.id]=raw[m.id].map(x=>m.dir*(x-mu)/s);            // negative always means worse
  });
  const series={};
  DOMAINS.forEach(d=>{
    const ms=METRICS.filter(m=>m.domain===d.id);
    const comp=standardise(Array.from({length:N},(_,i)=>mean(ms.map(m=>z[m.id][i]))));
    series[d.id]={z:comp,avg:trailing(comp,7)};
  });
  const all=standardise(Array.from({length:N},(_,i)=>mean(DOMAINS.map(d=>series[d.id].z[i]))));
  series.overall={z:all,avg:trailing(all,7)};
  const need=base.sleeph.mean;
  return {...c,raw,base,z,series,need,debt:debtSeries(raw.sleeph,need)};
}

/* ---------- Forecast: personal fatigue model ----------
   attention = a + b * sleepDebt (+ time-of-day shift), fitted to each person's own history.
   The slope starts at a crew-wide value and moves toward the personal one as evidence builds. */
const TASKS = [
  {day:35,  hour:14,  name:'Cargo vehicle docking', who:['amara','kenji']},
  {day:60,  hour:9,   name:'Robotic arm operation', who:['sofia','erik']},
  {day:93,  hour:5.5, name:'Spacewalk',             who:['tomas','kenji']},
  {day:118, hour:16,  name:'Departure burn',        who:['amara','kenji']}
];

// Track record: how far past outlooks, each made only with the data available at the time, landed from what happened.
// Nothing is left out, so cabin faults and other surprises are inside these errors.
// How good is the forecast? Compare with simply assuming "no change".

/* ---------- Activity record: what each person was doing (assumed source: smart glasses with on-board summaries) ---------- */
// explains: areas where a sudden change during this activity is expected. records:false = glasses off for privacy.
const REFS = {
  esa:  ['ESA Columbus Control Centre blog, The astronaut daily schedule (2014)','https://outpost42.esa.int/blog/the-astronaut-daily-schedule/'],
  ex:   ['NASA, Counteracting bone and muscle loss in microgravity','https://www.nasa.gov/missions/station/iss-research/astronaut-exercise'],
  scott:['Scott 2023, npj Microgravity: exercise countermeasures in 46 astronauts','https://pmc.ncbi.nlm.nih.gov/articles/PMC9898566'],
  med:  ['NASA NTRS, Medical operations crew time analysis','https://ntrs.nasa.gov/api/citations/20230015627/downloads/Med%20Crew%20Time%20Analysis.pdf'],
  dsr19:['NASA, ISS Daily Summary Report 27 June 2019','https://www.nasa.gov/blogs/stationreport/2019/06/27/iss-daily-summary-report-6-27-2019/'],
  dsr18:['NASA, ISS Daily Summary Report 24 August 2018','https://www.nasa.gov/?p=781679'],
  chores:['NASA station blog, Household tasks and human research (2022)','https://www.nasa.gov/blogs/spacestation/2022/10/20/household-tasks-human-research-on-station-before-cargo-missions-ends'],
  eva:  ['NASA station blog, What does it take to prepare for a spacewalk? (2018)','https://www.nasa.gov/blogs/spacestation/2018/05/15/what-does-it-take-to-prepare-for-a-spacewalk'],
  pb:   ['NASA, EVA operations chapter on prebreathe protocols (Gernhardt 2013)','https://nasa.gov/wp-content/uploads/2023/03/gernhardt-eva-ops-chp-5.4-2013.pdf'],
  off:  ['NASA station blog, Crewmates off duty on station (2024)','https://www.nasa.gov/blogs/spacestation/2024/07/19/crewmates-off-duty-on-station-as-cosmonauts-work-cargo-and-lab-upkeep'],
  rgm:  ['ISS crew timeline radiogram, 28 May 2005 (via SpaceRef)','https://media2.spaceref.com/news/2005/05_28_2005_tl.pdf']
};
const ACTIVITIES = {
  sleep:      {name:'Sleep period',              load:'Rest',   records:false, explains:[],              src:['esa'],        notes:['Glasses off. Wearable only.']},
  hygiene:    {name:'Post-sleep and hygiene',    load:'Low',    records:false, explains:[],              src:['rgm'],        notes:['Glasses off. Not recorded.']},
  personal:   {name:'Pre-sleep and personal time',load:'Low',   records:false, explains:[],              src:['off'],        notes:['Glasses off. Not recorded.']},
  call:       {name:'Private family conference', load:'Low',    records:false, explains:[],              src:['med','rgm'],  notes:['Glasses off. Not recorded.']},
  medconf:    {name:'Private medical or psychological conference',load:'Low',records:false,explains:[],  src:['med'],        notes:['Glasses off. Not recorded.']},
  meal:       {name:'Meal',                      load:'Low',    records:true,  explains:[],              src:['esa'],        notes:['Eating at the galley table with two crewmates.','Rehydrating a meal pouch, then eating alone at the workstation.']},
  conference: {name:'Daily planning conference', load:'Low',    records:true,  explains:[],              src:['esa'],        notes:['Morning call with the control centres, going through today\'s plan.','Evening call with the control centres, reviewing tomorrow\'s plan.']},
  aerobic:    {name:'Aerobic exercise (treadmill or cycle)',load:'High',records:true,explains:['body'],  src:['ex','scott'], notes:['Running on the T2 treadmill, harness on, 25 minutes in.','Cycling on the CEVIS ergometer at steady effort.']},
  resistive:  {name:'Resistive exercise (ARED)', load:'High',   records:true,  explains:['body'],        src:['ex','scott'], notes:['On the resistive exercise device: squats, third set.','On the resistive exercise device: deadlifts and heel raises.']},
  science:    {name:'Science experiment',        load:'Low',    records:true,  explains:[],              src:['dsr19'],      notes:['Seated at the science glovebox, handling samples. No exertion, no alarm.','Moving sample bags into the laboratory freezer and logging them.','Photographing an experiment and recording readings.']},
  research:   {name:'Human research and medical checks',load:'Low',records:true,explains:[],             src:['dsr19','med'],notes:['Collecting own biological samples for a health study.','Running a periodic health check with a crewmate assisting.']},
  maintenance:{name:'Maintenance and repair',    load:'Medium', records:true,  explains:[],              src:['chores','dsr18'],notes:['Servicing the toilet system, following the procedure step by step.','Inspecting the treadmill during scheduled maintenance.','Replacing a part in the life-support rack.']},
  cargo:      {name:'Cargo transfer and inventory',load:'Medium',records:true, explains:[],              src:['dsr18'],      notes:['Moving cargo bags from the visiting vehicle and scanning them into the inventory.','Unpacking supplies and updating stowage locations.']},
  housekeeping:{name:'Weekly housekeeping',      load:'Low',    records:true,  explains:[],              src:['dsr18','rgm'],notes:['Wiping surfaces and vacuuming ventilation grilles.','Collecting trash and restocking the galley.']},
  sampling:   {name:'Environment sampling',      load:'Low',    records:true,  explains:[],              src:['med'],        notes:['Running an acoustic survey with the sound-level meter.','Taking water and surface samples for analysis.']},
  outreach:   {name:'Public event or radio contact',load:'Low', records:true,  explains:['mood'],        src:['dsr18'],      notes:['Answering students\' questions over ham radio.','On camera for a live public event.']},
  robotics:   {name:'Robotic arm operation',     load:'Low',    records:true,  explains:['mood'],        src:[],             notes:['At the robotics workstation, moving the arm toward a grapple point.','Monitoring arm cameras while a crewmate reads the procedure.']},
  piloting:   {name:'Vehicle docking or burn',   load:'Low',    records:true,  explains:['mood','body'], src:[],             notes:['At the controls, calling out range and rate during final approach.','Strapped in, monitoring the burn and reading the checklist aloud.']},
  evaprep:    {name:'Spacewalk preparation',     load:'Medium', records:true,  explains:['mood'],        src:['eva','pb'],   notes:['Checking suit seals and battery levels against the list.','Laying out tools and tethers for the spacewalk.']},
  eva:        {name:'Spacewalk',                 load:'High',   records:true,  explains:['body','mood'], src:['eva'],        notes:['Outside the airlock, moving hand over hand along the truss with tools.','At the worksite, driving bolts in stiff pressurised gloves.']},
  drill:      {name:'Emergency drill',           load:'High',   records:true,  explains:['body','mood'], src:[],             notes:['Alarm sounding. Moving fast to the muster point and putting on a mask.','Running the fire response checklist with the crew.']}
};
const WORK = ['science','maintenance','cargo','research','science','sampling','maintenance','outreach'];
function hashInt(s){let x=2166136261;for(let i=0;i<s.length;i++){x^=s.charCodeAt(i);x=Math.imul(x,16777619)}return x>>>0}
// Day template follows the published ISS pattern: wake 06:00, planning calls morning and evening, a one-hour midday meal,
// about 2.5 h of exercise in two sessions, sleep scheduled 21:30 to 06:00, Saturday housekeeping, Sunday off duty.
function activityAt(pid, day, hour){
  if(hour===null) return 'sleep';
  if(day===30&&hour>=10&&hour<11) return 'drill';
  if(pid==='erik'&&day===73&&hour>=10&&hour<12) return 'science';
  const t=TASKS.find(t=>t.day===day&&t.who.includes(pid));
  if(t){ const eva=t.name==='Spacewalk', len=eva?6.5:2;
    if(hour>=t.hour&&hour<t.hour+len) return eva?'eva':t.name.includes('Robotic')?'robotics':'piloting'; }
  if(hour<6||hour>=21.5) return 'sleep';
  if(hour<7) return 'hygiene';
  if(hour<7.5||(hour>=13&&hour<14)||(hour>=19.5&&hour<20.5)) return 'meal';
  if(hour<8||(hour>=19&&hour<19.5)) return 'conference';
  if(hour>=20.5) return hashInt(pid+day)%4===0?'call':'personal';
  const dow=day%7;
  if(dow===0) return hashInt(pid+day+Math.floor(hour))%5===0?'call':'personal';          // Sunday: off duty
  if(dow===6) return hour<11?'housekeeping':'personal';                                    // Saturday
  const slot=[8,10,14,16].filter(s=>hour>=s).length-1, idx=CREW.findIndex(c=>c.id===pid);
  if(slot===(idx+day)%4) return 'aerobic';
  if(slot===(idx+day+2)%4) return 'resistive';
  if(pid==='tomas'&&day>=85&&day<=92) return 'evaprep';
  const w=WORK[hashInt(pid+'|'+day+'|'+slot)%WORK.length];
  return w==='outreach'&&hashInt(pid+day)%3?'science':w;
}
const PLANTED_TIME = {'73|erik|rhr':10.7,'73|erik|hrv':10.7,'93|rhr':7.2,'101|rhr':14.3,'101|hrv':14.3,'30|rhr':10.3};
function eventTime(pid, day, m){
  if(m.domain==='sleep') return null;                                   // measured overnight
  const k=PLANTED_TIME[day+'|'+pid+'|'+m.id]??PLANTED_TIME[day+'|'+m.id];
  return k!==undefined?k:8+(hashInt(pid+day+m.id)%22)/2;                // simulated: daily data has no real timestamp
}
function activityRecord(pid, day, m){
  const time=eventTime(pid,day,m), id=activityAt(pid,day,time), a=ACTIVITIES[id];
  return {id,time,name:a.name,recorded:a.records,explains:a.explains.includes(m.domain),summary:a.notes[hashInt(pid+day+id)%a.notes.length]};
}
const clock=h=>h===null?'Night':String(Math.floor(h)).padStart(2,'0')+':'+String(Math.round((h%1)*60)).padStart(2,'0');

/* ---------- Sudden changes: log, then ask "does context explain it?" and "is it everyone?" ---------- */
const SPIKE = 3.5, JUMP = 3;      // far from own normal, and far from own last week
function suddenLog(people, uptoDay){
  const rows=[], last={};
  for(let day=2;day<=uptoDay;day++){
    const i=day-1+BASE;
    METRICS.forEach(m=>{
      const hits=people.filter(p=>{const z=p.z[m.id][i];return Math.abs(z)>=SPIKE&&Math.abs(z-mean(p.z[m.id].slice(i-7,i)))>=JUMP});
      if(!hits.length)return;
      const dir=Math.sign(hits[0].z[m.id][i]);
      const same=people.filter(p=>p.z[m.id][i]*dir>=2);
      const crewWide=same.length>people.length/2;
      const env=EVENTS.find(e=>e.who==='all'&&day>=e.from&&day<=e.to&&e.domains.includes(m.domain));
      const add=(key,row)=>{ if(last[key]&&day-last[key]<=2){last[key]=day;return} last[key]=day; rows.push(row); };
      if(crewWide){
        const acts=same.map(p=>activityRecord(p.id,day,m)), kinds=[...new Set(acts.map(a=>a.name))];
        const shared=kinds.length===1&&acts[0].explains;
        add('crew|'+m.id,{day,metric:m,who:same.map(p=>p.id),n:same.length,dir,crewWide:true,time:acts[0].time,
          activity:kinds.length===1?'Everyone: '+kinds[0]:kinds.length+' different activities',summary:kinds.length===1?acts[0].summary:kinds.slice(0,4).join(', ')+(kinds.length>4?' and more':''),
          context:env?env.label:shared?kinds[0]:null,verdict:env?'env':shared?'context':'crew-unknown'});
      }else hits.forEach(p=>{
        const own=EVENTS.find(e=>e.who===p.id&&day>=e.from&&day<=e.to&&e.domains.includes(m.domain));
        const task=(m.domain==='body'||m.domain==='mood')?TASKS.find(t=>t.day===day&&t.who.includes(p.id)):null;
        const act=activityRecord(p.id,day,m);
        const ctx=env?env.label:own?own.label:task?task.name:act.explains?act.name:null;
        add(p.id+'|'+m.id,{day,metric:m,who:[p.id],n:same.length,dir:Math.sign(p.z[m.id][i]),crewWide:false,time:act.time,activity:act.name,summary:act.summary,recorded:act.recorded,
          context:ctx,verdict:ctx?'context':'unexplained',
          value:p.raw[m.id][i],normal:p.base[m.id].mean,z:p.z[m.id][i]});
      });
    });
  }
  return rows;
}

// What the astronaut is shown: 0 usual, 1 lower than usual, 2 safety alert
const PEOPLE = CREW.map(analyse);
