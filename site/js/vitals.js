/* ================= Live vitals: HR, HRV, SpO2, blood pressure, respiratory rate, core temperature =================
   Each person's simulated day sets a resting value; the live feed wobbles around it every 1.5 s, and moves with
   what they are doing right now (exercise and spacewalks raise heart rate as expected confounders, not distress).
   Bands are standard clinical ranges used as demo rules. HR and HRV use the personal-baseline status instead,
   as the vitals document recommends (deviation from own baseline beats population cut-offs). */

const VITALS = [
  {id:'hr',   name:'Heart rate',       unit:'bpm',  dp:0, row:'rhr',      walk:1.6},
  {id:'hrv',  name:'HRV',              unit:'ms',   dp:0, row:'hrv',      walk:2.2},
  {id:'spo2', name:'SpO₂',             unit:'%',    dp:0, row:'spo2',     walk:0.35},
  {id:'bp',   name:'Blood pressure',   unit:'mmHg', dp:0, row:'bp',       walk:1.8},
  {id:'rr',   name:'Respiratory rate', unit:'/min', dp:0, row:'rr',       walk:0.6},
  {id:'temp', name:'Core temperature', unit:'°C',   dp:1, row:'coretemp', walk:0.03},
  {id:'hyd',  name:'Hydration',        unit:'%',    dp:0, row:'hydration', walk:0.5}
];
const HYD_DIP = {aerobic:3, resistive:2.5, eva:6, drill:2, evaprep:1};   // live dip while sweating; recovers afterwards
const EXERTION = {aerobic:48, resistive:36, eva:32, drill:38, evaprep:10, maintenance:9, cargo:11, sleep:-5};
const EXERTION_NAME = {aerobic:'exercise', resistive:'exercise', eva:'spacewalk', drill:'emergency drill'};
Object.assign(THRESHOLDS, {
  spo2:{name:'Blood oxygen (SpO₂)', measure:'Resting reading', warn:95, crit:92, unit:'%', basis:'demo', lines:'Normal 95 % or more. Warning 92 to 94 %. Critical below 92 %.', why:'Standard clinical bands, used here as demo rules.'},
  bp:  {name:'Blood pressure', measure:'Resting reading', unit:'mmHg', basis:'demo', lines:'Warning at 140/90 or more. Critical at 160/100 or more.', why:'Standard clinical bands, used here as demo rules. Headward fluid shift in microgravity changes the baseline, so the personal trend matters more than one reading.'},
  rr:  {name:'Respiratory rate', measure:'Resting reading', unit:'/min', basis:'demo', lines:'Normal 12 to 20 a minute. Warning outside that. Critical above 24 or below 10.', why:'Standard clinical bands, used here as demo rules. Raised cabin CO₂ speeds up breathing.'},
  hydration:{name:'Hydration level', measure:'Estimated body water as a share of the personal target', warn:90, crit:80, unit:'%', basis:'demo', lines:'Normal 90 % or more. Warning 80 to 89 %. Critical below 80 %.', why:'Demo rule. In microgravity, fluid shifts towards the head and dulls thirst, so crews tend to under-drink; heavy exercise and spacewalks add sweat losses.'},
  coretemp:{name:'Core body temperature', measure:'Daily mean and day-night swing', unit:'°C', basis:'demo', lines:'Normal 36.1 to 37.5 °C. Warning outside that, or a day-night swing under 0.35 °C. Critical at 38.5 °C or more.', why:'A flattened day-night temperature curve is one of the slow physiological patterns that can accompany depression. It is not proof of it.'}
});

