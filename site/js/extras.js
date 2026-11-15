/* ================= Added from the two reviews: workload, body clock, crew pairs, slow trends, readiness, delay, self-help ================= */

/* ---------- Mission profile: light-time delay ---------- */
const PROFILES = {
  iss:  {name:'ISS (low Earth orbit)', delay:0,  note:'Ground replies are close to real time.'},
  mars: {name:'Mars transit',          delay:12, note:'One-way signal delay set to 12 minutes. The real range is about 3 to 22 minutes.'}
};

/* ---------- Workload: scheduled duty hours ---------- */
// The ISS scheduling standard is a 6.5-hour workday. Saturday morning is housekeeping, Sunday is off.
const WORK_PLANTS = [
  {who:['sofia'],          from:52, to:56, extra:3.5, weekend:7, why:'CO₂ scrubber repair'},
  {who:['tomas'],          from:85, to:92, extra:1.5, weekend:5, why:'spacewalk preparation'},
  {who:['kenji'],          from:89, to:92, extra:1.5, weekend:4, why:'spacewalk preparation'},
  {who:['amara','kenji'],  from:32, to:34, extra:2,              why:'docking preparation'}
];
function workDay(pid, day){
  const dow=day%7, weekend=dow===0||dow===6; let h=dow===0?0:dow===6?3:6.5; const why=[];
  WORK_PLANTS.filter(w=>w.who.includes(pid)&&day>=w.from&&day<=w.to).forEach(w=>{
    if(weekend){ if(w.weekend!==undefined){ h=Math.max(h,w.weekend); why.push(w.why+' (weekend)'); } }
    else { h+=w.extra; why.push(w.why); } });
  TASKS.filter(t=>t.day===day&&t.who.includes(pid)).forEach(t=>{ h+=t.name==='Spacewalk'?4.5:2; why.push(t.name); });
  if(night(pid,day+1).duty){ h+=1.5; why.push('late maintenance'); }
  return {h, why, off:h===0};
}
function workload(pid, day){
  const days=[]; for(let d=day-6; d<=day; d++) if(d>=1) days.push(workDay(pid,d));
  const total=days.reduce((s,x)=>s+x.h,0);
  let sinceOff=0; for(let d=day; d>=1&&!workDay(pid,d).off; d--) sinceOff++;
  const why=[...new Set(days.flatMap(x=>x.why).map(w=>w.replace(' (weekend)','')))];
  return {total, sinceOff, why, today:workDay(pid,day).h};
}

/* ---------- Body clock: estimated from the sleep schedule (a proxy, not a measurement) ---------- */
// The night that ends on the morning of `day` can be moved. A negative shift means earlier.
const SLEEP_SHIFTS = { tomas:{92:-2.5, 93:-2.5}, kenji:{92:-2.5, 93:-2.5} };
const SHIFT_WHY = 'an early start for the spacewalk';
function sleepWindow(pid, day){
  const sh=(SLEEP_SHIFTS[pid]||{})[day]||0;
  return {start:SLEEP_WINDOW.start+sh, end:SLEEP_WINDOW.end+sh, shift:sh, why:sh?SHIFT_WHY:null};
}
const CLOCK_RATE = {earlier:1.0, later:1.5};     // demo model: hours the body clock can move per day
function clockState(pid, day){
  let clock=0;
  for(let d=1; d<=day; d++){
    let target=sleepWindow(pid,d).shift;
    if(night(pid,d).duty) target+=0.75;                       // late duty pushed that night's sleep later
    if(pid==='kenji'&&d>=62&&d<=90) target+=0.3;               // bright evening light delays sleep
    const diff=target-clock; clock+=diff<0?Math.max(diff,-CLOCK_RATE.earlier):Math.min(diff,CLOCK_RATE.later);
  }
  const tonight=sleepWindow(pid,day+1);
  return {clock, tonight, gap:tonight.shift-clock};
}
function lightingPlan(pid, day){
  const c=clockState(pid,day), w=c.tonight, pre=hh(w.start-2);
  if(c.gap<=-0.5) return {need:'earlier', steps:[
    ['After waking', 'Phase-shift lighting (cool, blue-enriched) for the first hour.'],
    ['From '+pre, 'Pre-sleep lighting (warm). Night glasses if you use a screen.'],
    ['Before '+hh(w.start), 'Stay out of the Cupola, and into your sleep station on time.']]};
  if(c.gap>=0.5) return {need:'later', steps:[
    ['After waking', 'General lighting only. Skip the Cupola for the first hours.'],
    ['Evening', 'Phase-shift lighting (cool) until '+pre+' to push your clock later.'],
    ['From '+pre, 'Pre-sleep lighting (warm), then sleep at '+hh(w.start)+'.']]};
  return {need:'none', steps:[
    ['Daytime', 'General lighting.'],
    ['From '+pre, 'Pre-sleep lighting (warm). Night glasses if you use a screen.'],
    [hh(w.start), 'Into your sleep station.']]};
}

