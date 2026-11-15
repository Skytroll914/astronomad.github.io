/* ================= Added in v3: radiation, cabin remote, sleep report, CCTV positions, Rimau interventions =================
   Loaded after pipeline.js, rules.js and extras.js. It extends their data and wraps a few of their functions,
   so the original simulation stays untouched. */

/* ---------- Sources added for this build ---------- */
Object.assign(SRC, {
  radbrief:['NASA OCHMO technical brief: Radiation protection (NASA-STD-3001)','https://www.nasa.gov/wp-content/uploads/2023/03/radiation-protection-technical-brief-ochmo.pdf'],
  bhp:     ['VanderArk et al., Human behavior and performance support for ISS operations: NASA operational psychology for six-crew operations (NASA NTRS 20100036824)','https://ntrs.nasa.gov/citations/20100036824'],
  psych:   ['Whitmire 2022, Space psychology (NASA NTRS 20230010798)','https://ntrs.nasa.gov/citations/20230010798']
});
const srcOf = k => SRC[k] || REFS[k];

/* ---------- Cabin radiation ---------- */
THRESHOLDS.radiation = {name:'Cabin radiation dose rate', measure:'Latest reading from the cabin radiation monitor', warn:40, crit:100, unit:'µSv/h', basis:'mixed',
  lines:'Warning at 40 µSv/h or more. Critical at 100 µSv/h or more: move to the shielded shelter.',
  why:'ISS crews typically build up about 0.2 to 0.5 mSv a day (roughly 8 to 21 µSv/h). NASA limits the dose from a single solar particle event to 250 mSv. The warning and critical lines are demo rules set well above normal background.', src:['radbrief']};

const SPE = {from:64, rates:[185, 72], label:'Solar particle event'};      // day 64 peak, day 65 easing, day 66 back to background
function radiation(day){
  const i = day - SPE.from, spe = i >= 0 && i < SPE.rates.length;
  return {rate: spe ? SPE.rates[i] : 11 + 7*unit01('rad'+day), spe};
}
const _dose = {};
function missionDose(day){                     // mSv since launch
  if(_dose[day] !== undefined) return _dose[day];
  let s = 0; for(let d = 1; d <= day; d++) s += radiation(d).rate*24/1000;
  return _dose[day] = s;
}
const radLevel = r => r >= THRESHOLDS.radiation.crit ? 'critical' : r >= THRESHOLDS.radiation.warn ? 'warning' : 'normal';

/* ---------- Cabin remote: each astronaut's sleep station temperature and lighting ---------- */
// Settings made on day D apply to that day's readings and to the night that ends on the morning of D+1.
const LIGHT_MODES = {general:'General (4500 K)', presleep:'Pre-sleep (2700 K, warm)', phase:'Phase-shift (6500 K, cool)'};
const remoteOf = pid => (store.remote || {})[pid] || null;
function clearCaches(){ [_rc, _rc3].forEach(o => Object.keys(o).forEach(k => delete o[k])); }

const _night = night;
night = function(pid, day){
  const n = _night(pid, day), r = remoteOf(pid);
  if(!r || day <= r.from) return n;
  const m = {...n}, T = THRESHOLDS;
  if(r.temp !== null && r.temp !== undefined){
    m.tempPeak = r.temp + 0.4;
    m.warm = r.temp > T.temp.ok[1] ? {from:22, to:5.5, peak:r.temp + 0.4, remote:true} : null;
    m.cold = r.temp < T.temp.ok[0] ? {temp:r.temp} : null;
  }
  if(!r.lightSet) return m;                      // lighting only counts once the astronaut has touched it
  if(r.light === 'presleep'){ m.light = null; m.lux = Math.min(n.lux, 30); }
  else if(r.bright >= 50){ m.light = {lux:Math.round(60 + r.bright*3.2), until:21.33, remote:true}; m.lux = m.light.lux; }
  return m;
};