/* ---------- the simulated day: resting values that set status ---------- */
function vitalsDay(p, day){
  const k = p.id+'|'+day, u = s => unit01(s+k), co2 = cabin(day).co2;
  const sys = 112 + 9*u('bs') + (p.id === 'kenji' ? ramp(day, 55, 80, 30) + ramp(day, 80, 100, 6) : 0) + (p.id === 'tomas' && day >= 85 && day <= 92 ? 9 : 0);
  const dia = 71 + 6*u('bd') + (p.id === 'kenji' ? ramp(day, 55, 80, 16) : 0);
  const spo2 = 96.6 + 1.6*u('o2') - (co2 > 4.5 ? 1.4 : 0);
  const rr = 13.2 + 2.2*u('rr') + Math.max(0, co2 - 3)*3;                       // CO₂ fault: faster breathing for everyone
  const amp = p.id === 'sofia' ? 0.62 - ramp(day, 72, 100, 0.4) : 0.52 + 0.14*u('ta');   // Sofia: flattening day-night curve
  const tmean = 36.7 + 0.18*u('tm') + (p.id === 'sofia' ? ramp(day, 72, 100, 0.12) : 0);
  const hyd = Math.min(99, 93 + 5*u('hy') - (p.id === 'kenji' ? ramp(day, 65, 95, 12) : 0) - (p.id === 'sofia' && day >= 52 && day <= 56 ? 10 : 0)
    - (day === 93 && (p.id === 'tomas' || p.id === 'kenji') ? 9 : 0));        // spacewalk day: hours in the suit
  return {sys, dia, spo2, rr, amp, tmean, hyd, off:!!gapOf(p.id, 'hrv', day)};
}
const bpLevel = (s, d) => s >= 160 || d >= 100 ? 'critical' : s >= 140 || d >= 90 ? 'warning' : 'normal';
const spo2Level = v => v < 92 ? 'critical' : v < 95 ? 'warning' : 'normal';
const rrLevel = v => v > 24 || v < 10 ? 'critical' : v > 20 || v < 12 ? 'warning' : 'normal';
const hydLevel = v => v < 80 ? 'critical' : v < 90 ? 'warning' : 'normal';
const tempLevel = (t, amp) => t >= 38.5 ? 'critical' : (t > 37.5 || t < 36.1 || amp < 0.35) ? 'warning' : 'normal';

function vitalRows(p, day){
  const v = vitalsDay(p, day), T = THRESHOLDS, base = {group:'You', domain:'body', source:'Wearable', label:'Simulated', basis:'demo'};
  if(v.off) return ['spo2','bp','rr','coretemp','hydration'].map(id => ({...base, id, name:T[id].name, value:'No reading', level:'unavailable', rule:'No reading in the last 24 hours (wearable offline).'}));
  return [
    {...base, id:'spo2', name:'Blood oxygen (SpO₂)', value:Math.round(v.spo2)+' %', level:spo2Level(Math.round(v.spo2)), rule:T.spo2.lines, plain:'Your blood oxygen is lower than normal'},
    {...base, id:'bp', name:'Blood pressure', value:`${Math.round(v.sys)}/${Math.round(v.dia)} mmHg`, level:bpLevel(v.sys, v.dia), rule:T.bp.lines, plain:'Your blood pressure is higher than usual'},
    {...base, id:'rr', name:'Respiratory rate', value:v.rr.toFixed(0)+' /min', level:rrLevel(Math.round(v.rr)), rule:T.rr.lines, plain:'You are breathing faster than usual at rest'},
    {...base, id:'coretemp', name:'Core body temperature', value:`${v.tmean.toFixed(1)} °C · swing ${v.amp.toFixed(2)} °C`, level:tempLevel(v.tmean, v.amp), rule:T.coretemp.lines,
      plain:v.amp < 0.35 ? 'Your day-night temperature rhythm has flattened' : 'Your core temperature is outside the usual range'},
    {...base, id:'hydration', name:'Hydration level', value:Math.round(v.hyd)+' %', level:hydLevel(Math.round(v.hyd)), rule:T.hydration.lines, plain:'You are running low on fluids'}
  ];
}

