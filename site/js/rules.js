/* ================= Sources and thresholds: the only place status lines are defined ================= */
const SRC = {
  std:     ['NASA-STD-3001 technical brief: Environmental Control and Life Support System','https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-002-eclss.pdf'],
  stdA:    ['NASA-STD-3001 technical brief: ECLSS, Rev A (CO2 and health limits)','https://www.nasa.gov/wp-content/uploads/2023/07/eclss-technical-brief-ochmo.pdf'],
  co2:     ['Law and Alexander, CO2 on the International Space Station: an operations update (NASA NTRS)','https://ntrs.nasa.gov/archive/nasa/casi.ntrs.nasa.gov/20150019624.pdf'],
  smac:    ['NASA NTRS 20150021777: CO2 exposure limits and crew headaches','https://ntrs.nasa.gov/api/citations/20150021777/downloads/20150021777.pdf'],
  noise:   ['Goodman, Acoustics in habitable space enclosures (NASA NTRS 20090043801)','https://ntrs.nasa.gov/api/citations/20090043801/downloads/20090043801.pdf'],
  cq:      ['Allen, ISS acoustics overview with crew quarters levels (NASA NTRS 20170011521)','https://ntrs.nasa.gov/api/citations/20170011521/downloads/20170011521.pdf'],
  jones:   ['Jones 2022, Sleep: short sleep and reaction speed in 24 ISS astronauts','https://pmc.ncbi.nlm.nih.gov/articles/PMC8919197'],
  barger:  ['Barger 2014, Lancet Neurology: sleep before, during and after spaceflight','https://pmc.ncbi.nlm.nih.gov/articles/PMC4188436'],
  esa:     ['ESA Columbus Control Centre blog: the astronaut daily schedule','https://outpost42.esa.int/blog/the-astronaut-daily-schedule/'],
  crewtime:['NASA NTRS 20170000487: executing human research on the ISS (typical crew day, 6.5 h workday)','https://ntrs.nasa.gov/api/citations/20170000487/downloads/20170000487.pdf'],
  ssla:    ['Maida 2016, Introduction to the solid-state interior lighting system for ISS (NASA NTRS)','https://ntrs.nasa.gov/api/citations/20160005080/downloads/20160005080.pdf'],
  fms:     ['NASA Fatigue Management Services: lighting and night glasses guidance for ISS crew quarters (NTRS)','https://ntrs.nasa.gov/api/citations/20200011570/downloads/20200011570.pdf'],
  lighting:['NASA Lighting Effects study: dynamic lighting schedule for the ISS (NTRS)','https://ntrs.nasa.gov/api/citations/20160006727/downloads/20160006727.pdf'],
  vss:     ['Psychiatric News 2008: the Virtual Space Station self-guided program for astronauts','https://psychiatryonline.org/doi/10.1176/pn.43.23.0006'],
  vss2:    ['Carter et al. 2005, An interactive media program for managing psychosocial problems on long-duration spaceflights','https://vufind-test.katalog.k.utb.cz/SummonRecord/FETCH-LOGICAL-p271t-39585cc4e25b861084013db3f38a840bc30e8ba5180b15f3621d3cddf637a1e72'],
  kanas:   ['Kanas, Gushin and Yusupova 2021, Whither the third quarter phenomenon?','https://asma.kglmeridian.com/downloadpdf/view/journals/amhp/92/8/article-p689.pdf'],
  delay:   ['ESA Mars Express blog: spacecraft event time vs Earth receive time','https://blogs.esa.int/mex/?p=257'],
  eda:     ['NASA Open Science Data Repository: Environmental Data App','https://visualization.osdr.nasa.gov/eda']
};
const THRESHOLDS = {
  personal:  {name:'Personal readings: tests, check-in ratings, wearable, proximity and voice (all except sleep duration)', measure:'7-day average against the person\'s own pre-flight normal',
              warn:-2.0, crit:-3.0, unit:'SD', basis:'demo', lines:'Warning at 2 SD worse than own normal. Critical at 3 SD worse.',
              why:'No published cut-off exists for a personal baseline. These lines are demo rules.'},
  sleep:     {name:'Sleep duration', measure:'Average of the last 3 nights', warn:5.0, crit:4.0, unit:'h', basis:'demo', lines:'Warning at 5 h or less. Critical at 4 h or less.',
              why:'Published work links nights of 6 h or less with slower reactions, but ISS crews average about 6 h, so a 6 h line would keep half the crew on Warning. The demo lines sit lower.', src:['jones','barger']},
  temp:      {name:'Cabin temperature', measure:'Latest reading', ok:[20,25], limit:[18,27], unit:'°C', basis:'source', lines:'Normal 20 to 25 °C. Critical outside 18 to 27 °C.',
              why:'Normal is NASA\'s crew performance zone. Critical is outside NASA\'s crew health limits.', src:['std']},
  humidity:  {name:'Cabin humidity', measure:'Latest reading', ok:[30,60], limit:[25,75], unit:'%', basis:'source', lines:'Normal 30 to 60 %. Critical outside 25 to 75 %.',
              why:'Normal is NASA\'s crew performance zone. Critical is outside NASA\'s crew health limits.', src:['std']},
  co2:       {name:'Cabin CO₂', measure:'Daily average', warn:3.0, crit:5.3, unit:'mmHg', basis:'source', lines:'Warning above 3 mmHg. Critical above 5.3 mmHg.',
              why:'3 mmHg is NASA\'s one-hour average limit and the newer ISS operating limit. 5.3 mmHg is the older long-duration limit.', src:['stdA','co2','smac']},
  noise:     {name:'Sleep station noise', measure:'Average level across the sleep window', warn:50, crit:65, unit:'dBA', basis:'mixed', lines:'Warning above 50 dBA. Critical above 65 dBA.',
              why:'About 50 dBA is the sleep limit used for the ISS. The 65 dBA critical line is a demo rule.', src:['noise','cq']},
  light:     {name:'Light before sleep', measure:'Level in the hour before the sleep window', warn:150, crit:null, unit:'lux', basis:'demo', lines:'Warning above 150 lux.',
              why:'Demo rule. NASA guidance for ISS crew quarters is to switch to warm pre-sleep lighting 2 hours before sleep.', src:['fms']},
  workload:  {name:'Workload', measure:'Scheduled duty hours in the last 7 days, and days since a full day off', warn:45, crit:55, offWarn:10, offCrit:14, unit:'h', basis:'mixed',
              lines:'Warning at 45 h or 10 days without a day off. Critical at 55 h or 14 days.',
              why:'The ISS scheduling standard is a 6.5-hour workday, about 35.5 h a week with Saturday housekeeping. The warning and critical lines are demo rules.', src:['crewtime','esa']},
  clock:     {name:'Body clock vs schedule', measure:'Estimated gap between the body clock and tonight\'s sleep window', warn:1.5, crit:3.0, unit:'h', basis:'demo',
              lines:'Warning at a 1.5 h gap. Critical at 3 h.',
              why:'Demo model and demo rule. The body clock is assumed to move about 1 h a day earlier or 1.5 h a day later toward the sleep schedule. It is an estimate from sleep timing, not a measurement; NASA\'s lighting study measured circadian phase from urine samples.', src:['lighting']},
  trend:     {name:'Gradual decline (early sign, not a status)', measure:'Slope of the daily score over 21 days, plus the 7-day average', slope:-0.07, level:-1.0, minInArea:2, unit:'SD', basis:'demo',
              lines:'Flagged when two readings in the same area have slid 0.07 SD a day or faster for 3 weeks and are already 1 SD below normal.',
              why:'Demo rule. It catches a slow slide before the Warning line. Needing two readings to agree cut false early signs on steady crew from 190 person-days to 10 in this simulation. It does not assume a fixed "third-quarter" dip, which a 2021 review found little evidence for.', src:['kanas']},
  pairs:     {name:'Crew pair contact (flight surgeon only)', measure:'Time two crewmates spend near each other, last 7 days against their first 30 days in flight', line:0.4, basis:'demo',
              lines:'Flagged at 40 % of usual or less, when both are still normal with the rest of the crew.',
              why:'Demo rule. It looks for two people avoiding each other, which totals per person can hide.'},
  stale:     {name:'Missing or stale reading', measure:'Age of the newest reading', hours:24, basis:'demo', lines:'Unavailable after 24 hours.',
              why:'Demo rule. A reading older than 24 hours is shown as Unavailable and does not count toward status.'},
  shortNight:{name:'Short night (event log only)', measure:'One night', line:6, under:1, unit:'h', basis:'mixed', lines:'Logged at 6 h or less and 1 h under own normal.',
              why:'Logged as an event, not a status. Nights of 6 h or less went with slower reaction speed in ISS astronauts. The extra 1 h rule is a demo rule that keeps the log readable.', src:['jones']}
};
const RANK = {normal:0, warning:1, critical:2};
const WORD = {normal:'Normal', warning:'Warning', critical:'Critical', unavailable:'Unavailable'};
const SLEEP_WINDOW = {start:21.5, end:6, hours:8.5};      // scheduled 21:30 to 06:00 (ESA)
const SOURCE_OF = {rt:'Test', wm:'Test', mood:'Check-in', stress:'Check-in', irritability:'Check-in', sleeph:'Wearable', sleepe:'Wearable', hrv:'Wearable', rhr:'Wearable',
                   crew:'Proximity badge', speech:'Voice (radio calls)', pitch:'Voice (radio calls)', pauses:'Voice (radio calls)'};