/* ---------- Readings: add radiation and the sleep station's own temperature ---------- */
const _readings = readings, _rc3 = {};
readings = function(p, day){
  const key = p.id+'|'+day; if(_rc3[key]) return _rc3[key];
  const rows = _readings(p, day).slice(), T = THRESHOLDS, rad = radiation(day), r = remoteOf(p.id), set = r && day >= r.from && r.temp !== null && r.temp !== undefined;
  const st = set ? r.temp : cabin(day).temp + 0.8*(unit01('st'+key) - 0.5);
  rows.push({id:'stationtemp', name:'Sleep station temperature', group:'Cabin', label:set ? 'Set by you (cabin remote)' : 'Simulated', source:'Sleep station sensor',
    value:st.toFixed(1)+' °C', level:band(st, T.temp), rule:T.temp.lines, basis:'source',
    plain:st > T.temp.ok[1] ? 'Your sleep station is warmer than the comfort zone' : 'Your sleep station is cooler than the comfort zone'});
  rows.push({id:'radiation', name:'Cabin radiation', group:'Cabin', label:'Simulated', source:'Radiation monitor', value:rad.rate.toFixed(1)+' µSv/h', raw:rad.rate,
    level:radLevel(rad.rate), rule:`${T.radiation.lines} Mission dose so far: ${missionDose(day).toFixed(1)} mSv.`, basis:'mixed',
    plain:rad.spe ? 'Cabin radiation is high because of a solar particle event' : 'Cabin radiation is raised'});
  rows.push(...vitalRows(p, day));                 // SpO2, blood pressure, breathing, core temperature (vitals.js)
  return _rc3[key] = rows;
};

/* ---------- Event log: add radiation events and wellbeing summaries shared from Rimau ---------- */
const _timeline = timeline;
timeline = function(o){
  const ev = _timeline(o), from = Math.max(2, o.day - o.span + 1);
  for(let d = from; d <= o.day; d++){
    const r = radiation(d);
    if(d === SPE.from) ev.push({day:d, t:9.4, kind:'Cabin', source:'Radiation monitor', label:'Simulated', who:'Whole crew',
      what:`Solar particle event: cabin dose rate up to ${r.rate} µSv/h, above the ${THRESHOLDS.radiation.crit} µSv/h line.`, expected:'no', next:'Crew: shelter in the shielded area. Ground: track the event and confirm when it is clear.'});
    else if(d === SPE.from + 1) ev.push({day:d, t:8, kind:'Cabin', source:'Radiation monitor', label:'Simulated', who:'Whole crew',
      what:`Dose rate easing: ${r.rate} µSv/h, still above the ${THRESHOLDS.radiation.warn} µSv/h warning line.`, expected:'no', next:'Keep time outside the shielded area short.'});
  }
  // Daily check-ins done in this demo: full detail for the astronaut and the flight surgeon, the band only for others
  if(o.viewer !== 'crew') (store.assessments || []).filter(a => (!o.pid || a.pid === o.pid) && a.day >= from && a.day <= o.day && a.report).forEach(a => ev.push({
    day:a.day, t:a.t, kind:'Check-in', source:'Daily check-in with Rimau', label:a.demo ? 'Demo (scripted)' : 'AI-estimated', who:PEOPLE.find(p => p.id === a.pid).name,
    what:o.viewer === 'director' ? `Daily check-in completed. Overall: ${BAND_WORD[a.report.overall.band]}.` : `Daily check-in: ${BAND_WORD[a.report.overall.band]}. ${a.report.overall.summary_for_surgeon || ''}`,
    expected:'', next:a.report.overall.band === 'red' ? 'Flight surgeon: offer a confidential tele-psychology consultation.' : a.report.overall.band === 'yellow' ? 'Low-friction countermeasures: workload, family call, self-guided tools.' : ''}));
  return ev.sort((a, b) => b.day - a.day || b.t - a.t);
};