/* ---------- Crew pairs: time spent near each crewmate (simulated proximity badges) ---------- */
const PAIR_EFFECTS = [{a:'kenji', b:'erik', from:88, to:95, floor:0.22, why:'planted tension between two crewmates'}];
const pairKey=(a,b)=>[a,b].sort().join('|');
function pairTime(a, b, day){
  const k=pairKey(a,b), base=14+22*unit01('pb'+k);
  let m=1+0.6*(unit01('pt'+k+day)-0.5);
  PAIR_EFFECTS.forEach(e=>{ if(pairKey(e.a,e.b)===k) m*=1-(1-e.floor)*clamp((day-e.from)/(e.to-e.from),0,1); });
  ['sofia'].forEach(id=>{ if(a===id||b===id) m*=1-0.5*clamp((day-68)/(92-68),0,1); });   // her withdrawal reaches every pair
  return base*m;
}
function pairShare(a, b, day){                 // last 7 days as a share of the pair's first 30 days in flight
  const usual=mean(Array.from({length:30},(_,i)=>pairTime(a,b,i+1)));
  const recent=mean(Array.from({length:7},(_,i)=>pairTime(a,b,Math.max(1,day-i))));
  return recent/usual;
}
const PAIR_LINE = 0.4, _pf={};
function pairFlags(day){
  if(_pf[day]) return _pf[day];
  if(day<37) return [];
  const out=[], ids=PEOPLE.map(p=>p.id);
  for(let i=0;i<ids.length;i++) for(let j=i+1;j<ids.length;j++){
    const s=pairShare(ids[i],ids[j],day); if(s>THRESHOLDS.pairs.line) continue;
    const overall=[ids[i],ids[j]].map(id=>mean(lastN(d=>zval(PEOPLE.find(p=>p.id===id),'crew',d),day,7)));
    if(overall.every(z=>z>-1)) out.push({a:ids[i], b:ids[j], share:s});      // both still normal with the rest of the crew
  }
  return _pf[day]=out;
}

/* ---------- Gradual decline: a slow slide before any line is crossed ---------- */
function slope(ys){ const n=ys.length, xs=ys.map((_,i)=>i), mx=mean(xs), my=mean(ys);
  let sxy=0,sxx=0; xs.forEach((x,i)=>{sxy+=(x-mx)*(ys[i]-my); sxx+=(x-mx)*(x-mx)}); return sxx?sxy/sxx:0; }
function trendOf(p, mid, day){
  const series=[]; for(let d=day-27; d<=day; d++) series.push(zval(p,mid,d));
  const last21=series.slice(-21).filter(v=>v!==null), last7=series.slice(-7).filter(v=>v!==null);
  const s=last21.length>=14?slope(last21):0, now=last7.length?mean(last7):0;
  const T=THRESHOLDS.trend;
  return {series, slope:s, now, sliding:day>=22&&s<=T.slope&&now<=T.level};
}

/* ---------- Task readiness: current state only, no forecast ---------- */
const READY_ADVICE = {
  normal:  ['Ready', 'No concerns from the monitored readings.'],
  warning: ['Add a second checker', 'Plan a crewmate to confirm each critical step.'],
  critical:['Talk before the task', 'Crew lead and flight surgeon to decide whether to re-plan or add support.']
};
function readiness(p, day, task){
  const rows=readings(p,day), get=id=>rows.find(r=>r.id===id);
  const worst=list=>list.filter(Boolean).filter(r=>r.level!=='unavailable').reduce((a,r)=>RANK[r.level]>RANK[a.level]?r:a,{level:'normal',rule:'All in range.'});
  const att=worst([get('rt'),get('wm')]);
  const items=[
    {name:'Sleep, last 3 nights', r:get('sleeph')},
    {name:'Attention this week',  r:att.rule==='All in range.'?{level:'normal',rule:'Reaction time and working memory both in range.',value:''}:att},
    {name:'Workload, last 7 days',r:get('workload')},
    {name:'Body clock vs schedule',r:get('clock')}
  ];
  const chk=store.rtchecks.filter(c=>c.pid===p.id&&c.day===day).slice(-1)[0];
  if(chk) items.push({name:'Reaction check today', r:{level:chk.level, rule:`${chk.ms} ms, ${Math.abs(chk.z).toFixed(1)} SD ${chk.z<0?'slower':'faster'} than own normal.`, value:chk.ms+' ms'}});
  const level=items.reduce((a,i)=>i.r&&i.r.level!=='unavailable'&&RANK[i.r.level]>RANK[a]?i.r.level:a,'normal');
  return {task, items, level, advice:READY_ADVICE[level], check:chk};
}
const nextTask=(pid,day,within)=>TASKS.filter(t=>t.who.includes(pid)&&t.day>=day&&t.day<=day+within).sort((a,b)=>a.day-b.day)[0];

/* ---------- Self-guided tools (run on board, nothing saved or shared) ---------- */
const TOOLS = {
  solve:   {name:'Problem-solving steps', when:'When something feels stuck or heavy.', steps:[
             'Write the problem down in one sentence.',
             'List three things you could do about it. Small ones count.',
             'Pick one you can do today, and decide when.',
             'Tomorrow, check how it went. Keep it, change it, or pick another.']},
  conflict:{name:'Conflict conversation guide', when:'When things are tense with a crewmate.', steps:[
             'Choose a calm moment, away from any critical task.',
             'Describe what happened and how it affected the work. Talk about the situation, not their character.',
             'Ask for their side, and listen to the end before you answer.',
             'Agree one change each, and check in again in two days.',
             'If it stays stuck, ask the crew lead for a team debrief.']},
  calm:    {name:'Two-minute reset', when:'When you feel wound up or on edge.', breathe:true, steps:[
             'Breathe in for 4 seconds, out for 6 seconds. Follow the circle for two minutes.',
             'Drop your shoulders and unclench your jaw.',
             'Name the one next thing you need to do, and start only that.']}
};

