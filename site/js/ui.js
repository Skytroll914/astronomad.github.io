/* ================= Interface ================= */
const VIEWS = ['personal','team','ground','about'];
const TABS = {astronaut:['personal','team'], ground:['ground'], demo:['personal','team','ground','about']};
const TAB_NAME = {personal:'Personal', team:'Team', ground:'Ground team', about:'About this demo'};
const SCENES = [[20,'amara','Normal shift'],[26,'tomas','Late duty, poor sleep'],[38,'erik','Night alarm'],[55,'sofia','CO₂ fault and overtime'],[64,'amara','Solar particle event'],[71,'leila','Warm sleep station'],
  [85,'sofia','Slow withdrawal'],[80,'kenji','Critical readings'],[89,'leila','Wearable offline'],[92,'tomas','Spacewalk tomorrow'],[100,'erik','Crew tension']];
const state = {session:null, loginStep:null, view:'personal', day:20, person:'amara', role:'director', profile:'iss', sheet:null, tool:null, draft:null, adraft:null, details:false, err:'', rtResult:null};
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const P = () => PEOPLE.find(p => p.id === state.person);
const nameOf = id => PEOPLE.find(p => p.id === id).name;
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const nowHour = () => { const d = new Date(); return d.getHours() + d.getMinutes()/60; };
const ICON = {
  normal:'<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="9" fill="var(--ok)"/><path d="M5.6 10.4l3 3 5.8-6.6" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  warning:'<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.5 19 18H1Z" fill="var(--warn)"/><rect x="9" y="7" width="2" height="6" fill="#1a1300"/><rect x="9" y="14.3" width="2" height="2" fill="#1a1300"/></svg>',
  critical:'<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6.2 1h7.6L19 6.2v7.6L13.8 19H6.2L1 13.8V6.2Z" fill="var(--crit)"/><rect x="9" y="4.5" width="2" height="7" fill="#fff"/><rect x="9" y="13" width="2" height="2.2" fill="#fff"/></svg>',
  unavailable:'<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8" fill="none" stroke="var(--muted)" stroke-width="2" stroke-dasharray="3 3"/><rect x="5.5" y="9" width="9" height="2" fill="var(--muted)"/></svg>',
  early:'<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M2 5l5 4 4-2 7 8" fill="none" stroke="var(--accent)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M13 15h5v-5" fill="none" stroke="var(--accent)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  report:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v12H9l-5 4Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8 9h8M8 12h5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  bell:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a6 6 0 0 0-6 6v4l-2 3h16l-2-3V9a6 6 0 0 0-6-6Z" fill="currentColor"/><path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" stroke-width="2" fill="none"/></svg>',
  sleep:'<svg viewBox="0 0 30 30" aria-hidden="true"><path d="M20 4a11 11 0 1 0 6 16A9 9 0 0 1 20 4Z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/></svg>',
  fatigue:'<svg viewBox="0 0 30 30" aria-hidden="true"><rect x="3" y="9" width="21" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2.2"/><rect x="25" y="12.5" width="2.5" height="5" fill="currentColor"/><rect x="6" y="12" width="4" height="6" fill="currentColor"/></svg>',
  overwhelmed:'<svg viewBox="0 0 30 30" aria-hidden="true"><path d="M3 10c4-4 8 4 12 0s8 4 12 0M3 16c4-4 8 4 12 0s8 4 12 0M3 22c4-4 8 4 12 0s8 4 12 0" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  focus:'<svg viewBox="0 0 30 30" aria-hidden="true"><circle cx="15" cy="15" r="11" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="15" cy="15" r="5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-dasharray="3 3"/></svg>',
  irritable:'<svg viewBox="0 0 30 30" aria-hidden="true"><path d="M3 18l5-8 4 9 4-11 4 10 4-6 3 4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  anxious:'<svg viewBox="0 0 30 30" aria-hidden="true"><path d="M15 15m-2 0a2 2 0 1 0 4 0a5 5 0 1 0-10 0a8 8 0 1 0 16 0a11 11 0 1 0-22 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  low:'<svg viewBox="0 0 30 30" aria-hidden="true"><path d="M8 20a5 5 0 0 1 1-10 7 7 0 0 1 13 2 4 4 0 0 1 0 8Z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M11 24v2M16 24v3M21 24v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  tension:'<svg viewBox="0 0 30 30" aria-hidden="true"><circle cx="8" cy="9" r="3.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="22" cy="9" r="3.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M2 25c0-5 3-8 6-8s6 3 6 8M16 25c0-5 3-8 6-8s6 3 6 8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M13.5 5l3 3M16.5 5l-3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  astronaut:'<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="18" r="12" fill="none" stroke="currentColor" stroke-width="3"/><path d="M16 16a8 8 0 0 1 16 0v4H16Z" fill="currentColor" opacity=".25"/><path d="M8 44c0-9 7-14 16-14s16 5 16 14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
  ground:'<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M10 30a16 16 0 0 1 22-22Z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M21 19l11-11M30 6l4 4" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M16 30l-4 14h20l-4-14" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/></svg>',
  heart:'<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 17s-7-4.4-7-9.2A3.8 3.8 0 0 1 10 5.6a3.8 3.8 0 0 1 7 2.2C17 12.6 10 17 10 17Z" fill="var(--crit)"/></svg>'
};
const chip = l => `<span class="chip lvl-${l}">${ICON[l]}${WORD[l]}</span>`;
const dot = l => `<span class="dot lvl-${l}" aria-hidden="true"></span>`;
const basisTag = b => b === 'source' ? '<span class="tag">Source-backed</span>' : b === 'mixed' ? '<span class="tag">Source-backed</span> <span class="tag demo">Demo rule</span>' : '<span class="tag demo">Demo rule</span>';
const colorKey = () => `<p class="key" aria-label="Colour key">${chip('normal')}${chip('warning')}${chip('critical')}<span class="small">Same colours on every screen. Every colour also has its own shape and word.</span></p>`;
const ACTION = {
  sleep:['Start winding down an hour earlier tonight and switch to pre-sleep lighting.',[['2 hours before sleep','Pre-sleep lighting (warm).'],['30 minutes before','Screens off.'],['Then','Into your sleep station.']]],
  attention:['Take a 20-minute break before your next demanding task, and ask for a second check on critical steps.',[['Now','Stop. Set a 20-minute timer.'],['During','Eyes off screens. Move and drink water.'],['After','Read each critical step aloud. A crewmate confirms.']]],
  mood:['Take your protected personal time today. Rimau is here to talk, and a private call is there if you want one.',[['Today','Block one hour with no tasks.'],['In it','Music, a window, writing, or nothing.'],['If you want','Ask for a private call.']]],
  body:['Make today a lighter exercise day and drink more water.',[['Exercise','Do about half of today\'s session.'],['Through the day','A drink with every meal and break.'],['Tonight','Note how you feel.']]],
  social:['Join the shared meal today, or call home.',[['Next meal','Eat with the crew.'],['Or','Pair up on one task today.'],['Or','Book a call home.']]],
  workload:['Review the next duty block with the crew lead, and protect your next day off.',[['Today','List what can move to another day.'],['With the crew lead','Agree what moves.'],['After','Keep your next full day off.']]],
  co2:['Tell the crew lead if you get a headache or feel foggy. Ground is working on the CO₂ level.',null],
  temp:['Check the vent in your sleep station and tell the crew lead the cabin feels off.',null],
  stationtemp:['Use the cabin remote below to bring your sleep station back to 20 to 25 °C.',null],
  humidity:['Tell the crew lead the cabin air feels off. Ground can adjust it.',null],
  noise:['Use ear protection tonight and report where the noise came from.',null],
  radiation:['Move to the shielded shelter now and follow the crew lead. Ground is tracking the solar particle event.',[['Now','Go to the shielded area.'],['While there','Essential tasks only.'],['After','Wait for the all-clear from ground.']]]
};
function nextAction(p, st){
  if(st.level === 'normal') return {text:st.early.length ? 'Nothing to change yet. Keep your routine.' : 'Nothing to do. Keep your routine.', steps:null};
  const rad = st.drivers.find(r => r.id === 'radiation');
  const d = rad || st.drivers.find(r => r.group === 'You') || st.drivers[0];
  if(d.id === 'clock') return {text:'Follow tonight\'s lighting plan to bring your body clock in step.', steps:lightingPlan(p.id, state.day).steps};
  if(d.id === 'light') return {text:'Switch your sleep station to pre-sleep lighting 2 hours before your sleep window. You can do it with the cabin remote.', steps:lightingPlan(p.id, state.day).steps};
  const a = ACTION[d.domain || d.id]; return {text:a[0], steps:a[1]};
}
const howTo = (steps, label) => steps ? `<details class="how" style="margin-top:8px"><summary>${label || 'Show me how'}</summary><div class="strip" role="img" aria-label="Steps in order">${steps.map(s => `<div><span class="t">${s[0]}</span><b></b><span>${s[1]}</span></div>`).join('')}</div></details>` : '';
const activeAlert = pid => store.alerts.filter(a => a.pid === pid && !a.closed).slice(-1)[0];
const whenOf = e => `Day ${e.day} · ${hh(e.t)}`;
const expTag = e => e.expected === 'yes' ? '<span class="tag">Expected</span>' : e.expected === 'no' ? '<span class="tag">Not planned</span>' : '';
const toMin = t => { const [H, M] = t.split(':').map(Number); return H*60 + M; };
function spark(series){
  const W = 110, H = 28, lo = -4, hi = 2, X = i => 2 + i*(W - 6)/(series.length - 1), Y = v => 2 + (hi - clamp(v, lo, hi))/(hi - lo)*(H - 4);
  let segs = [], cur = []; series.forEach((v, i) => { if(v === null){ if(cur.length) segs.push(cur); cur = []; } else cur.push(X(i).toFixed(1)+','+Y(v).toFixed(1)); }); if(cur.length) segs.push(cur);
  const last = series.length - 1, lv = series[last];
  return `<svg class="spark" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Daily score, last 4 weeks"><line x1="2" x2="${W-4}" y1="${Y(0)}" y2="${Y(0)}" stroke="var(--axis)"/><line x1="2" x2="${W-4}" y1="${Y(-2)}" y2="${Y(-2)}" stroke="var(--warn)" stroke-dasharray="3 3"/>${segs.map(s => `<polyline points="${s.join(' ')}" fill="none" stroke="var(--ink-2)" stroke-width="1.6" stroke-linejoin="round"/>`).join('')}${lv !== null ? `<circle cx="${X(last)}" cy="${Y(lv)}" r="3" fill="var(--accent)" stroke="var(--surface)" stroke-width="1.5"/>` : ''}</svg>`;
}