/* ---------- Sleep session: environmental traces across the sleep window, and disturbances ---------- */
const H24 = t => t < 12 ? t + 24 : t;                      // 02:00 -> 26, so a night reads left to right
function sleepSession(p, day){
  const sw = sleepWindow(p.id, day), n = night(p.id, day), T = THRESHOLDS;
  const start = sw.start, end = sw.end + 24, slept = val(p, 'sleeph', day), eff = val(p, 'sleepe', day);
  const key = p.id+'|'+day, D = [];
  // one optional "ordinary" disturbance per night, seeded so each night is repeatable
  const kind = hashInt('ord'+key) % 4, ordT = start + 2 + 4.5*unit01('ot'+key);
  // planted and remote-driven disturbances
  let onset = start + 0.25 + 0.35*unit01('on'+key);
  if(n.duty){ onset = Math.max(onset, n.duty.end + 0.35);
    D.push({t:start, dur:Math.round((onset - start)*60), kind:'Schedule', level:'warning', what:`${n.duty.name} ran to ${hh(n.duty.end)}, so sleep started at ${hh(onset)}.`, env:'Duty overlapped the sleep window'}); }
  if(n.light){ onset += 0.4;
    D.push({t:onset - 0.4, dur:24, kind:'Light', level:'warning', what:`Lights were at ${n.light.lux} lux until ${hh(n.light.until)}. Falling asleep took about 25 minutes longer than usual.`, env:`${n.light.lux} lux (line ${T.light.warn})`}); }
  if(n.alarm) D.push({t:H24(n.alarm.t), dur:n.alarm.min + 12, kind:'Noise', level:'critical', what:`${n.alarm.what} at ${hh(n.alarm.t)} woke you. ${n.alarm.note}`, env:`${n.alarm.db} dBA (limit ${T.noise.warn})`});
  if(n.warm){ const a = Math.max(H24(n.warm.from), onset + 0.5), b = H24(n.warm.to);
    [a + 0.35*(b - a), a + 0.75*(b - a)].forEach((t, i) => D.push({t, dur:i ? 9 : 14, kind:'Temperature', level:'warning',
      what:`Restless and awake for a few minutes while the sleep station was warm.${n.warm.remote ? ' The cabin remote was set to '+(n.warm.peak - 0.4).toFixed(1)+' °C.' : ''}`, env:`${n.warm.peak.toFixed(1)} °C (comfort zone up to ${T.temp.ok[1]} °C)`})); }
  if(n.cold) D.push({t:start + 4.2, dur:11, kind:'Temperature', level:'warning', what:`Woke feeling cold. The cabin remote was set to ${n.cold.temp.toFixed(1)} °C.`, env:`${n.cold.temp.toFixed(1)} °C (comfort zone from ${T.temp.ok[0]} °C)`});
  if(n.co2 > T.co2.warn) D.push({t:start + 3.1, dur:16, kind:'CO₂', level:n.co2 > T.co2.crit ? 'critical' : 'warning', what:'Woke with a dull headache while cabin CO₂ was raised.', env:`${n.co2.toFixed(1)} mmHg (limit ${T.co2.warn})`});
  if(!D.some(d => d.kind === 'Noise' || d.kind === 'Temperature')){
    if(kind === 0) D.push({t:ordT, dur:6, kind:'Noise', level:'warning', what:'A pump cycling near the sleep station caused a brief awakening.', env:'57 dBA for 4 minutes (limit 50)'});
    if(kind === 1) D.push({t:ordT, dur:5, kind:'Humidity', level:'normal', what:'Humidity jumped after a condensate cycle. A brief arousal, back to sleep quickly.', env:'+9 % in 20 minutes'});
  }
  if(!D.length && eff !== null && eff < 85) D.push({t:start + 5.3, dur:13, kind:'Unclear', level:'normal', what:'Awake for about 13 minutes with no change in the cabin readings. Stress or body-clock timing may be the reason.', env:'No environmental change found'});
  D.sort((a, b) => a.t - b.t);
  // 10-minute samples for the four cabin traces, shaped by the disturbances above so the chart lines up with the log
  const S = [];
  for(let t = start; t <= end + 1e-9; t += 1/6){
    const k = key+'|'+t.toFixed(2), near = kd => D.find(d => d.kind === kd && t >= d.t - 0.1 && t <= d.t + Math.max(0.15, d.dur/60));
    let noise = n.noise - 3 + 4*(unit01('n'+k) - 0.5), co2 = n.co2 + 0.2*(unit01('c'+k) - 0.5), hum = n.humidity + 1.6*(unit01('h'+k) - 0.5);
    let temp = (n.warm && t >= H24(n.warm.from) && t <= H24(n.warm.to)) ? n.warm.peak - 0.5*unit01('t'+k) : n.cold ? n.cold.temp + 0.3*unit01('t'+k) : Math.min(n.tempPeak, T.temp.ok[1]) - 0.6 + 0.4*unit01('t'+k);
    if(n.alarm && Math.abs(t - H24(n.alarm.t)) <= n.alarm.min/60) noise = n.alarm.db;
    const nz = near('Noise'); if(nz && !n.alarm) noise = 57;
    const hu = near('Humidity'); if(hu) hum += 9;
    if(n.co2 > T.co2.warn) co2 = n.co2 + 0.3*Math.sin((t - start)/2) + 0.15*(unit01('c'+k) - 0.5);
    S.push({t, noise, co2, hum, temp});
  }
  const awake = D.reduce((s, d) => s + d.dur, 0);
  return {start, end, onset, slept, eff, D, S, awake, n};
}