/* ---------- the live feed ---------- */
const VBUF = {}, VWALK = {}, VDAY = {}, VLEN = 40;          // 40 samples x 1.5 s = 60 seconds
function vitalBase(p, day, hour){
  const v = vitalsDay(p, day), act = activityAt(p.id, day, hour), add = EXERTION[act] !== undefined ? EXERTION[act] : 5;
  const rhr = val(p, 'rhr', day), hrv = val(p, 'hrv', day);
  const circ = Math.cos(2*Math.PI*(hour - 17)/24);                                   // peaks late afternoon
  return {act, off:v.off, exert:!!EXERTION_NAME[act],
    hr:(rhr !== null ? rhr : p.base.rhr.mean) + add, hrv:Math.max(12, (hrv !== null ? hrv : p.base.hrv.mean) - add*0.35),
    spo2:v.spo2 - (act === 'eva' ? 0.8 : 0), bp:v.sys + add*0.45, dia:v.dia + add*0.2, rr:v.rr + add/9, temp:v.tmean + v.amp/2*circ + (EXERTION_NAME[act] ? 0.25 : 0), hyd:v.hyd - (HYD_DIP[act] || 0)};
}
function vitalNext(key, base, walk, prev){          // eases toward the target (e.g. exercise starting), plus a little noise
  VWALK[key] = clamp((VWALK[key] || 0)*0.85 + walk*(Math.random() - 0.5)*1.6, -walk*3, walk*3);
  const target = base + VWALK[key];
  return prev === undefined ? target : prev + (target - prev)*0.25;
}
function vitalBuf(p, id){
  const key = p.id+'|'+id; if(VBUF[key] && VDAY[key] === state.day) return VBUF[key];
  const vd = VITALS.find(v => v.id === id), b = vitalBase(p, state.day, nowHour())[id];
  VDAY[key] = state.day;                                 // a new mission day starts a fresh minute of data
  return VBUF[key] = Array.from({length:VLEN}, () => vitalNext(key, b, vd.walk));
}
const vitalFmt = (p, id, x) => id === 'bp' ? `${Math.round(x)}/${Math.round(vitalBase(p, state.day, nowHour()).dia + (x - vitalBase(p, state.day, nowHour()).bp)*0.5)}` : (+x).toFixed(VITALS.find(v => v.id === id).dp);
function vsparkPoints(buf){
  const lo = Math.min(...buf), hi = Math.max(...buf), span = (hi - lo) || 1;
  return buf.map((v, i) => `${(i*(78/(VLEN - 1)) + 1).toFixed(1)},${(18 - (v - lo)/span*16).toFixed(1)}`).join(' ');
}
function vitalLevel(p, id, day){
  const vd = VITALS.find(v => v.id === id), row = readings(p, day).find(r => r.id === vd.row);
  return row ? row.level : 'normal';
}
function vitalTile(p, id){
  const vd = VITALS.find(v => v.id === id), b = vitalBase(p, state.day, nowHour()), lvl = b.off ? 'unavailable' : vitalLevel(p, id, state.day);
  if(b.off) return `<div class="tile vtile lvl-unavailable"><span class="small">${vd.name}</span><strong>No signal</strong><span class="small">Wearable offline</span></div>`;
  const buf = vitalBuf(p, id), key = p.id+'|'+id, last = buf[buf.length - 1];
  return `<div class="tile vtile lvl-${lvl}" title="${esc(vd.name)}: live, updates every 1.5 s"><span class="small">${vd.name} <span class="livedot" aria-hidden="true"></span></span>
    <strong><span data-vital="${key}">${vitalFmt(p, id, last)}</span> <span class="u">${vd.unit}</span></strong>
    <svg class="vspark" viewBox="0 0 80 20" aria-hidden="true"><polyline data-vspark="${key}" points="${vsparkPoints(buf)}"/></svg>
    ${b.exert && (id === 'hr' || id === 'hrv' || id === 'rr') ? `<span class="vconf">${EXERTION_NAME[b.act]}: expected</span>` : ''}</div>`;
}
function vitalsSnapshot(p){
  const b = vitalBase(p, state.day, nowHour()), o = {activity_now:ACTIVITIES[b.act] ? ACTIVITIES[b.act].name : b.act};
  if(b.off) return {...o, note:'wearable offline, no live vitals'};
  VITALS.forEach(v => { const buf = vitalBuf(p, v.id); o[v.id === 'bp' ? 'blood_pressure_mmHg' : v.id+'_'+v.unit.replace(/[^a-z%]/gi, '')] = vitalFmt(p, v.id, buf[buf.length - 1]); });
  o.status = Object.fromEntries(VITALS.map(v => [v.id, vitalLevel(p, v.id, state.day)]));
  if(b.exert) o.confounder = `currently in ${EXERTION_NAME[b.act]}: raised heart rate and breathing are expected`;
  return o;
}
setInterval(() => {
  if(typeof state === 'undefined' || !state.session) return;
  const seen = {};
  document.querySelectorAll('[data-vital]').forEach(el => {
    const key = el.dataset.vital; if(seen[key]) { el.textContent = seen[key]; return; }
    const [pid, id] = key.split('|'), p = PEOPLE.find(q => q.id === pid), vd = VITALS.find(v => v.id === id), buf = vitalBuf(p, id);
    buf.push(vitalNext(key, vitalBase(p, state.day, nowHour())[id], vd.walk, buf[buf.length - 1])); if(buf.length > VLEN) buf.shift();
    el.textContent = seen[key] = vitalFmt(p, id, buf[buf.length - 1]);
    document.querySelectorAll(`[data-vspark="${key}"]`).forEach(pl => pl.setAttribute('points', vsparkPoints(buf)));
  });
}, 1500);