/* ---------- live values: heart rate and radiation tick like a real feed ---------- */
function hrNow(p, day){
  const act = activityAt(p.id, day, nowHour()), add = {aerobic:52, resistive:38, eva:34, drill:40, evaprep:12, maintenance:10, cargo:12, sleep:-4}[act] || 6;
  return Math.round(val(p, 'rhr', day) !== null ? val(p, 'rhr', day) + add : p.base.rhr.mean + add);
}
const live = (kind, base, dp, unit) => `<span class="livev" data-live="${kind}" data-base="${base}" data-dp="${dp}">${(+base).toFixed(dp)}</span>${unit ? ' '+unit : ''}`;
setInterval(() => {
  const t = Date.now()/1000;
  document.querySelectorAll('[data-live]').forEach((el, i) => {
    const b = +el.dataset.base, dp = +el.dataset.dp, k = el.dataset.live;
    if(k === 'clock'){ const d = new Date(); el.textContent = d.toTimeString().slice(0, 8); return; }
    const amp = k === 'hr' ? 2.5 : b*0.05;
    el.textContent = (b + amp*Math.sin(t*1.3 + i) + amp*0.4*(Math.random() - 0.5)).toFixed(dp);
  });
}, 1500);

/* ================= Login ================= */
function renderLogin(){
  const crew = state.loginStep === 'crew';
  $('login').innerHTML = `<div class="login">
    <img class="mascot" src="assets/mascot.jpg" alt="Rimau, the team's tiger astronaut mascot" width="120" height="120">
    <h1>Astronaut Health Monitoring System</h1>
    <p class="sub">Behavioural health, sleep, cabin safety and crew support. Hackathon demo.</p>
    ${crew ? `<h2 style="margin-top:8px">Which crew member are you?</h2>
      <div class="crewpick">${PEOPLE.map(p => `<button class="pick" data-act="pickcrew" data-pid="${p.id}"><span class="av av-${p.id}">${p.name[0]}</span><strong>${p.name}</strong><span class="small">${p.role}</span></button>`).join('')}</div>
      <button class="btn" data-act="loginback">Back</button>`
    : `<h2 style="margin-top:8px">Sign in as</h2>
      <div class="roles">
        <button class="role" data-act="loginastro">${ICON.astronaut}<strong>Astronaut</strong><span>Your own status, Rimau, cabin remote and sleep report. Plus a view of your crew.</span></button>
        <button class="role" data-act="loginground">${ICON.ground}<strong>Ground Team</strong><span>Supervise the whole crew: alerts, statuses, cabin safety and CCTV.</span></button>
      </div>`}
    <p class="small">Demo sign-in: no password, nothing is sent anywhere.</p>
    <button class="devlink" data-act="logindemo">Developer: demo walkthrough (all tabs)</button>
  </div>`;
}