/* ---------- CCTV: where each crew member is right now ---------- */
const ZONES = {
  sleep:{x:510, y:70, name:'Crew quarters'}, hygiene:{x:510, y:190, name:'Hygiene'}, personal:{x:510, y:70, name:'Crew quarters'}, call:{x:510, y:70, name:'Crew quarters'}, medconf:{x:510, y:70, name:'Crew quarters'},
  meal:{x:150, y:80, name:'Galley'}, conference:{x:150, y:80, name:'Galley'}, aerobic:{x:330, y:205, name:'Exercise'}, resistive:{x:330, y:205, name:'Exercise'},
  science:{x:330, y:75, name:'Laboratory'}, research:{x:330, y:75, name:'Laboratory'}, sampling:{x:330, y:75, name:'Laboratory'}, maintenance:{x:150, y:205, name:'Life support'},
  cargo:{x:150, y:205, name:'Life support'}, housekeeping:{x:150, y:80, name:'Galley'}, outreach:{x:60, y:140, name:'Cupola'}, robotics:{x:60, y:140, name:'Cupola'},
  piloting:{x:60, y:140, name:'Cupola'}, evaprep:{x:600, y:140, name:'Airlock'}, eva:{x:600, y:140, name:'Airlock'}, drill:{x:330, y:140, name:'Node'}, shelter:{x:335, y:111, name:'Shielded shelter'}
};
function crewPositions(day, hour){
  const shelter = day === SPE.from;          // everyone in the shielded area on the day of the event
  const list = PEOPLE.map(p => { const act = shelter ? 'shelter' : activityAt(p.id, day, hour); return {p, act, z:ZONES[act] || ZONES.science}; });
  return list.map((o, i) => {
    const k = list.slice(0, i).filter(q => q.z.x === o.z.x && q.z.y === o.z.y).length;
    return {p:o.p, act:o.act, zone:o.z.name, x:o.z.x - 18 + (k % 3)*18, y:o.z.y + 6 + Math.floor(k/3)*18};
  });
}

/* ---------- Curated interventions: the only advice Rimau may give ---------- */
const INTERVENTIONS = {
  family_call: {name:'Private call home', what:'Book a private voice or video call with family. Crew have a private phone line and scheduled family conferences.', src:['bhp','med']},
  ppc:         {name:'Private conference with the flight surgeon or psychologist', what:'A confidential talk with your behavioral health team on the ground. They also check in on sleep and how the crew gets along.', src:['psych','bhp']},
  care:        {name:'Something from home', what:'Ask the support team for a care package, favourite music or films, or a recorded message from home.', src:['psych','bhp']},
  solve:       {name:'Problem-solving steps', what:'A short self-guided exercise for when something feels stuck or heavy.', src:['vss','vss2'], tool:'solve'},
  conflict:    {name:'Conflict conversation guide', what:'Self-guided steps for a calm conversation with a crewmate.', src:['vss','vss2'], tool:'conflict'},
  calm:        {name:'Two-minute reset', what:'Slow breathing (4 seconds in, 6 out) to come down from stress.', src:['vss','vss2'], tool:'calm'},
  lighting:    {name:'Pre-sleep lighting plan', what:'Warm pre-sleep lighting 2 hours before your sleep window, timed to your body clock.', src:['fms','lighting'], tool:'lighting'},
  exercise:    {name:'Your exercise session', what:'Daily exercise is a core countermeasure on the station, and a good way to clear your head.', src:['ex','scott']},
  offduty:     {name:'Protected off-duty time', what:'Take your off-duty time fully: music, a window, writing, or nothing.', src:['off']},
  crew_meal:   {name:'Shared crew meal', what:'Join the crew for the next meal. Shared meals are part of the station routine.', src:['esa']},
  shelter:     {name:'Radiation shelter', what:'During a solar particle event, move to the shielded area and follow the crew lead.', src:['radbrief']}
};