/* ================= Demo data added for this build (all simulated) ================= */
const GAPS = [
  {pid:'leila', ids:['hrv','rhr','sleeph','sleepe'], from:88, to:90, why:'wearable offline'},
  {pid:'sofia', ids:['rt','wm'], from:33, to:33, why:'test not taken'}
];
const NIGHT_PLANTS = {
  'tomas|26': {duty:{name:'Maintenance: cabin air filter change', start:21.5, end:23, was:'16:00 to 17:30', reason:'moved after a morning task overran'}},
  'erik|38':  {alarm:{t:2.2, min:6, db:72, what:'A caution tone', note:'It was cleared as a false smoke alarm.'}},
  'leila|71': {warm:{from:23, to:3.5, peak:26.4}}
};
const gapOf=(pid,mid,day)=>GAPS.find(g=>g.pid===pid&&g.ids.includes(mid)&&day>=g.from&&day<=g.to);
const val=(p,mid,day)=>gapOf(p.id,mid,day)?null:p.raw[mid][day-1+BASE];
const zval=(p,mid,day)=>gapOf(p.id,mid,day)?null:p.z[mid][day-1+BASE];
function lastN(fn,day,n){const a=[];for(let d=day-n+1;d<=day;d++){if(d>=-BASE+1){const v=fn(d);if(v!==null)a.push(v)}}return a}
const hh=h=>h===null||h===undefined?'':String(Math.floor(((h%24)+24)%24)).padStart(2,'0')+':'+String(Math.round((((h%1)+1)%1)*60)).padStart(2,'0');
const unit01=k=>(hashInt(k)%1000)/1000;
const addMin=(time,min)=>{const [H,M]=time.split(':').map(Number),t=(H*60+M+min+1440)%1440;return String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0')};

function cabin(day){
  let co2=2.2+0.5*unit01('co2'+day);
  if(day>=52&&day<=56) co2=[4.4,5.1,5.6,5.0,3.6][day-52]; if(day===57) co2=2.9;
  return {temp:22.2+1.6*unit01('t'+day), humidity:41+13*unit01('h'+day), co2};
}
function night(pid, day){            // the night that ended on the morning of `day`
  const key=pid+'|'+day, P=NIGHT_PLANTS[key]||{}, c=cabin(day-1);
  const light=(pid==='kenji'&&day>=62&&day<=90)?{lux:320,until:21.33}:null;
  return {duty:P.duty||null, alarm:P.alarm||null, warm:P.warm||null, light,
    tempPeak:P.warm?P.warm.peak:c.temp+0.5*unit01('nt'+key), humidity:c.humidity, co2:c.co2,
    noise:43+6*unit01('nn'+key), lux:light?light.lux:35+70*unit01('nl'+key)};
}

/* ================= Status: one rule per reading, the rule text is kept with the result ================= */
function band(v,T){ return (v<T.limit[0]||v>T.limit[1])?'critical':(v<T.ok[0]||v>T.ok[1])?'warning':'normal'; }
const DOMAIN_ORDER=['attention','mood','sleep','body','social'];
const ORDERED=METRICS.slice().sort((a,b)=>DOMAIN_ORDER.indexOf(a.domain)-DOMAIN_ORDER.indexOf(b.domain));
const _rc={};
function readings(p, day){
  const key=p.id+'|'+day; if(_rc[key]) return _rc[key];
  const rows=[], T=THRESHOLDS;
  ORDERED.forEach(m=>{
    const src=SOURCE_OF[m.id], label=src==='Check-in'?'Self-reported (simulated)':'Simulated';
    const x=val(p,m.id,day), base={id:m.id,name:m.name,group:'You',label,source:src,domain:m.domain,trend:trendOf(p,m.id,day)};
    if(x===null){ const g=gapOf(p.id,m.id,day);
      rows.push({...base,value:'No reading',level:'unavailable',basis:'demo',rule:`No reading in the last ${T.stale.hours} hours (${g.why}).`}); return; }
    if(m.id==='sleeph'){
      const a=mean(lastN(d=>val(p,'sleeph',d),day,3)), lvl=a<=T.sleep.crit?'critical':a<=T.sleep.warn?'warning':'normal';
      rows.push({...base,value:x.toFixed(1)+' h last night',level:lvl,basis:'demo',plain:`Your sleep has averaged ${a.toFixed(1)} h over 3 nights`,
        rule:`3-night average is ${a.toFixed(1)} h. Warning at ${T.sleep.warn} h or less, Critical at ${T.sleep.crit} h or less.`}); return; }
    const a=mean(lastN(d=>zval(p,m.id,d),day,7)), lvl=a<=T.personal.crit?'critical':a<=T.personal.warn?'warning':'normal';
    rows.push({...base,value:x.toFixed(m.dp)+' '+m.unit,level:lvl,basis:'demo',plain:`Your ${m.name.toLowerCase()} has been ${m.dir>0?'lower':'higher'} than usual this week`,
      rule:`7-day average is ${Math.abs(a).toFixed(1)} SD ${a<0?'worse than':'better than'} own normal (${p.base[m.id].mean.toFixed(m.dp)} ${m.unit}). Warning at ${-T.personal.warn} SD worse, Critical at ${-T.personal.crit} SD worse.`});
  });
  const w=workload(p.id,day), wl=(w.total>=T.workload.crit||w.sinceOff>=T.workload.offCrit)?'critical':(w.total>=T.workload.warn||w.sinceOff>=T.workload.offWarn)?'warning':'normal';
  rows.push({id:'workload',name:'Workload, last 7 days',group:'You',label:'Simulated',source:'Schedule',value:w.total.toFixed(1)+' h',level:wl,basis:'mixed',
    plain:`You have worked ${w.total.toFixed(0)} h in the last 7 days`,
    rule:`${w.total.toFixed(1)} h of duty in 7 days${w.why.length?' ('+w.why.join(', ')+')':''}; ${w.sinceOff} day${w.sinceOff===1?'':'s'} since a full day off. ${T.workload.lines}`});
  const c=clockState(p.id,day), g=Math.abs(c.gap), cl=g>=T.clock.crit?'critical':g>=T.clock.warn?'warning':'normal';
  rows.push({id:'clock',name:'Body clock vs schedule',group:'You',label:'Estimated',source:'Schedule and wearable',value:(g<0.05?'In step':g.toFixed(1)+' h '+(c.gap<0?'behind':'ahead')),level:cl,basis:'demo',
    plain:`Tonight's sleep window is ${g.toFixed(1)} h ${c.gap<0?'earlier':'later'} than your body clock is likely set for`,
    rule:`Estimated gap ${g.toFixed(1)} h between body clock and tonight's sleep window (${hh(c.tonight.start)} to ${hh(c.tonight.end)}${c.tonight.why?', moved for '+c.tonight.why:''}). ${T.clock.lines}`});
  const cb=cabin(day), n=night(p.id,day);
  const env=(id,name,v,dp,lvl,rule,basis,plain)=>rows.push({id,name,group:'Cabin',label:'Simulated',source:'Cabin sensors',value:v.toFixed(dp)+' '+T[id].unit,level:lvl,rule,basis,plain});
  env('temp','Cabin temperature',cb.temp,1,band(cb.temp,T.temp),T.temp.lines,'source','Cabin temperature is outside the comfort zone');
  env('humidity','Cabin humidity',cb.humidity,0,band(cb.humidity,T.humidity),T.humidity.lines,'source','Cabin humidity is outside the comfort zone');
  env('co2','Cabin CO₂',cb.co2,1,cb.co2>T.co2.crit?'critical':cb.co2>T.co2.warn?'warning':'normal',T.co2.lines,'source','Cabin CO₂ is above the limit');
  env('noise','Sleep station noise',n.noise,0,n.noise>T.noise.crit?'critical':n.noise>T.noise.warn?'warning':'normal',T.noise.lines+' Averaged over the sleep window.','mixed','Your sleep station was noisy last night');
  env('light','Light before sleep',n.lux,0,n.lux>T.light.warn?'warning':'normal',T.light.lines+' Measured in the hour before the sleep window.','demo','Lights were bright before your sleep window');
  return _rc[key]=rows;
}
function personStatus(p, day){
  const rows=readings(p,day), scored=rows.filter(r=>r.level!=='unavailable');
  const level=scored.reduce((a,r)=>RANK[r.level]>RANK[a]?r.level:a,'normal');
  const sl=rows.filter(r=>r.trend&&r.trend.sliding&&r.level==='normal'), per={}; sl.forEach(r=>per[r.domain]=(per[r.domain]||0)+1);
  const early=sl.filter(r=>per[r.domain]>=THRESHOLDS.trend.minInArea);
  return {level, rows, drivers:level==='normal'?[]:scored.filter(r=>r.level===level), unavailable:rows.filter(r=>r.level==='unavailable'),
          early, earlyAreas:[...new Set(early.map(r=>r.domain))]};
}

/* ================= Investigator: symptoms and recorded events -> what to check ================= */
const SYMPTOMS = {sleep:'Difficulty sleeping', fatigue:'Unusual fatigue', overwhelmed:'Feeling overwhelmed', focus:'Trouble concentrating',
                  irritable:'Irritable or short-tempered', anxious:'Anxious or on edge', low:'Low or flat mood', tension:'Tension with a crewmate'};
function investigate(p, day, symptoms){
  const F=[], n=night(p.id,day), T=THRESHOLDS, slept=val(p,'sleeph',day), has=s=>symptoms.includes(s);
  const sleepy=has('sleep')||has('fatigue')||has('focus');
  const nameOf=id=>PEOPLE.find(q=>q.id===id).name;
  if(sleepy){
    if(n.duty){ const mins=Math.round((Math.min(n.duty.end,24+SLEEP_WINDOW.end)-Math.max(n.duty.start,SLEEP_WINDOW.start))*60), opp=SLEEP_WINDOW.hours-mins/60;
      F.push({factor:'Late duty', labels:['Schedule: simulated'].concat(slept!==null?['Sleep: simulated wearable']:[]),
        what:`${n.duty.name.split(':')[0]} overlapped the first ${mins} minutes of your planned sleep window (${hh(n.duty.start)} to ${hh(n.duty.end)}).`,
        why:`That cut your sleep opportunity from ${SLEEP_WINDOW.hours} h to ${opp.toFixed(1)} h.`+(slept!==null?` Your wearable recorded ${slept.toFixed(1)} h of sleep.`:' There is no wearable reading, so the schedule is the only evidence.'),
        next:'Review tonight\'s duty schedule with the crew lead.'}); }
    const c=clockState(p.id,day), sw=sleepWindow(p.id,day);
    if(Math.abs(c.gap)>=T.clock.warn||sw.shift){
      F.push({factor:'Body clock', labels:['Schedule: simulated','Body clock: estimated'], tool:'lighting',
        what:sw.shift?`Your sleep window moved ${Math.abs(sw.shift)} h ${sw.shift<0?'earlier':'later'} for ${sw.why} (${hh(sw.start)} to ${hh(sw.end)}).`
                     :`Tonight's sleep window is about ${Math.abs(c.gap).toFixed(1)} h ${c.gap<0?'earlier':'later'} than your body clock is likely set for.`,
        why:`Your body clock is estimated to be ${Math.abs(c.gap).toFixed(1)} h out of step with tonight's schedule. Sleeping out of step makes it harder to fall asleep and to stay alert.`,
        next:'Follow tonight\'s lighting plan.'}); }
    if(n.alarm) F.push({factor:'Interruption', labels:['Cabin sensors: simulated'],
        what:`${n.alarm.what} sounded at ${hh(n.alarm.t)} for ${n.alarm.min} minutes, at ${n.alarm.db} dBA near your sleep station. ${n.alarm.note}`,
        why:`It fell inside your sleep window, and it was well above the ${T.noise.warn} dBA sleep limit.`,
        next:'Nothing to change if it was a one-off. If it happens again, ask ground to review that alarm.'});
    if(n.warm) F.push({factor:'Temperature', labels:['Cabin sensors: simulated'],
        what:`Your sleep station was above ${T.temp.ok[1]} °C from ${hh(n.warm.from)} to ${hh(n.warm.to)}, peaking at ${n.warm.peak.toFixed(1)} °C.`,
        why:`That is warmer than the ${T.temp.ok[0]} to ${T.temp.ok[1]} °C zone NASA sets for crew performance.`,
        next:'Check the vent and airflow in your sleep station before tonight.'});
    if(n.co2>T.co2.warn) F.push({factor:'Cabin air', labels:['Cabin sensors: simulated'],
        what:`Cabin CO₂ averaged ${n.co2.toFixed(1)} mmHg yesterday, above the ${T.co2.warn} mmHg limit.`,
        why:'ISS crews have reported sleep problems and fatigue when CO₂ is raised.',
        next:'Tell the crew lead if you also have a headache. Ground is already tracking the CO₂ level.'});
    if(n.light) F.push({factor:'Lighting', labels:['Cabin sensors: simulated'], tool:'lighting',
        what:`Lights near your sleep station were at ${n.light.lux} lux until ${hh(n.light.until)}.`,
        why:'Bright, blue-rich light close to sleep time can delay falling asleep.',
        next:'Switch to pre-sleep lighting 2 hours before your sleep window.'});
  }
  if(has('overwhelmed')||has('fatigue')||has('irritable')||has('low')||has('anxious')){
    const w=workload(p.id,day);
    if(w.total>=T.workload.warn||w.sinceOff>=T.workload.offWarn) F.push({factor:'Workload', labels:['Schedule: simulated'],
        what:`You have worked about ${w.total.toFixed(0)} h in the last 7 days${w.why.length?' ('+w.why.join(', ')+')':''}, against a standard week of about 35.5 h.`,
        why:'Long weeks with little recovery time wear down mood and attention.',
        next:'Review the next duty block with the crew lead.'});
  }
  const sz=zval(p,'stress',day-1), sx=val(p,'stress',day-1);
  if(sz!==null&&sz<=-1.8) F.push({factor:'Stress', labels:['Stress rating: self-reported'], tool:'calm',
        what:`You rated your stress ${sx.toFixed(0)} out of 10 yesterday. Your usual is about ${p.base.stress.mean.toFixed(0)}.`,
        why:'High stress in the evening makes it harder to fall asleep and to switch off.',
        next:'Try the two-minute reset tonight.'});
  [['irritable','irritability','Irritability ratings'],['low','mood','Mood ratings'],['anxious','stress','Stress ratings']].forEach(([s,mid,label])=>{
    if(!has(s)) return; const t=trendOf(p,mid,day);
    if(t.sliding||t.now<=-1.5) F.push({factor:label.split(' ')[0], labels:[label+': self-reported (simulated)'], tool:s==='low'?'solve':'calm',
        what:`Your ${label.toLowerCase()} have been ${mid==='mood'?'lower':'higher'} than your usual${t.sliding?' and moving that way for about 3 weeks':' this week'}.`,
        why:'A change that builds slowly is easy to miss from one day to the next.',
        next:s==='low'?'Try the problem-solving steps, or request a private follow-up.':'Try the two-minute reset, or request a private follow-up.'});
  });
  if(has('tension')){
    pairFlags(day).filter(f=>f.a===p.id||f.b===p.id).forEach(f=>{ const other=nameOf(f.a===p.id?f.b:f.a);
      F.push({factor:'Crew contact', labels:['Proximity badges: simulated'], tool:'conflict',
        what:`Over the last week you have spent about ${Math.round(f.share*100)} % of your usual time near ${other}, while your time with the rest of the crew is normal.`,
        why:'Avoiding one person can let a disagreement harden. Small crews have nowhere else to go.',
        next:'Try the conflict conversation guide, or ask the crew lead for a team debrief.'}); });
  }
  if(has('overwhelmed')){
    const t=TASKS.find(t=>t.who.includes(p.id)&&t.day>=day&&t.day<=day+3);
    if(t) F.push({factor:'Coming task', labels:['Schedule: simulated'],
        what:`${t.name} is scheduled for day ${t.day} at ${hh(t.hour)}${t.day===day?', today':', in '+(t.day-day)+' day'+(t.day-day>1?'s':'')}.`,
        why:'The run-up to a critical task adds preparation work on top of the normal day.',
        next:'Review the next duty block with the crew lead.'});
  }
  if(has('focus')){
    const a=mean(lastN(d=>val(p,'sleeph',d),day,3));
    if(a<=6&&!F.some(f=>f.factor==='Late duty')) F.push({factor:'Short sleep', labels:['Sleep: simulated wearable'],
        what:`You have averaged ${a.toFixed(1)} h of sleep over the last 3 nights.`,
        why:'Nights of 6 h or less have gone with slower reaction speed in ISS crews.',
        next:'Ask for a second check on safety-critical steps today.'});
  }
  const tool=has('tension')?'conflict':(has('low')||has('overwhelmed'))?'solve':(has('anxious')||has('irritable'))?'calm':null;
  const fallback=has('tension')?'Try the conflict conversation guide, or ask the crew lead for a team debrief.'
                :has('low')||has('overwhelmed')?'Try the problem-solving steps, or request a private follow-up below.'
                :has('anxious')||has('irritable')?'Try the two-minute reset, or request a private follow-up below.'
                :'Log how tonight goes. A private follow-up is available below.';
  return {findings:F, unclear:F.length===0, next:F.length?F[0].next:fallback, tool:F.length?(F[0].tool||tool):tool};
}

/* ================= Entries made in the demo (browser storage) ================= */
const KEY='ahm-demo-v4';
const EMPTY=()=>({alerts:[],reports:[],checkins:[],followups:[],rtchecks:[],remote:{},chats:{},shares:[],assessments:[],adrafts:{}});
let store=EMPTY();
function load(){ try{ const s=JSON.parse(localStorage.getItem(KEY)); if(s&&Array.isArray(s.alerts)) store={...EMPTY(),...s}; }catch(e){} }
function save(){ try{ localStorage.setItem(KEY,JSON.stringify(store)); }catch(e){} }
function stamp(){ const d=new Date(); return {t:d.getHours()+d.getMinutes()/60, time:String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')}; }

/* ================= One timeline for everything ================= */
// viewer: 'self' (the astronaut), 'crew' (crewmates), 'director' or 'surgeon' (ground)
const _sl={}; const sudden=day=>_sl[day]||(_sl[day]=suddenLog(PEOPLE,day));
function timeline(o){
  const ev=[], from=Math.max(2,o.day-o.span+1), people=o.pid?PEOPLE.filter(p=>p.id===o.pid):PEOPLE, T=THRESHOLDS, health=o.viewer!=='crew';
  const add=e=>{ if(e.day>=from&&e.day<=o.day) ev.push(e); };
  for(let d=from; d<=o.day+1; d++){
    const c=cabin(d);
    if(c.co2>T.co2.warn) add({day:d,t:9,kind:'Cabin',source:'Cabin sensors',label:'Simulated',who:'Whole crew',what:`Cabin CO₂ at ${c.co2.toFixed(1)} mmHg, above the ${T.co2.warn} mmHg line.`,expected:'no',next:'Ground: work the scrubber fault. Crew: report headaches.'});
    if(d===52) add({day:d,t:8.5,kind:'Cabin',source:'Ground log',label:'Simulated',who:'Whole crew',what:'CO₂ scrubber fault logged.',expected:'no',next:'Repair in progress.'});
    people.forEach(p=>{
      TASKS.filter(t=>t.day===d&&t.who.includes(p.id)).forEach(t=>add({day:d,t:t.hour,kind:'Schedule',source:'Mission schedule',label:'Simulated',who:p.name,what:`${t.name} at ${hh(t.hour)}.`,expected:'yes',next:''}));
      const sw=sleepWindow(p.id,d+1); if(sw.shift&&!sleepWindow(p.id,d).shift)
        add({day:d,t:8,kind:'Schedule',source:'Mission schedule',label:'Simulated',who:p.name,what:`Sleep window moved ${Math.abs(sw.shift)} h ${sw.shift<0?'earlier':'later'} to ${hh(sw.start)} to ${hh(sw.end)} for ${sw.why}.`,expected:'yes',next:'Follow the lighting plan for the shift.'});
      const W=WORK_PLANTS.find(w=>w.who.includes(p.id)&&w.from===d);
      if(W) add({day:d,t:8.2,kind:'Schedule',source:'Mission schedule',label:'Simulated',who:p.name,what:`Extra duty added for ${W.why}, days ${W.from} to ${W.to}${W.weekend?', including the weekend':''}.`,expected:'yes',next:'Crew lead: protect recovery time afterwards.'});
      const n=night(p.id,d);
      if(n.duty) add({day:d-1,t:n.duty.start,kind:'Schedule',source:'Mission schedule',label:'Simulated',who:p.name,what:`Schedule change: ${n.duty.name} moved to ${hh(n.duty.start)} to ${hh(n.duty.end)} (was ${n.duty.was}; ${n.duty.reason}). It overlaps the planned sleep window.`,expected:'no',next:'Crew lead: review tonight\'s duty schedule.'});
      if(n.alarm) add({day:d,t:n.alarm.t,kind:'Cabin',source:'Cabin sensors',label:'Simulated',who:p.name,what:`${n.alarm.what} sounded at ${hh(n.alarm.t)} for ${n.alarm.min} minutes, ${n.alarm.db} dBA at the sleep station. ${n.alarm.note}`,expected:'no',next:'Ground: review the alarm if it repeats.'});
      if(n.warm) add({day:d-1,t:n.warm.from,kind:'Cabin',source:'Cabin sensors',label:'Simulated',who:p.name,what:`Sleep station above ${T.temp.ok[1]} °C from ${hh(n.warm.from)} to ${hh(n.warm.to)}, peak ${n.warm.peak.toFixed(1)} °C.`,expected:'no',next:'Check the sleep station vent and airflow.'});
      if(n.light&&health&&d===62) add({day:d-1,t:20.5,kind:'Cabin',source:'Cabin sensors',label:'Simulated',who:p.name,what:`Lights near the sleep station at ${n.light.lux} lux until ${hh(n.light.until)}. This repeats most nights after this.`,expected:'',next:'Switch to pre-sleep lighting 2 hours before sleep.'});
      const s=val(p,'sleeph',d);
      if(health&&s!==null&&s<=T.shortNight.line&&s<=p.need-T.shortNight.under) add({day:d,t:6,kind:'Reading',source:'Wearable',label:'Simulated',who:p.name,what:`Short night: ${s.toFixed(1)} h of sleep, against a usual ${p.need.toFixed(1)} h.`,expected:n.duty||sleepWindow(p.id,d).shift?'no':'',next:''});
      const g=GAPS.find(g=>g.pid===p.id&&g.from===d);
      if(g&&health) add({day:d,t:7,kind:'Reading',source:g.ids.includes('rt')?'Test':'Wearable',label:'Simulated',who:p.name,what:`Readings unavailable: ${g.why}${g.to>g.from?' until day '+g.to:''}.`,expected:'no',next:'Check the device and restart it.'});
      if(health&&d>=22){ const st=personStatus(p,d), prev=personStatus(p,d-1);
        st.earlyAreas.filter(a=>!prev.earlyAreas.includes(a)).forEach(a=>{ const rs=st.early.filter(r=>r.domain===a);
          add({day:d,t:7.5,kind:'Trend',source:[...new Set(rs.map(r=>r.source))].join(', '),label:'Simulated',who:p.name,what:`Early sign: ${rs.map(r=>r.name.toLowerCase()).join(' and ')} have been sliding together for about 3 weeks, still inside their Normal range.`,expected:'',next:'Keep an eye on it. Mention it at the next private conference.'}); }); }
    });
  }
  if(o.viewer==='surgeon'){ let prevFlags=pairFlags(from-1);
    for(let d=from; d<=o.day; d++){ const f=pairFlags(d);
      f.filter(x=>!prevFlags.some(y=>y.a===x.a&&y.b===x.b)).filter(x=>!o.pid||x.a===o.pid||x.b===o.pid).forEach(x=>add({day:d,t:7.6,kind:'Crew contact',source:'Proximity badges',label:'Simulated',
        who:PEOPLE.find(p=>p.id===x.a).name+' and '+PEOPLE.find(p=>p.id===x.b).name,what:`Time near each other down to ${Math.round(x.share*100)} % of their usual, while both are normal with the rest of the crew.`,expected:'',next:'Flight surgeon: raise it gently at the next private conference.'}));
      prevFlags=f; } }
  sudden(o.day).filter(r=>r.day>=from&&(r.crewWide||(health&&(!o.pid||r.who.includes(o.pid))))).forEach(r=>{
    const m=r.metric, v={env:['yes','Fix the cause, then re-check.'],context:['yes',''],'crew-unknown':['no','Check the habitat: air, temperature, noise, schedule.'],unexplained:['no','Ask how they feel. Check again tomorrow.']}[r.verdict];
    add({day:r.day,t:r.time===null?3:r.time,kind:'Reading',source:SOURCE_OF[m.id],label:'Simulated',
      who:r.crewWide?`${r.n} of ${PEOPLE.length} crew`:PEOPLE.find(p=>p.id===r.who[0]).name,
      what:r.crewWide?`${m.name} changed sharply for ${r.n} of ${PEOPLE.length} crew.${r.context?' Context: '+r.context+'.':''}`:`${m.name} ${r.value>r.normal?'up':'down'} to ${r.value.toFixed(m.dp)} ${m.unit} (own normal ${r.normal.toFixed(m.dp)}), during: ${r.activity.toLowerCase()}.${r.context?' Context: '+r.context+'.':''}`,
      expected:v[0],next:v[1]});
  });
  const mine=x=>!o.pid||x.pid===o.pid, nameOf=id=>PEOPLE.find(p=>p.id===id).name;
  store.alerts.filter(mine).forEach(a=>{
    add({day:a.day,t:a.t,kind:'Alert',source:'Alert button',label:'Entered in this demo',who:nameOf(a.pid),what:`${nameOf(a.pid)} asked for help. Status at the time: ${WORD[a.level]}.${a.symptoms&&a.symptoms.length?' Shared: '+a.symptoms.map(s=>SYMPTOMS[s].toLowerCase()).join(', ')+'.':''}${a.delay?' Light-time delay '+a.delay+' minutes each way.':''}`,expected:'',next:(a.ack.crew&&a.ack.ground)||a.closed?'':'Acknowledge and make contact.'});
    ['crew','ground'].forEach(k=>{ if(a.ack[k]) add({day:a.day,t:a.ack[k].t,kind:'Acknowledgement',source:k==='crew'?'Onboard crew':'Ground team',label:'Entered in this demo',who:nameOf(a.pid),what:`${a.ack[k].by} acknowledged ${nameOf(a.pid)}'s alert${k==='ground'&&a.delay?' at '+a.ack.ground.time+' Earth time; the reply reaches the crew about '+a.ack.ground.reaches:''}.`,expected:'',next:''}); });
    if(a.closed) add({day:a.day,t:a.closed.t,kind:'Alert',source:'Alert button',label:'Entered in this demo',who:nameOf(a.pid),what:`${nameOf(a.pid)} closed the alert.`,expected:'',next:''});
  });
  store.reports.filter(mine).forEach(r=>{
    const full=o.viewer==='self'||o.viewer==='surgeon'&&r.share!=='device'||r.share==='crew'&&o.viewer!=='crew';
    const exists=full||(o.viewer==='director'&&r.share==='surgeon');
    if(!exists) return;
    add({day:r.day,t:r.t,kind:'Crew report',source:'Astronaut',label:'Self-reported',who:nameOf(r.pid),
      what:full?`Reported: ${r.symptoms.map(s=>SYMPTOMS[s].toLowerCase()).join(', ')}.${r.detail&&(o.viewer==='self'||o.viewer==='surgeon')?' Note: "'+r.detail+'"':''}`:'Private report on file. Details are visible to the flight surgeon only.',
      expected:'',next:full?investigate(PEOPLE.find(p=>p.id===r.pid),r.day,r.symptoms).next:'Flight surgeon to follow up.'});
  });
  store.followups.filter(mine).forEach(f=>{ if(o.viewer==='crew')return;
    add({day:f.day,t:f.t,kind:'Crew report',source:'Astronaut',label:'Self-reported',who:nameOf(f.pid),what:'Private follow-up requested.',expected:'',next:'Flight surgeon: arrange a private conference.'}); });
  store.rtchecks.filter(mine).forEach(c=>{ if(o.viewer==='crew')return;
    add({day:c.day,t:c.t,kind:'Reading',source:'Test',label:'Taken in this demo',who:nameOf(c.pid),what:`Reaction check before a task: ${c.ms} ms, ${Math.abs(c.z).toFixed(1)} SD ${c.z<0?'slower':'faster'} than own normal (${WORD[c.level]}).`,expected:'',next:''}); });
  if(o.viewer==='self') store.checkins.filter(mine).forEach(c=>add({day:c.day,t:c.t,kind:'Check-in',source:'Astronaut',label:'Self-reported',who:nameOf(c.pid),what:`Check-in: ${c.answer}.`,expected:'',next:''}));
  return ev.sort((a,b)=>b.day-a.day||b.t-a.t);
}