/* ================= Personal tab ================= */
const GROUPS = [
  {id:'vitals', name:'Vitals', ids:['rhr','hrv'], key:['rhr','hrv']},
  {id:'mind',   name:'Mental state', ids:['mood','stress','irritability','rt','wm'], key:['mood','stress','rt']},
  {id:'social', name:'Social and voice', ids:['crew','speech','pitch','pauses'], key:['crew','speech']},
  {id:'sleep',  name:'Sleep and schedule', ids:['sleeph','sleepe','clock','workload'], key:['sleeph','clock','workload']},
  {id:'env',    name:'Cabin and safety', ids:['radiation','stationtemp','co2','temp','humidity','noise','light'], key:['radiation','stationtemp','co2']}
];
function groupCard(g, p, st){
  const rows = g.ids.map(id => st.rows.find(r => r.id === id)).filter(Boolean), scored = rows.filter(r => r.level !== 'unavailable');
  const lvl = scored.reduce((a, r) => RANK[r.level] > RANK[a] ? r.level : a, 'normal'), off = scored.filter(r => r.level !== 'normal');
  const short = r => r.id === 'sleeph' ? r.value.replace(' last night', '') : r.value;
  const tile = r => `<div class="tile lvl-${r.level}"><span class="small">${r.name.replace('Cabin radiation', 'Radiation').replace('Cabin ', '').replace('Sleep station temperature', 'Sleep station')}</span><strong>${r.id === 'radiation' ? live('rad', r.raw, 1, 'µSv/h') : short(r)}</strong></div>`;
  const keys = g.key.map(id => rows.find(r => r.id === id)).filter(Boolean);
  const hr = g.id === 'vitals' ? `<div class="tile lvl-normal"><span class="small">${ICON.heart.replace('<svg', '<svg style="width:12px;height:12px;vertical-align:-1px"')} Heart rate now</span><strong>${live('hr', hrNow(p, state.day), 0, 'bpm')}</strong></div>` : '';
  return `<section class="group lvl-${lvl}" aria-label="${g.name}">
    <header>${ICON[lvl]}<h3>${g.name}</h3><span class="small">${WORD[lvl]}</span></header>
    <p class="gsum">${off.length ? off.slice(0, 2).map(r => esc(r.plain || r.name)).join('. ') + '.' : rows.length > scored.length ? 'In range. One reading is unavailable.' : 'All in your usual range.'}</p>
    <div class="tiles">${hr}${keys.map(tile).join('')}</div>
    ${state.details ? `<div class="tl" style="margin-top:8px">${rows.map(r => `<div class="ev"><div style="display:flex;justify-content:space-between;gap:10px;align-items:center"><span><strong>${r.name}</strong> · ${r.id === 'radiation' ? live('rad', r.raw, 1, 'µSv/h') : r.value}<br><span class="small">${r.source} · ${r.label}</span></span>${chip(r.level)}</div>
        ${r.trend ? `<div style="margin-top:4px">${spark(r.trend.series)}</div>` : ''}<p class="small" style="margin-top:4px">${esc(r.rule)}</p></div>`).join('')}</div>` : ''}
  </section>`;
}
function remoteCard(p){
  const r = remoteOf(p.id), row = readings(p, state.day).find(x => x.id === 'stationtemp');
  const temp = r && r.temp !== null && r.temp !== undefined ? r.temp : Math.round(parseFloat(row.value)*2)/2, mode = r ? r.light : 'general', bright = r ? r.bright : 70;
  const lvl = band(temp, THRESHOLDS.temp);
  return `<section class="card" aria-label="Cabin remote"><div class="eyebrow">CABIN REMOTE · YOUR SLEEP STATION</div>
    <div class="remote">
      <div><span class="lab">Temperature</span><div class="dial lvl-${lvl}"><button class="btn round" data-act="temp" data-d="-0.5" aria-label="Cooler">−</button><strong>${temp.toFixed(1)} °C</strong><button class="btn round" data-act="temp" data-d="0.5" aria-label="Warmer">+</button></div>
        <p class="small">${lvl === 'normal' ? 'In the 20 to 25 °C comfort zone.' : `${chip(lvl)} Outside the 20 to 25 °C comfort zone.`}</p></div>
      <div><span class="lab">Lighting</span><div class="btnrow seg" role="group" aria-label="Lighting mode">${Object.entries(LIGHT_MODES).map(([k, v]) => `<button class="btn sm" data-act="light" data-mode="${k}" aria-pressed="${mode === k}">${v.split(' (')[0]}</button>`).join('')}</div>
        <label class="lab" for="bright" style="display:block;margin-top:8px">Brightness <span id="brightv">${bright}</span> %</label><input type="range" id="bright" min="0" max="100" step="5" value="${bright}"></div>
    </div>
    <p class="small">${LIGHT_MODES[mode]}. Changes apply now and to tonight's sleep, so they show up in tomorrow's sleep report.${r ? ` Set on day ${r.from}.` : ''}</p>
  </section>`;
}
function sleepChart(s){
  const W = 640, L = 92, R = 12, X = t => L + (t - s.start)/(s.end - s.start)*(W - L - R), T = THRESHOLDS;
  const panels = [
    {k:'noise', name:'Noise', unit:'dBA', dp:0, lim:[T.noise.warn]},
    {k:'co2', name:'CO₂', unit:'mmHg', dp:1, lim:[T.co2.warn]},
    {k:'temp', name:'Temperature', unit:'°C', dp:1, lim:[T.temp.ok[0], T.temp.ok[1]]},
    {k:'hum', name:'Humidity', unit:'%', dp:0, lim:[T.humidity.ok[1]]}
  ];
  const BAR = 30, PH = 46, GAP = 8, top = 6, H = top + BAR + GAP + panels.length*(PH + GAP) + 18;
  let svg = '';
  // sleep bar: awake before onset, asleep after, awake marks at each disturbance
  const by = top;
  svg += `<text x="${L - 8}" y="${by + BAR/2 + 4}" text-anchor="end" class="axl">Sleep</text>`;
  svg += `<rect x="${X(s.start)}" y="${by}" width="${X(s.onset) - X(s.start)}" height="${BAR}" rx="4" fill="var(--sunk)"/>`;
  svg += `<rect x="${X(s.onset) + 2}" y="${by}" width="${X(s.end) - X(s.onset) - 2}" height="${BAR}" rx="4" fill="#5b7fbf"/>`;
  s.D.forEach((d, i) => { const x = X(Math.max(d.t, s.start)), w = Math.max(4, X(d.t + d.dur/60) - x);
    svg += `<rect x="${x}" y="${by}" width="${w}" height="${BAR}" fill="var(--${d.level === 'critical' ? 'crit' : d.level === 'warning' ? 'warn' : 'muted'})"/><text x="${x + w/2}" y="${by + BAR/2 + 4}" text-anchor="middle" class="num">${i + 1}</text>`; });
  panels.forEach((pn, j) => {
    const y0 = top + BAR + GAP + j*(PH + GAP), vals = s.S.map(v => v[pn.k]).concat(pn.lim), lo = Math.min(...vals), hi = Math.max(...vals), pad = (hi - lo)*0.15 || 1;
    const Y = v => y0 + PH - (v - (lo - pad))/((hi + pad) - (lo - pad))*PH;
    svg += `<rect x="${L}" y="${y0}" width="${W - L - R}" height="${PH}" fill="var(--sunk)" rx="4"/>`;
    svg += `<text x="${L - 8}" y="${y0 + PH/2}" text-anchor="end" class="axl">${pn.name}</text><text x="${L - 8}" y="${y0 + PH/2 + 13}" text-anchor="end" class="axu">${pn.unit}</text>`;
    pn.lim.forEach(l => { svg += `<line x1="${L}" x2="${W - R}" y1="${Y(l)}" y2="${Y(l)}" stroke="var(--warn)" stroke-width="1.5" stroke-dasharray="4 3"/>`; });
    svg += `<text x="${W - R - 4}" y="${Y(pn.lim[pn.lim.length - 1]) - 3}" text-anchor="end" class="axu">limit ${pn.lim[pn.lim.length - 1]}</text>`;
    svg += `<polyline points="${s.S.map(v => X(v.t).toFixed(1)+','+Y(v[pn.k]).toFixed(1)).join(' ')}" fill="none" stroke="var(--ink-2)" stroke-width="2" stroke-linejoin="round"/>`;
  });
  s.D.forEach(d => { const x = X(Math.max(d.t, s.start)); svg += `<line x1="${x}" x2="${x}" y1="${top + BAR}" y2="${H - 18}" stroke="var(--${d.level === 'critical' ? 'crit' : d.level === 'warning' ? 'warn' : 'muted'})" stroke-width="1.5" stroke-dasharray="2 3"/>`; });
  for(let t = Math.ceil(s.start/2)*2; t <= s.end; t += 2) svg += `<text x="${X(t)}" y="${H - 4}" text-anchor="middle" class="axu">${hh(t)}</text>`;
  return `<div class="chartwrap"><svg class="sleepchart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Sleep session with noise, CO₂, temperature and humidity across the night. Disturbances are listed below." data-sleep="1" data-l="${L}" data-r="${R}" data-w="${W}">${svg}<line class="xh" x1="0" x2="0" y1="${top}" y2="${H - 18}" stroke="var(--accent)" stroke-width="1.5" visibility="hidden"/><rect x="${L}" y="${top}" width="${W - L - R}" height="${H - top - 18}" fill="transparent" class="hit"/></svg><div class="tip" hidden></div></div>`;
}
let SLEEP_NOW = null;
function sleepCard(p){
  const s = sleepSession(p, state.day); SLEEP_NOW = s;
  const head = s.slept === null ? 'No wearable reading last night' : `${s.slept.toFixed(1)} h asleep · ${s.eff === null ? '–' : Math.round(s.eff)+' %'} efficiency · ${s.D.length} disturbance${s.D.length === 1 ? '' : 's'}`;
  return `<section class="card" aria-label="Sleep report"><div class="eyebrow">SLEEP REPORT · NIGHT BEFORE DAY ${state.day} · ${hh(s.start)} TO ${hh(s.end)}</div>
    <h3>${head}</h3>
    ${sleepChart(s)}
    ${s.D.length ? `<ol class="dist">${s.D.map((d, i) => `<li><span class="num-b lvl-${d.level}">${i + 1}</span><div><strong>${hh(d.t)} · ${d.kind}</strong> <span class="small">${d.dur} min awake</span><br>${esc(d.what)}<br><span class="small">Cabin data: ${esc(d.env)}</span></div></li>`).join('')}</ol>` : '<p class="small" style="margin-top:6px">No disturbances. The cabin stayed inside its limits all night.</p>'}
    <div class="btnrow" style="margin-top:10px">${state.day < 120 ? '<button class="btn" data-act="nextnight">Sleep through to tomorrow (demo)</button>' : ''}<span class="small">Hover the chart to read values. Simulated wearable and cabin sensors.</span></div>
  </section>`;
}
function reportCard(p, r){
  const inv = investigate(p, r.day, r.symptoms), f = inv.findings[0], fu = store.followups.find(x => x.rid === r.id);
  const shareTxt = {surgeon:'Details visible to the flight surgeon only.', crew:'Details visible to the crew lead and the flight surgeon.', device:'Kept on this device. Nobody else can see it.'}[r.share];
  const block = x => `<div class="finding"><div><b>What happened</b>${x.what}</div><div><b>Why it may matter</b>${x.why}</div><div><b>What to check next</b>${x.next}</div></div><p style="margin-top:8px">${x.labels.map(l => `<span class="tag">${l}</span>`).join(' ')}</p>`;
  const tool = inv.tool ? `<button class="btn primary" data-act="opentool" data-tool="${inv.tool}">${inv.tool === 'lighting' ? 'Open tonight\'s lighting plan' : 'Open: '+TOOLS[inv.tool].name}</button>` : '';
  return `<section class="card" aria-label="Your report">
    <div class="eyebrow">YOU REPORTED · ${r.time}</div>
    <h3>${r.symptoms.map(s => SYMPTOMS[s]).join(', ')}</h3>
    <p class="small">Thanks, that is logged. ${shareTxt}</p>
    ${f ? `<p style="margin-top:10px;font-weight:700">One thing stands out:</p>${block(f)}`
       : `<p style="margin-top:10px;font-weight:700">Cause unclear</p><p>Nothing in your schedule, the cabin readings or your check-ins stands out.</p><div class="finding"><div><b>Next step</b>${inv.next}</div></div>`}
    ${inv.findings.length > 1 ? `<details class="how" style="margin-top:10px"><summary>${inv.findings.length - 1} more thing${inv.findings.length > 2 ? 's' : ''} noticed</summary>${inv.findings.slice(1).map(block).join('<hr style="border:0;border-top:1px solid var(--line);margin:10px 0">')}</details>` : ''}
    <div class="btnrow" style="margin-top:12px">${tool}${fu ? `<span class="small">Private follow-up requested at ${fu.time}.</span>` : `<button class="btn" data-act="followup" data-rid="${r.id}">Request a private follow-up</button>`}</div>
  </section>`;
}
function alertCard(a){
  const g = a.ack.ground, ground = a.delay ? (g ? `Acknowledged on Earth ${g.time}. Reply reaches you about ${g.reaches}` : `Reaches ground about ${addMin(a.time, a.delay)}`) : (g ? 'Acknowledged '+g.time : 'Waiting');
  return `<section class="card crit-card" aria-live="polite">
    <div class="eyebrow">ALERT RAISED · ${a.time}</div>
    <h3>Your crew and ground have been told</h3>
    <div class="ackrow"><span>Onboard crew</span><strong>${a.ack.crew ? 'Acknowledged '+a.ack.crew.time : 'Waiting'}</strong></div>
    <div class="ackrow"><span>Ground team</span><strong style="text-align:right">${ground}</strong></div>
    ${a.delay ? `<p style="margin-top:6px">On this mission ground cannot reply for at least ${2*a.delay} minutes. Your crewmates and the crew medical officer respond first.</p>
      <div class="btnrow" style="margin-top:6px"><button class="btn" data-act="opentool" data-tool="calm">While you wait: two-minute reset</button></div>` : ''}
    <p class="small" style="margin-top:6px">Delivery${a.delay ? ' and light-time delay are' : ' is'} simulated. The Team and Ground team tabs can acknowledge it.</p>
    <button class="btn" data-act="closealert" data-aid="${a.id}" style="margin-top:8px">I'm OK now, close alert</button>
  </section>`;
}
function readinessCard(p){
  const t = nextTask(p.id, state.day, 2); if(!t) return '';
  const r = readiness(p, state.day, t), when = t.day === state.day ? 'today' : t.day === state.day + 1 ? 'tomorrow' : 'in 2 days';
  return `<section class="card"><div class="eyebrow">COMING UP · READINESS</div><h3>${t.name} ${when} at ${hh(t.hour)}</h3>
    <div class="status ${r.level}" style="padding:10px;margin-top:8px">${ICON[r.level].replace('<svg', '<svg style="width:30px;height:30px"')}<div><strong style="font-size:17px">${r.advice[0]}</strong><p>${r.advice[1]}</p></div></div>
    <details class="how" style="margin-top:8px"><summary>What this is based on</summary><div class="tl">${r.items.map(i => `<div class="ev" style="display:flex;justify-content:space-between;gap:10px"><span>${i.name}<br><span class="small">${esc(i.r.rule)}</span></span>${chip(i.r.level)}</div>`).join('')}</div>
      <p class="small" style="margin-top:6px">Based on how things are now, not a forecast. Advisory: the crew lead and flight surgeon make the call.</p></details>
    ${r.check ? '' : `<button class="btn" data-act="openrt" style="margin-top:8px">Take a 1-minute reaction check</button>`}
  </section>`;
}
function home(p, st){
  const na = nextAction(p, st), reps = store.reports.filter(r => r.pid === p.id && r.day === state.day), al = activeAlert(p.id), ci = store.checkins.find(c => c.pid === p.id && c.day === state.day);
  const line = st.level === 'normal' ? 'All monitored readings are in range.' : st.drivers.slice(0, 2).map(d => d.plain).join('. ') + (st.drivers.length > 2 ? `, and ${st.drivers.length - 2} more.` : '.');
  const areaName = a => DOMAINS.find(d => d.id === a).name.toLowerCase();
  const early = st.level === 'normal' && st.early.length ? `<p class="early">${ICON.early.replace('<svg', '<svg style="width:18px;height:18px;flex:none"')}<span><strong>Early sign:</strong> your ${st.earlyAreas.map(areaName).join(' and ')} readings have been slowly moving away from your usual for about 3 weeks. They are still in range, so nothing to change yet.</span></p>` : '';
  const tl = state.details ? timeline({pid:p.id, day:state.day, span:3, viewer:'self'}) : [];
  const lastRep = reps[reps.length - 1], rad = radiation(state.day);
  return `<div class="astro">
    <div class="hello"><img class="mascot" src="assets/mascot.jpg" alt="" width="52" height="52"><div><h2>Hello, ${p.name}</h2><p class="small">${p.role} · mission day ${state.day} · ${PROFILES[state.profile].name}</p></div></div>
    ${rad.rate >= THRESHOLDS.radiation.crit ? `<section class="banner-crit" role="alert">${ICON.critical}<div><strong>Radiation alert: solar particle event.</strong> Cabin dose rate ${live('rad', rad.rate, 0, 'µSv/h')}. Move to the shielded shelter now.</div></section>` : ''}
    <section class="status ${st.level}" aria-label="Current status">${ICON[st.level]}<div><div class="eyebrow">CURRENT STATUS</div><h2>${WORD[st.level]}</h2><p>${line}</p></div></section>
    ${early}
    ${st.unavailable.length ? `<p class="small">${ICON.unavailable.replace('<svg', '<svg style="width:14px;height:14px;vertical-align:-2px"')} ${st.unavailable.length} reading${st.unavailable.length > 1 ? 's' : ''} unavailable (${st.unavailable[0].rule.match(/\(([^)]+)\)/)[1]}). Status is based on the rest.</p>` : ''}
    ${al ? alertCard(al) : ''}
    <section class="card"><div class="eyebrow">NEXT ACTION</div><p style="font-size:16px">${lastRep ? investigate(p, state.day, lastRep.symptoms).next : na.text}</p>${lastRep ? '' : howTo(na.steps)}</section>
    ${readinessCard(p)}
    ${lastRep ? reportCard(p, lastRep) : ''}
    <div class="groups-head"><h3>My readings</h3><button class="btn sm" data-act="details" aria-expanded="${state.details}">${state.details ? 'Hide details' : 'Show details'}</button></div>
    <div class="groups">${GROUPS.map(g => groupCard(g, p, st)).join('')}</div>
    ${state.details ? `<section class="card"><h3>Self-guided tools</h3><p class="small">Private. Nothing is saved or shared.</p><div class="btnrow" style="margin-top:6px">${Object.entries(TOOLS).map(([k, t]) => `<button class="btn" data-act="opentool" data-tool="${k}">${t.name}</button>`).join('')}<button class="btn" data-act="opentool" data-tool="lighting">Tonight's lighting plan</button></div>
      <h3 style="margin-top:14px">My last 3 days</h3><div class="tl">${tl.length ? tl.map(e => `<div class="ev"><div class="w">${whenOf(e)} · ${e.source} · ${e.label} ${expTag(e)}</div>${esc(e.what)}${e.next ? `<div class="small">Next: ${esc(e.next)}</div>` : ''}</div>`).join('') : '<p class="small">Nothing logged.</p>'}</div></section>` : ''}
    ${!ci && !reps.length ? `<section class="card note"><div class="eyebrow">QUICK CHECK-IN</div><p style="margin-bottom:8px">How are you today?</p><div class="three"><button class="btn" data-act="checkin" data-a="Good">Good</button><button class="btn" data-act="checkin" data-a="OK">OK</button><button class="btn" data-act="checkin" data-a="Not great">Not great</button></div></section>` : ci && !reps.length ? `<p class="small">Checked in at ${ci.time}: ${esc(ci.answer)}.</p>` : ''}
    <div class="bigbtns two">
      <button class="big" data-act="openreport">${ICON.report}Report how I feel</button>
      <button class="big alert" data-act="openalert">${ICON.bell}Alert crew &amp; ground</button>
    </div>
    ${remoteCard(p)}
    ${sleepCard(p)}
  </div>`;
}
function reportSheet(){
  const d = state.draft;
  return `<div class="astro sheet"><h2>How do you feel?</h2><p class="sub">Pick any that fit. Your readings do not have to be off for this to count.</p>
    <div class="opts">${Object.entries(SYMPTOMS).map(([k, v]) => `<button class="opt" data-act="sym" data-s="${k}" aria-pressed="${d.symptoms.includes(k)}">${ICON[k]}${v}</button>`).join('')}</div>
    <div><label class="lab" for="detail">Anything to add? Optional.</label><textarea id="detail" maxlength="300">${esc(d.detail)}</textarea></div>
    <fieldset style="border:0;padding:0;margin:0"><legend class="lab">Who can see the details?</legend>
      ${[['surgeon','Flight surgeon only'],['crew','Crew lead and flight surgeon'],['device','Nobody. Keep it on this device']].map(([k, v]) => `<label class="radio"><input type="radio" name="share" id="share-${k}" value="${k}" ${d.share === k ? 'checked' : ''}> ${v}</label>`).join('')}</fieldset>
    ${state.err ? `<p class="err" role="alert">${state.err}</p>` : ''}
    <div class="bigbtns"><button class="big" data-act="submitreport" style="background:var(--navy);color:#fff;border-color:var(--navy)">Send report</button><button class="btn" data-act="cancel">Cancel</button></div></div>`;
}
function alertSheet(p, st){
  const d = state.adraft, pr = PROFILES[state.profile];
  return `<div class="astro sheet"><h2>Alert crew &amp; ground?</h2><p>This tells your crewmates on board and the ground team that you want help now.</p>
    <div class="card note"><div class="eyebrow">WHAT IS SHARED</div><p>Your name, the time, and your current status (${WORD[st.level]}). Nothing else unless you add it.</p></div>
    <label class="radio"><input type="checkbox" id="incl" ${d.include ? 'checked' : ''}> Also share what is wrong</label>
    ${d.include ? `<div class="opts">${Object.entries(SYMPTOMS).map(([k, v]) => `<button class="opt" data-act="asym" data-s="${k}" aria-pressed="${d.symptoms.includes(k)}">${ICON[k]}${v}</button>`).join('')}</div>` : ''}
    ${pr.delay ? `<p>${pr.name}: the alert reaches ground about ${pr.delay} minutes after you send it. Your crewmates see it straight away.</p>` : ''}
    <p class="small">Delivery is simulated in this demo: the alert appears in the Team and Ground team tabs of this browser. Nothing is sent anywhere.</p>
    <div class="bigbtns"><button class="big alert" data-act="sendalert">${ICON.bell}Send alert</button><button class="btn" data-act="cancel">Cancel</button></div></div>`;
}
function toolSheet(p){
  const k = state.tool;
  if(k === 'lighting'){ const L = lightingPlan(p.id, state.day), c = clockState(p.id, state.day);
    return `<div class="astro sheet"><div class="eyebrow">TONIGHT'S LIGHTING PLAN</div><h2>${L.need === 'none' ? 'Keep your usual evening light' : L.need === 'earlier' ? 'Shift your body clock earlier' : 'Shift your body clock later'}</h2>
      <p>${L.need === 'none' ? 'Your body clock looks in step with tonight\'s sleep window.' : `Tonight's sleep window is about ${Math.abs(c.gap).toFixed(1)} h ${c.gap < 0 ? 'earlier' : 'later'} than your body clock is likely set for.`}</p>
      <ol class="toolsteps">${L.steps.map(s => `<li><strong>${s[0]}</strong><br>${s[1]}</li>`).join('')}</ol>
      <p class="small">The lighting modes are the station's own: general (4500 K), pre-sleep (2700 K, warm) and phase-shift (6500 K, cool, blue-enriched). Set them from the cabin remote. The timing here is demo guidance, and the body clock is an estimate from your sleep schedule.</p>
      <button class="big" data-act="cancel">Done</button></div>`; }
  const T = TOOLS[k];
  return `<div class="astro sheet"><div class="eyebrow">SELF-GUIDED · PRIVATE</div><h2>${T.name}</h2><p class="sub">${T.when}</p>
    ${T.breathe ? `<div class="breath" aria-hidden="true"><div class="ring"></div></div><p class="small" style="text-align:center">In for 4 seconds as the circle grows, out for 6 as it shrinks.</p>` : ''}
    <ol class="toolsteps">${T.steps.map(s => `<li>${s}</li>`).join('')}</ol>
    <p class="small">Nothing here is saved or shared. Demo content written in the spirit of NASA-funded self-guided programs for crews; it is not a validated treatment.</p>
    <p class="small">If it feels like too much, use Alert crew &amp; ground.</p>
    <button class="big" data-act="cancel">Done</button></div>`;
}
function rtSheet(p){
  const r = state.rtResult;
  return `<div class="astro sheet"><div class="eyebrow">REACTION CHECK</div><h2>Tap as soon as the box turns orange</h2><p class="sub">Five rounds, about a minute. The ISS has used a short reaction self-test like this since 2009.</p>
    <button id="pad" type="button" class="pad">${r ? 'Start again' : 'Start'}</button><p id="padout" class="small" aria-live="polite">${r ? `Average ${r.ms} ms: ${Math.abs(r.z).toFixed(1)} SD ${r.z < 0 ? 'slower' : 'faster'} than ${p.name}'s normal of ${Math.round(p.base.rt.mean)} ms. ${WORD[r.level]}.` : ''}</p>
    <p class="small">Demo: your own taps are compared with ${p.name}'s simulated normal. Warning at 2 SD slower, Critical at 3 SD (demo rules).</p>
    <button class="big" data-act="cancel">${r ? 'Done' : 'Cancel'}</button></div>`;
}
function renderPersonal(){
  const p = P(), st = personStatus(p, state.day);
  $('astro').innerHTML = state.sheet === 'report' ? reportSheet() : state.sheet === 'alert' ? alertSheet(p, st) : state.sheet === 'tool' ? toolSheet(p) : state.sheet === 'rt' ? rtSheet(p) : home(p, st);
  renderRimau();
}

/* ================= Shared panels ================= */
function alertsPanel(side, compact){
  const list = store.alerts.filter(a => a.day === state.day || !a.closed).slice().reverse(), who = side === 'crew' ? 'Onboard crew' : state.role === 'surgeon' ? 'Flight surgeon' : 'Flight director';
  if(compact && !list.length) return '';
  return `<section class="panel"><h2>Alerts</h2><p class="sub">Delivery is simulated: alerts raised on the Personal tab of this browser appear here.</p>
    <div style="display:flex;flex-direction:column;gap:10px;margin-top:10px">${list.length ? list.map(a => { const n = nameOf(a.pid), k = side === 'crew' ? 'crew' : 'ground', g = a.ack.ground;
      return `<div class="alertbox${a.closed || (a.ack.crew && g) ? ' done' : ''}"><div><strong>${n} asked for help</strong> · Day ${a.day}, raised on board ${a.time}${a.delay && side === 'ground' ? `, reached ground ${addMin(a.time, a.delay)}` : ''} · status at the time: ${chip(a.level)}</div>
        <div>${a.symptoms && a.symptoms.length ? 'Shared: '+a.symptoms.map(s => SYMPTOMS[s]).join(', ')+'.' : 'No symptom details shared.'}</div>
        <div class="small">Onboard crew: ${a.ack.crew ? 'acknowledged '+a.ack.crew.time : 'waiting'} · Ground team: ${g ? 'acknowledged '+g.time+' by '+g.by+(a.delay ? ', reaches the crew about '+g.reaches : '') : 'waiting'}${a.closed ? ' · closed by '+n+' at '+a.closed.time : ''}</div>
        ${a.ack[k] || a.closed ? '' : `<div><button class="btn primary" data-act="ack" data-aid="${a.id}" data-side="${k}" data-by="${who}">Acknowledge as ${who.toLowerCase()}</button></div>`}</div>`; }).join('') : '<p class="small">No alerts.</p>'}</div></section>`;
}
function evTable(list, empty){
  return list.length ? `<div class="tablewrap"><table><thead><tr><th>When</th><th>Source</th><th>Who</th><th>What changed</th><th>Expected?</th><th>Next action</th></tr></thead><tbody>${list.map(e => `<tr><td style="white-space:nowrap">${whenOf(e)}</td><td>${e.kind}<div class="small">${e.source}<br>${e.label}</div></td><td>${esc(e.who)}</td><td>${esc(e.what)}</td><td>${expTag(e) || '<span class="small">Not established</span>'}</td><td>${esc(e.next)}</td></tr>`).join('')}</tbody></table></div>` : `<p class="small">${empty}</p>`;
}
function cabinStrip(){
  const rows = readings(PEOPLE[0], state.day).filter(r => ['radiation','temp','humidity','co2'].includes(r.id));
  return `<section class="panel"><h2>Cabin now</h2><div class="tablewrap" style="margin-top:8px"><table style="min-width:480px"><thead><tr><th>Reading</th><th>Latest</th><th>Status</th><th>Rule</th><th>Basis</th></tr></thead><tbody>${rows.map(r => `<tr class="row-${r.level}"><td>${r.name}<div class="small">${r.label}</div></td><td>${r.id === 'radiation' ? live('rad', r.raw, 1, 'µSv/h') : r.value}</td><td>${chip(r.level)}</td><td>${r.rule}</td><td>${basisTag(r.basis)}</td></tr>`).join('')}</tbody></table></div></section>`;
}
function profileNote(){ const pr = PROFILES[state.profile]; return pr.delay ? `<div class="banner"><strong>${pr.name}.</strong> ${pr.note} The crew responds first; ground replies take at least ${2*pr.delay} minutes round trip.</div>` : ''; }
function upcoming(withHealth){
  const rows = []; PEOPLE.forEach(p => TASKS.filter(t => t.who.includes(p.id) && t.day >= state.day && t.day <= state.day + 3).forEach(t => rows.push({p, t})));
  if(!rows.length) return `<section class="panel"><h2>Critical tasks, next 3 days</h2><p class="small" style="margin-top:6px">None scheduled.</p></section>`;
  rows.sort((a, b) => a.t.day - b.t.day || a.t.hour - b.t.hour);
  return `<section class="panel"><h2>Critical tasks, next 3 days</h2>${withHealth ? '<p class="sub">Readiness from current readings only, not a forecast. Advisory: the flight director and flight surgeon decide.</p>' : ''}
    <div class="tablewrap" style="margin-top:8px"><table><thead><tr><th>When</th><th>Task</th><th>Crew member</th>${withHealth ? '<th>Sleep</th><th>Attention</th><th>Workload</th><th>Body clock</th><th>Readiness</th>' : ''}</tr></thead><tbody>
    ${rows.map(({p, t}) => { if(!withHealth) return `<tr><td>Day ${t.day}, ${hh(t.hour)}</td><td>${t.name}</td><td>${p.name}</td></tr>`;
      const r = readiness(p, state.day, t); return `<tr><td>Day ${t.day}, ${hh(t.hour)}</td><td>${t.name}</td><td>${p.name}</td>${r.items.slice(0, 4).map(i => `<td>${chip(i.r.level)}</td>`).join('')}<td><strong>${r.advice[0]}</strong>${r.check ? `<div class="small">Reaction check: ${r.check.ms} ms</div>` : ''}</td></tr>`; }).join('')}
    </tbody></table></div></section>`;
}
function cctv(){
  const h = nowHour(), pos = crewPositions(state.day, h), W = 660, Hh = 260;
  const room = (x, y, w, hgt, label) => `<rect x="${x}" y="${y}" width="${w}" height="${hgt}" rx="10" fill="#1d2a40" stroke="#41587d" stroke-width="2"/><text x="${x + 10}" y="${y + 18}" class="room">${label}</text>`;
  const shelter = state.day === SPE.from;
  return `<section class="panel"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><h2>Cabin CCTV</h2><span class="tag demo">Mock feed · placeholder</span></div>
    <div class="cctv"><svg viewBox="0 0 ${W} ${Hh}" role="img" aria-label="Mock CCTV view of the cabin layout with crew positions">
      <rect width="${W}" height="${Hh}" fill="#0c1422"/>
      ${room(20, 95, 90, 90, 'Cupola')}${room(110, 30, 130, 100, 'Galley')}${room(110, 150, 130, 100, 'Life support')}
      ${room(250, 30, 170, 100, 'Laboratory')}${room(250, 150, 170, 100, 'Exercise')}${room(430, 30, 150, 100, 'Crew quarters')}${room(430, 150, 150, 100, 'Hygiene')}${room(585, 95, 65, 90, 'Airlock')}
      <rect x="282" y="${shelter ? 100 : 112}" width="106" height="${shelter ? 62 : 36}" rx="6" fill="${shelter ? '#5a1d1d' : '#22324d'}" stroke="${shelter ? '#ef5b5b' : '#41587d'}" stroke-width="2"/><text x="335" y="${shelter ? 113 : 134}" text-anchor="middle" class="room">${shelter ? 'SHIELDED SHELTER' : 'Node'}</text>
      ${pos.map(o => `<g><circle cx="${o.x}" cy="${o.y + 14}" r="8" fill="#ff8a3d" stroke="#0c1422" stroke-width="2"/><text x="${o.x}" y="${o.y + 18}" text-anchor="middle" class="cdot">${o.p.name[0]}</text></g>`).join('')}
      <rect x="0" y="0" width="${W}" height="${Hh}" fill="url(#scan)"/>
      <defs><pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="2" fill="rgba(255,255,255,.035)"/></pattern></defs>
    </svg>
    <div class="cctv-ov tl">CAM 01 · HAB OVERVIEW</div><div class="cctv-ov tr"><span class="rec"></span>REC</div><div class="cctv-ov bl">DAY ${state.day} · <span data-live="clock">${new Date().toTimeString().slice(0, 8)}</span></div></div>
    <p class="small" style="margin-top:6px">${pos.map(o => `<strong>${o.p.name}</strong>: ${o.zone.toLowerCase()}`).join(' · ')}. Positions come from the simulated schedule; no video is recorded in this demo.</p></section>`;
}

/* ================= Team tab (astronaut) ================= */
const SOFT = {normal:['Doing well','normal'], warning:['Could use some support','warning'], critical:['Needs support today','critical'], unavailable:['No data','unavailable']};
const TIPS = ['Invite them to the next shared meal.', 'Ask how their day is going, away from work.', 'Offer to pair up on a task today.', 'A quick "how are you holding up?" goes a long way.'];
function renderTeam(){
  const me = state.session && state.session.mode === 'astronaut' ? state.session.pid : state.person, h = nowHour();
  const pos = crewPositions(state.day, h), meal = h < 13 ? '13:00' : h < 19.5 ? '19:30' : 'tomorrow 07:00';
  const ci = id => store.checkins.find(c => c.pid === id && c.day === state.day);
  const cards = PEOPLE.map((q, i) => { const st = personStatus(q, state.day), lvl = st.level, s = SOFT[lvl], here = pos.find(o => o.p.id === q.id), c = ci(q.id), self = q.id === me;
    return `<article class="mate lvl-${s[1]}"><div class="mate-h"><span class="av av-${q.id}">${q.name[0]}</span><div><strong>${q.name}</strong>${self ? ' <span class="tag">You</span>' : ''}<br><span class="small">${q.role}</span></div></div>
      <p class="soft">${ICON[lvl]} ${s[0]}</p>
      <p class="small">Now: ${ACTIVITIES[here.act] ? ACTIVITIES[here.act].name.toLowerCase() : 'sheltering'} · ${here.zone.toLowerCase()}</p>
      ${c ? `<p class="small">Checked in today: <strong>${esc(c.answer)}</strong></p>` : ''}
      ${!self && lvl !== 'normal' ? `<p class="nudge">Check in on ${q.name}. ${TIPS[(i + state.day) % TIPS.length]}</p>` : ''}</article>`; }).join('');
  const nextOff = 7 - (state.day % 7 || 7);
  $('teamview').innerHTML = `<div><h2>Your crew today</h2><p class="sub">An overview to look out for each other. Only each person's overall status is shared; their readings and reports stay private.</p></div>
    ${colorKey()}
    ${radiation(state.day).rate >= THRESHOLDS.radiation.crit ? `<section class="banner-crit" role="alert">${ICON.critical}<div><strong>Solar particle event.</strong> Whole crew to the shielded shelter. Cabin dose rate ${live('rad', radiation(state.day).rate, 0, 'µSv/h')}.</div></section>` : ''}
    ${profileNote()}${alertsPanel('crew', true)}
    <section class="mates">${cards}</section>
    <section class="panel together"><h2>Together today</h2><ul>
      <li><strong>Next shared meal:</strong> ${meal} at the galley table.</li>
      <li><strong>Next full day off:</strong> ${nextOff === 0 ? 'today' : `in ${nextOff} day${nextOff > 1 ? 's' : ''}`}.</li>
      <li><strong>Mission:</strong> day ${state.day} of 120, ${120 - state.day} to go.</li></ul></section>
    <div class="grid2">${cctv()}<div style="display:flex;flex-direction:column;gap:16px">${cabinStrip()}${upcoming(false)}</div></div>`;
}

/* ================= Ground tab ================= */
function sharesPanel(){
  const list = (store.shares || []).filter(s => s.day <= state.day && s.day >= state.day - 7).slice().reverse();
  if(!list.length) return '';
  return `<section class="panel"><h2>Wellbeing summaries from Rimau</h2><p class="sub">Shared only with the astronaut's consent, for the flight surgeon.</p>
    <div style="display:flex;flex-direction:column;gap:8px;margin-top:8px">${list.map(s => `<div class="box lvl-box-${s.concern === 'crisis' || s.concern === 'high' ? 'critical' : 'warning'}"><strong>${nameOf(s.pid)}</strong> · Day ${s.day}, ${s.time} · concern: ${s.concern}<br>${state.role === 'surgeon' ? esc(s.summary) : '<span class="small">Private wellbeing note on file. Switch to Flight surgeon to read it.</span>'}</div>`).join('')}</div></section>`;
}
function priorityStrip(){
  const sts = PEOPLE.map(q => ({q, st:personStatus(q, state.day), al:activeAlert(q.id), sh:(store.shares || []).some(s => s.pid === q.id && s.day === state.day)}))
    .sort((a, b) => (b.al ? 3 : 0) - (a.al ? 3 : 0) || RANK[b.st.level] - RANK[a.st.level]);
  const rad = radiation(state.day), openAl = store.alerts.filter(a => !a.closed && !(a.ack.ground)).length, c = cabin(state.day);
  const cab = [radLevel(rad.rate), c.co2 > THRESHOLDS.co2.crit ? 'critical' : c.co2 > THRESHOLDS.co2.warn ? 'warning' : 'normal', band(c.temp, THRESHOLDS.temp), band(c.humidity, THRESHOLDS.humidity)].reduce((a, l) => RANK[l] > RANK[a] ? l : a, 'normal');
  return `<section class="prio">
    <div class="ptile lvl-${openAl ? 'critical' : 'normal'}"><span class="small">Open alerts</span><strong>${openAl}</strong><span class="small">${openAl ? 'Waiting for ground' : 'All handled'}</span></div>
    <div class="ptile lvl-${cab}"><span class="small">Cabin safety</span><strong>${WORD[cab]}</strong><span class="small">Radiation ${live('rad', rad.rate, 1, 'µSv/h')} · CO₂ ${c.co2.toFixed(1)} mmHg</span></div>
    ${sts.map(({q, st, al, sh}) => `<button class="ptile person-t lvl-${al ? 'critical' : st.level}" data-person="${q.id}" aria-pressed="${q.id === state.person}"><span class="small">${q.role}</span><strong>${q.name}</strong><span>${chip(st.level)}</span><span class="small">${al ? 'Alert open' : sh ? 'Wellbeing note' : st.early.length ? 'Early sign' : st.drivers[0] ? esc(st.drivers[0].name) : 'All in range'}</span></button>`).join('')}
  </section>`;
}
function pairPanel(){
  if(state.role !== 'surgeon') return `<div><h3>Crew contact</h3><p class="small" style="margin-top:4px">Pair-by-pair contact is visible to the flight surgeon only. ${pairFlags(state.day).length ? pairFlags(state.day).length+' pair flagged.' : 'No pairs flagged.'}</p></div>`;
  const ids = PEOPLE.map(p => p.id), flags = pairFlags(state.day);
  if(state.day < 37) return `<div><h3>Crew contact</h3><p class="small" style="margin-top:4px">Needs the first 30 days in flight as each pair's usual. Available from day 37.</p></div>`;
  return `<div><h3>Crew contact, last 7 days (flight surgeon only)</h3><p class="sub">Time each pair spends near each other, as a share of their usual. Low totals for one person can hide two people avoiding each other.</p>
    <div class="tablewrap" style="margin-top:6px"><table class="matrix"><thead><tr><th></th>${ids.map(id => `<th>${nameOf(id)}</th>`).join('')}</tr></thead><tbody>${ids.map(a => `<tr><th>${nameOf(a)}</th>${ids.map(b => { if(a === b) return '<td class="self">–</td>';
      const s = pairShare(a, b, state.day), f = flags.some(x => pairKey(x.a, x.b) === pairKey(a, b)); return `<td class="${f ? 'flag' : ''}" style="background:rgba(217,95,14,${clamp((1 - s)*0.75, 0, 0.6).toFixed(2)})">${Math.round(s*100)} %</td>`; }).join('')}</tr>`).join('')}</tbody></table></div>
    ${flags.length ? `<p style="margin-top:6px">${flags.map(f => `<strong>${nameOf(f.a)} and ${nameOf(f.b)}</strong> are down to ${Math.round(f.share*100)} % of their usual time together, while both are normal with the rest of the crew.`).join(' ')}</p>` : '<p class="small" style="margin-top:6px">No pairs flagged.</p>'}
    <p class="small">Outlined cells are flagged. Simulated proximity data, generated separately from each person's total time with crew.</p></div>`;
}
function renderGround(){
  const p = P(), st = personStatus(p, state.day), sees = state.role;
  const reps = store.reports.filter(r => r.pid === p.id && r.day === state.day && r.share !== 'device');
  const concern = reps.length ? reps.map(r => { const full = sees === 'surgeon' || r.share === 'crew';
      return `<div class="box"><strong>${full ? r.symptoms.map(s => SYMPTOMS[s]).join(', ') : 'Private report on file'}</strong> · ${r.time}<br>${full ? (sees === 'surgeon' && r.detail ? 'Note: "'+esc(r.detail)+'"<br>' : '')+'Suggested check: '+investigate(p, r.day, r.symptoms).next : 'Details are visible to the flight surgeon only. Switch role above to see how that view differs.'}</div>`; }).join('')
    : '<p class="small">None reported today.</p>';
  const inv = investigate(p, state.day, ['sleep']), rad = radiation(state.day);
  $('groundview').innerHTML = `<div style="display:flex;flex-wrap:wrap;gap:10px 20px;align-items:end;justify-content:space-between"><div><h2>Ground team: crew supervision</h2><p class="sub">Critical items first. Click a crew member for detail and the rule behind every status.</p></div>
      <div class="ctl"><span class="lab" id="rolelab">Viewing as</span><div class="btnrow" role="group" aria-labelledby="rolelab">${[['director','Flight director'],['surgeon','Flight surgeon']].map(([k, v]) => `<button class="btn" data-role="${k}" aria-pressed="${state.role === k}">${v}</button>`).join('')}</div></div></div>
    ${colorKey()}
    ${rad.rate >= THRESHOLDS.radiation.crit ? `<section class="banner-crit" role="alert">${ICON.critical}<div><strong>Solar particle event in progress.</strong> Cabin dose rate ${live('rad', rad.rate, 0, 'µSv/h')}, above the ${THRESHOLDS.radiation.crit} µSv/h line. Confirm the crew is sheltering and track the event.</div></section>` : ''}
    ${priorityStrip()}
    ${profileNote()}${alertsPanel('ground')}${sharesPanel()}
    <div class="grid2">${cctv()}${cabinStrip()}</div>
    ${upcoming(true)}
    <section class="monitor">
      <div class="crewlist">${PEOPLE.map(q => { const s = personStatus(q, state.day), rep = store.reports.some(r => r.pid === q.id && r.day === state.day && r.share !== 'device'), al = activeAlert(q.id);
        return `<button class="person lvl-${s.level}" data-person="${q.id}" aria-pressed="${q.id === p.id}"><span><span class="nm">${q.name}</span> <span class="small">${q.role}</span></span>${chip(s.level)}
          <span class="badges">${s.early.length ? `<span class="tag">Early sign</span>` : ''}${s.unavailable.length ? `<span class="tag">${s.unavailable.length} unavailable</span>` : ''}${rep ? '<span class="tag">Reported concern</span>' : ''}${al ? '<span class="tag tag-crit">Alert open</span>' : ''}</span></button>`; }).join('')}</div>
      <div class="panel detail">
        <div style="display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center"><h2>${p.name}</h2><span class="small">${p.role} · day ${state.day}</span>${chip(st.level)}</div>
        <div><h3>What set this status</h3>${st.level === 'normal' ? '<p>Every scored reading is inside its Normal range.</p>' : `<ul style="margin:4px 0 0;padding-left:18px">${st.drivers.map(d => `<li><strong>${d.name}:</strong> ${esc(d.rule)} ${basisTag(d.basis)}</li>`).join('')}</ul>`}</div>
        <div><h3>Early signs</h3><p class="sub" style="margin-bottom:4px">Two or more readings in one area sliding together for about 3 weeks, still in range. Not a status.</p>${st.early.length ? `<ul style="margin:0;padding-left:18px">${st.early.map(r => `<li><strong>${r.name}</strong>: sliding ${Math.abs(r.trend.slope).toFixed(2)} SD a day, 7-day average ${Math.abs(r.trend.now).toFixed(1)} SD ${r.trend.now < 0 ? 'worse' : 'better'} than normal.</li>`).join('')}</ul>` : '<p class="small">None.</p>'}</div>
        <div><h3>Reported concerns</h3><p class="sub" style="margin-bottom:6px">Shown separately from readings, including when every reading is Normal.</p>${concern}</div>
        <div><h3>Monitored readings</h3><div class="tablewrap" style="margin-top:6px"><table><thead><tr><th>Reading</th><th>Latest</th><th>Status</th><th>Last 4 weeks</th><th>Rule applied</th><th>Basis</th></tr></thead><tbody>${st.rows.map(r => `<tr class="row-${r.level}"><td>${r.name}<div class="small">${r.source} · ${r.label}</div></td><td>${r.value}</td><td>${chip(r.level)}</td><td>${r.trend ? spark(r.trend.series)+(r.trend.sliding ? '<div><span class="tag">Sliding</span></div>' : '') : '<span class="small">–</span>'}</td><td>${esc(r.rule)}</td><td>${basisTag(r.basis)}</td></tr>`).join('')}</tbody></table></div>
          <p class="small" style="margin-top:4px">Sparklines show each day's score against own normal. Up is better; the dashed line is 2 SD worse.</p></div>
        <div><h3>Last night's sleep window</h3><p class="sub">Scheduled ${hh(sleepWindow(p.id, state.day).start)} to ${hh(sleepWindow(p.id, state.day).end)}. What the sleep investigator finds for ${p.name}.</p>
          ${inv.findings.length ? `<div class="tablewrap" style="margin-top:6px"><table><thead><tr><th>Factor</th><th>What happened</th><th>Why it may matter</th><th>What to check next</th></tr></thead><tbody>${inv.findings.map(f => `<tr><td>${f.factor}<div class="small">${f.labels.join('<br>')}</div></td><td>${f.what.replace(/\byour\b/g, 'their').replace(/\bYour\b/g, 'Their').replace(/\bYou\b/g, 'They')}</td><td>${f.why.replace(/\byour\b/g, 'their').replace(/\bYour\b/g, 'Their')}</td><td>${f.next}</td></tr>`).join('')}</tbody></table></div>` : '<p class="small" style="margin-top:6px">No disturbance found in the schedule, cabin readings or check-ins.</p>'}</div>
        ${pairPanel()}
        <div><h3>Event log, last 7 days</h3><div style="margin-top:6px">${evTable(timeline({pid:p.id, day:state.day, span:7, viewer:sees}), 'Nothing logged.')}</div></div>
      </div>
    </section>`;
}

/* ================= About tab ================= */
function renderAbout(){
  const T = THRESHOLDS, link = k => `<a href="${srcOf(k)[1]}" target="_blank" rel="noopener">${esc(srcOf(k)[0])}</a>`;
  const step = (n, title, text, go) => `<li><span><strong>${n}. ${title}</strong> ${text}</span><button class="btn" data-go="${go}">Show</button></li>`;
  $('aboutview').innerHTML = `
  <section class="panel"><h2>Walk through the demo</h2><p class="sub">Each button sets the day, the astronaut and the tab. Follow them in order for a video take of about 4 minutes.</p>
    <h3 style="margin-top:12px">New in this version</h3>
    <ol class="steps" style="margin-top:8px">
      ${step(1, 'Role-based sign-in.', 'Log out, then sign in as Astronaut (pick a crew member) or Ground Team. Each role sees only its own tabs.', 'personal|20|amara')}
      ${step(2, 'Personal tab at a glance.', 'One status, then readings grouped into Vitals, Mental state, Social, Sleep and Cabin. Press Show details for the rules and raw data.', 'personal|80|kenji')}
      ${step(3, 'Talk to Rimau.', 'Tap "I\'ve been feeling kind of down." then "I miss my family a lot lately." Rimau uses the sleep and event data, suggests NASA-sourced support, and asks before sharing anything with the flight surgeon.', 'personal|26|tomas')}
      ${step(4, 'Consent reaches the ground.', 'After you agree to share, open Ground team, switch to Flight surgeon, and read the Rimau summary.', 'ground|26|tomas')}
      ${step(5, 'Solar particle event.', 'Cabin radiation jumps to 185 µSv/h. Every screen turns red, the CCTV shows the crew in the shelter, and the next action changes.', 'team|64|amara')}
      ${step(6, 'Cabin remote and sleep report.', 'Set the sleep station to 27 °C, then press Sleep through to tomorrow. The new sleep report links the awakenings to the warm cabin.', 'personal|20|amara')}
      ${step(7, 'Team tab.', 'Crewmates see each other\'s overall status only, with nudges to check in, plus the CCTV and shared plans.', 'team|85|sofia')}
    </ol>
    <h3 style="margin-top:14px">From the first prototype</h3>
    <ol class="steps" style="margin-top:8px">
      ${step(8, 'Readings Normal, poor sleep reported.', 'Press Report how I feel and choose Difficulty sleeping. The investigator names the late maintenance block.', 'personal|26|tomas')}
      ${step(9, 'Alert and acknowledgement.', 'Press Alert crew &amp; ground, then acknowledge it on the Team and Ground team tabs.', 'personal|26|tomas')}
      ${step(10, 'Slow withdrawal.', 'Sofia still rates her mood as normal. Her time with crew and her voice have been sliding for weeks: an early sign before any Warning.', 'ground|85|sofia')}
      ${step(11, 'Spacewalk readiness and body clock.', 'Tomas\'s sleep moved 2.5 h earlier for tomorrow\'s spacewalk. The readiness card, lighting plan and reaction check are on his screen.', 'personal|92|tomas')}
      ${step(12, 'Crew tension.', 'Switch the Ground team view to Flight surgeon to see the pair contact table.', 'ground|100|erik')}
      ${step(13, 'Mars transit delay.', 'Switch the mission to Mars transit in the demo controls, raise an alert, and acknowledge it from the Ground team view.', 'personal|26|tomas')}
    </ol></section>
  <section class="panel"><h2>Rimau, the wellbeing companion</h2><div class="sub" style="display:grid;gap:8px">
    <p><strong>What it does.</strong> A friendly chat, not a questionnaire. Rimau reads the astronaut's simulated readings, last night's sleep disturbances, workload, upcoming tasks and 7-day event log, and looks for signs of stress, anxiety, loneliness, low mood and fatigue.</p>
    <p><strong>Grounded advice.</strong> Rimau can only suggest items from a fixed list, and each one links to its source: private family calls and private psychological conferences (${link('bhp')}; ${link('psych')}), the Virtual Space Station self-guided tools (${link('vss')}), pre-sleep lighting (${link('fms')}), and the radiation shelter (${link('radbrief')}).</p>
    <p><strong>Consent first.</strong> When Rimau sees a moderate or high concern it asks whether to share a short summary with the flight surgeon. Nothing leaves the chat without a yes. If someone mentions feeling unsafe, Rimau points straight to Alert crew &amp; ground.</p>
    <p><strong>Live or scripted.</strong> Live replies come from Google Gemini through a small server script, so the API key never reaches the browser. If the call fails, or Scripted mode is chosen in the demo controls, a local script answers instead, so the demo never stalls.</p></div></section>
  <section class="panel"><h2>Where the data comes from</h2><p class="sub">Inputs are kept apart and labelled. Nothing in the demo describes a real astronaut or a real shift.</p>
    <div class="tablewrap" style="margin-top:8px"><table><thead><tr><th>Label</th><th>What carries it</th><th>Note</th></tr></thead><tbody>
      <tr><td><strong>Simulated</strong></td><td>All six crew members, their test, wearable, proximity and voice readings, the mission schedule, duty hours, cabin readings, radiation, alarms and schedule changes</td><td>Generated by code in this page. Sleep hours are tuned to match published ISS averages; background radiation sits inside the published ISS range.</td></tr>
      <tr><td><strong>Self-reported</strong></td><td>Reports, check-ins, follow-up requests, chats with Rimau and cabin remote settings you enter</td><td>Stored in this browser only. Rimau chats are sent to Gemini only in Live mode.</td></tr>
      <tr><td><strong>AI summary</strong></td><td>Wellbeing summaries from Rimau</td><td>Written by Gemini (or the scripted engine) and shared only with consent.</td></tr>
      <tr><td><strong>Estimated</strong></td><td>Body clock vs schedule</td><td>Worked out from the sleep schedule with a simple demo model. It is not a measurement of circadian phase.</td></tr>
      <tr><td><strong>Mock</strong></td><td>Cabin CCTV</td><td>A drawn cabin layout. Crew positions come from the simulated schedule. No video exists.</td></tr>
      <tr><td><strong>Not loaded</strong></td><td>Historical ISS cabin temperature, humidity and CO₂ telemetry</td><td>${link('eda')} holds this data. It could not be downloaded into this build, so cabin readings are simulated inside the published ranges.</td></tr>
      <tr><td><strong>Alert delivery and delay</strong></td><td>The Alert crew &amp; ground button, and the Mars transit light-time delay</td><td>Simulated. The alert passes between views through browser storage. The delay is set to 12 minutes; the real one-way delay to Mars runs from about 3 to 22 minutes (${link('delay')}).</td></tr>
    </tbody></table></div></section>
  <section class="panel"><h2>Status thresholds</h2><p class="sub">Fixed, and defined in one place in the code (the THRESHOLDS object). The Ground team view shows the rule that set each status.</p>
    <div class="tablewrap" style="margin-top:8px"><table><thead><tr><th>Reading</th><th>Measured as</th><th>Lines</th><th>Basis</th><th>Why, and source</th></tr></thead><tbody>
      ${Object.values(T).map(t => `<tr><td>${t.name}</td><td>${t.measure}</td><td>${t.lines}</td><td>${basisTag(t.basis)}</td><td>${t.why}${t.src ? ' '+t.src.map(link).join('; ') : ''}</td></tr>`).join('')}
    </tbody></table></div></section>
  <section class="panel"><h2>Scope of this release</h2><div class="sub" style="display:grid;gap:6px">
    <p><strong>In:</strong> behavioural health, sleep disturbance, workload, circadian timing, crew support, cabin environment and cabin radiation.</p>
    <p><strong>Out:</strong> blood and urine testing, bone and immune markers, and personal radiation dosimetry. Cabin radiation is tracked as a safety measure, not a personal dose record.</p>
    <p><strong>Vital signs:</strong> blood pressure, blood sugar and body temperature are not simulated. Each would enter as one more reading against the person's own normal, with its own row in the threshold table, so the screens need no change.</p>
    <p><strong>Data streams:</strong> the design assumes continuous real-time telemetry and biometrics. In this demo they are simulated by scripts, and the live-looking values (heart rate now, radiation) wobble around the simulated daily value.</p>
    <p><strong>Sleep schedule:</strong> the planned sleep window of 21:30 to 06:00 follows ${link('esa')}.</p></div></section>
  <section class="panel"><h2>Sources</h2><ol style="margin:8px 0 0;padding-left:20px">${Object.values(SRC).map(s => `<li><a href="${s[1]}" target="_blank" rel="noopener">${esc(s[0])}</a></li>`).join('')}</ol></section>`;
}

/* ================= Shell ================= */
function render(){
  const s = state.session;
  $('login').hidden = !!s; $('app').hidden = !s;
  if(!s){ renderLogin(); return; }
  const tabs = TABS[s.mode]; if(!tabs.includes(state.view)) state.view = tabs[0];
  if(s.mode === 'astronaut') state.person = s.pid;
  $('who-am-i').innerHTML = s.mode === 'astronaut' ? `Signed in as <strong>${nameOf(s.pid)}</strong> · Astronaut` : s.mode === 'ground' ? 'Signed in as <strong>Ground Team</strong>' : '<strong>Demo walkthrough</strong> · all tabs';
  $('tabs').innerHTML = tabs.map(v => `<a href="#${v}" data-view="${v}" ${state.view === v ? 'aria-current="page"' : ''}>${TAB_NAME[v]}</a>`).join('');
  $('tabs').hidden = tabs.length < 2;
  VIEWS.forEach(v => $('v-'+v).classList.toggle('on', state.view === v));
  $('controls').hidden = state.view === 'about';
  $('whoctl').hidden = s.mode !== 'demo' || state.view === 'team';
  $('daynum').textContent = state.day; $('day').value = state.day;
  $('scenes').innerHTML = SCENES.map(([d, p, t]) => `<button class="btn sm" data-scene="${d}|${p}" aria-pressed="${state.day === d && state.person === p}">Day ${d} · ${t}</button>`).join('');
  $('who').innerHTML = PEOPLE.map(p => `<button class="btn sm" data-person="${p.id}" aria-pressed="${state.person === p.id}">${p.name}</button>`).join('');
  $('prof').innerHTML = Object.entries(PROFILES).map(([k, v]) => `<button class="btn sm" data-profile="${k}" aria-pressed="${state.profile === k}">${v.name}</button>`).join('');
  $('rmode').innerHTML = [['live','Live AI (Gemini)'],['scripted','Scripted demo']].map(([k, v]) => `<button class="btn sm" data-rmode="${k}" aria-pressed="${RIMAU.mode === k}">${v}</button>`).join('');
  if(state.view === 'personal') renderPersonal(); if(state.view === 'team') renderTeam(); if(state.view === 'ground') renderGround(); if(state.view === 'about') renderAbout();
}
function go(view, day, person){ state.view = view; if(day) state.day = +day; if(person) state.person = person; state.sheet = null; state.details = false; render(); window.scrollTo(0, 0); }
function signIn(mode, pid){ state.session = {mode, pid:pid || null}; state.view = TABS[mode][0]; if(pid) state.person = pid; $('controls').open = mode === 'demo'; state.sheet = null; render(); window.scrollTo(0, 0); }
function setRemote(pid, patch){
  const r = remoteOf(pid), row = readings(P(), state.day).find(x => x.id === 'stationtemp');
  const base = r || {temp:Math.round(parseFloat(row.value)*2)/2, light:'general', bright:70};
  store.remote[pid] = {...base, ...patch, from:state.day}; save(); clearCaches();
}
const ACTS = {
  loginastro(){ state.loginStep = 'crew'; }, loginback(){ state.loginStep = null; },
  pickcrew(t){ state.loginStep = null; signIn('astronaut', t.dataset.pid); },
  loginground(){ signIn('ground'); }, logindemo(){ signIn('demo'); },
  logout(){ state.session = null; state.loginStep = null; state.sheet = null; state.details = false; },
  reset(){ store = EMPTY(); save(); clearCaches(); state.sheet = null; },
  openreport(){ state.view = 'personal'; state.sheet = 'report'; state.err = ''; state.draft = {symptoms:[], detail:'', share:'surgeon'}; window.scrollTo(0, 0); },
  openalert(){ const last = store.reports.filter(r => r.pid === state.person && r.day === state.day).slice(-1)[0]; state.sheet = 'alert'; state.adraft = {include:false, symptoms:last ? last.symptoms.slice() : []}; window.scrollTo(0, 0); },
  opentool(t){ state.sheet = 'tool'; state.tool = t.dataset.tool; window.scrollTo(0, 0); },
  openrt(){ state.sheet = 'rt'; state.rtResult = null; },
  cancel(){ state.sheet = null; },
  details(){ state.details = !state.details; },
  sym(t){ keepDraft(); const s = t.dataset.s, a = state.draft.symptoms, i = a.indexOf(s); i < 0 ? a.push(s) : a.splice(i, 1); state.err = ''; },
  asym(t){ const s = t.dataset.s, a = state.adraft.symptoms, i = a.indexOf(s); i < 0 ? a.push(s) : a.splice(i, 1); },
  submitreport(){ keepDraft(); const d = state.draft; if(!d.symptoms.length){ state.err = 'Choose at least one option first.'; return; }
    store.reports.push({id:uid(), pid:state.person, day:state.day, ...stamp(), symptoms:d.symptoms, detail:d.detail.trim(), share:d.share}); save(); state.sheet = null; },
  checkin(t){ store.checkins.push({pid:state.person, day:state.day, ...stamp(), answer:t.dataset.a}); save(); if(t.dataset.a === 'Not great') ACTS.openreport(); },
  followup(t){ store.followups.push({rid:t.dataset.rid, pid:state.person, day:state.day, ...stamp()}); save(); },
  sendalert(){ const d = state.adraft, st = personStatus(P(), state.day);
    store.alerts.push({id:uid(), pid:state.person, day:state.day, ...stamp(), level:st.level, symptoms:d.include ? d.symptoms : [], delay:PROFILES[state.profile].delay, ack:{crew:null, ground:null}, closed:null}); save(); state.sheet = null; },
  closealert(t){ const a = store.alerts.find(a => a.id === t.dataset.aid); if(a){ a.closed = stamp(); save(); } },
  ack(t){ const a = store.alerts.find(a => a.id === t.dataset.aid); if(!a) return; const now = stamp();
    if(t.dataset.side === 'ground' && a.delay){ const arrive = addMin(a.time, a.delay), time = toMin(now.time) >= toMin(arrive) ? now.time : arrive;
      a.ack.ground = {t:toMin(time)/60, time, reaches:addMin(time, a.delay), by:t.dataset.by}; }
    else a.ack[t.dataset.side] = {...now, by:t.dataset.by};
    save(); },
  temp(t){ const r = remoteOf(state.person), row = readings(P(), state.day).find(x => x.id === 'stationtemp');
    const cur = r && r.temp !== null && r.temp !== undefined ? r.temp : Math.round(parseFloat(row.value)*2)/2;
    setRemote(state.person, {temp:clamp(cur + +t.dataset.d, 16, 30)}); },
  light(t){ setRemote(state.person, {light:t.dataset.mode, lightSet:true}); },
  nextnight(){ state.day = Math.min(120, state.day + 1); },
  rsay(t){ rimauSend(t.dataset.t); return 'norender'; },
  rconsent(t){ rimauConsent(+t.dataset.i, !!t.dataset.yes); return 'norender'; },
  rclear(){ store.chats[state.person] = []; save(); RIMAU.notice = ''; }
};
function keepDraft(){ const d = state.draft; if(!d) return; const ta = $('detail'); if(ta) d.detail = ta.value; const r = document.querySelector('input[name=share]:checked'); if(r) d.share = r.value; }
document.addEventListener('click', e => {
  const tab = e.target.closest('#tabs a'); if(tab){ e.preventDefault(); go(tab.dataset.view); return; }
  const t = e.target.closest('[data-act],[data-scene],[data-person],[data-role],[data-go],[data-profile],[data-rmode]'); if(!t) return;
  if(t.dataset.act){ if(ACTS[t.dataset.act](t) === 'norender') return; }
  else if(t.dataset.scene){ const [d, p] = t.dataset.scene.split('|'); state.day = +d; state.person = p; if(state.session.mode === 'astronaut') state.session.pid = p; state.sheet = null; }
  else if(t.dataset.person){ state.person = t.dataset.person; state.sheet = null; }
  else if(t.dataset.role) state.role = t.dataset.role;
  else if(t.dataset.profile) state.profile = t.dataset.profile;
  else if(t.dataset.rmode){ RIMAU.mode = t.dataset.rmode; RIMAU.notice = ''; }
  else if(t.dataset.go){ const [v, d, p] = t.dataset.go.split('|'); go(v, d, p); return; }
  render();
});
document.addEventListener('submit', e => { if(e.target.id === 'rimau-form'){ e.preventDefault(); const i = $('rimau-in'), v = i.value; i.value = ''; rimauSend(v); } });
document.addEventListener('change', e => {
  if(e.target.id === 'incl'){ state.adraft.include = e.target.checked; render(); }
  if(e.target.id === 'bright'){ setRemote(state.person, {bright:+e.target.value, lightSet:true}); render(); }
});
document.addEventListener('input', e => { if(e.target.id === 'bright') $('brightv').textContent = e.target.value; });
$('day').addEventListener('input', e => { state.day = +e.target.value; state.sheet = null; render(); });
window.addEventListener('storage', e => { if(e.key === KEY){ load(); clearCaches(); if(state.sheet !== 'rt' && !RIMAU.busy && !RIMAU.typing) render(); } });

/* sleep chart hover: crosshair plus a readout of every trace at that time */
document.addEventListener('pointermove', e => {
  const svg = e.target.closest && e.target.closest('svg[data-sleep]'); const wrap = document.querySelector('.chartwrap');
  if(!svg || !SLEEP_NOW){ if(wrap){ const tip = wrap.querySelector('.tip'), xh = wrap.querySelector('.xh'); if(tip) tip.hidden = true; if(xh) xh.setAttribute('visibility', 'hidden'); } return; }
  const r = svg.getBoundingClientRect(), W = +svg.dataset.w, L = +svg.dataset.l, R = +svg.dataset.r, x = (e.clientX - r.left)/r.width*W;
  const s = SLEEP_NOW, t = s.start + clamp((x - L)/(W - L - R), 0, 1)*(s.end - s.start);
  const v = s.S.reduce((a, b) => Math.abs(b.t - t) < Math.abs(a.t - t) ? b : a), xh = svg.querySelector('.xh'), tip = svg.parentNode.querySelector('.tip');
  const X = L + (v.t - s.start)/(s.end - s.start)*(W - L - R);
  xh.setAttribute('x1', X); xh.setAttribute('x2', X); xh.setAttribute('visibility', 'visible');
  const d = s.D.find(d => v.t >= d.t - 0.1 && v.t <= d.t + d.dur/60 + 0.1);
  tip.hidden = false; tip.innerHTML = `<strong>${hh(v.t)}</strong>${v.t < s.onset ? ' · not yet asleep' : ''}<br>Noise ${v.noise.toFixed(0)} dBA · CO₂ ${v.co2.toFixed(1)} mmHg<br>Temp ${v.temp.toFixed(1)} °C · Humidity ${v.hum.toFixed(0)} %${d ? `<br><span class="tipd">${d.kind}: awake ${d.dur} min</span>` : ''}`;
  const px = (X/W)*r.width; tip.style.left = Math.min(px + 12, r.width - 190) + 'px'; tip.style.top = '8px';
});

/* reaction check: five rounds against the selected astronaut's simulated normal */
const RT = {phase:'idle', t0:0, timer:null, times:[]};
document.addEventListener('pointerdown', e => {
  const pad = e.target.closest('#pad'); if(!pad) return; const out = $('padout');
  const arm = () => { RT.phase = 'wait'; pad.classList.remove('go'); pad.textContent = 'Wait…'; RT.timer = setTimeout(() => { RT.phase = 'go'; RT.t0 = performance.now(); pad.classList.add('go'); pad.textContent = 'Tap!'; }, 1000 + Math.random()*2200); };
  if(RT.phase === 'idle'){ RT.times = []; out.textContent = ''; arm(); }
  else if(RT.phase === 'wait'){ clearTimeout(RT.timer); out.textContent = 'Too soon. That round starts again.'; arm(); }
  else if(RT.phase === 'go'){ RT.times.push(performance.now() - RT.t0);
    if(RT.times.length < 5){ out.textContent = `Round ${RT.times.length} of 5: ${Math.round(RT.times[RT.times.length - 1])} ms`; arm(); }
    else { RT.phase = 'idle'; const p = P(), ms = Math.round(mean(RT.times)), z = -(ms - p.base.rt.mean)/p.base.rt.sd, level = z <= -3 ? 'critical' : z <= -2 ? 'warning' : 'normal';
      store.rtchecks.push({pid:p.id, day:state.day, ...stamp(), ms, z, level}); save(); state.rtResult = {ms, z, level}; render(); } }
});
load();
/* Deep links for recording takes, e.g. ?as=demo&view=ground&day=64&p=amara&rimau=scripted. A refresh without them returns to sign-in. */
(() => { const q = new URLSearchParams(location.search), as = q.get('as');
  if(q.get('rimau') === 'scripted') RIMAU.mode = 'scripted';
  if(q.get('day')) state.day = clamp(+q.get('day') || 20, 2, 120);
  if(q.get('p') && PEOPLE.some(p => p.id === q.get('p'))) state.person = q.get('p');
  if(as && TABS[as]){ state.session = {mode:as, pid:as === 'astronaut' ? state.person : null}; if(VIEWS.includes(q.get('view'))) state.view = q.get('view'); if(q.get('role') === 'surgeon') state.role = 'surgeon'; if(q.get('details')) state.details = true; }
})();
render();
