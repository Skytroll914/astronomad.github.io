/* ================= Ground supervisor dashboard: three questions, answered first =================
   1. Who needs attention?  2. Is anyone experiencing similar changes?  3. What has changed recently?
   Uses the simulated readings, the live vitals' daily values, and the daily check-ins (real ones done in this browser,
   plus simulated past check-ins). The flight director sees check-in bands only; the flight surgeon sees the detail. */

const bandChip = b => `<span class="chip lvl-${BAND_LVL[b]}">${ICON[BAND_LVL[b]]}${BAND_WORD[b]}</span>`;
const worstOf = list => list.reduce((a, l) => RANK[l] > RANK[a] ? l : a, 'normal');
const safeMean = a => a.length ? mean(a) : null;

/* ---------- 1. Who needs attention ---------- */
function attentionList(day){
  return PEOPLE.map(q => {
    const st = personStatus(q, day), ck = latestCheckin(q.id, day), al = activeAlert(q.id), R = [];
    if(al) R.push({lvl:'critical', t:'Asked for help: alert open'});
    st.rows.filter(r => r.group === 'You' && (r.level === 'warning' || r.level === 'critical')).sort((a, b) => RANK[b.level] - RANK[a.level])
      .slice(0, 3).forEach(r => R.push({lvl:r.level, t:`${r.name}: ${r.value}`}));
    if(ck){ const o = ck.report.overall;
      if(o.band !== 'green') R.push({lvl:BAND_LVL[o.band], t:`Check-in ${BAND_WORD[o.band]} (${ck.day === day ? 'today' : 'day '+ck.day}${o.delta !== null && o.delta >= 4 ? `, +${Math.round(o.delta)} on baseline` : ''})`});
      if(state.role === 'surgeon' && (ck.report.red_flag_items || []).length) R.push({lvl:'critical', t:`Red-flag item${ck.report.red_flag_items.length > 1 ? 's' : ''} ${ck.report.red_flag_items.join(', ')}`});
      if(ck.report.crisis) R.push({lvl:'critical', t:'Crisis language in today\'s check-in'}); }
    if(st.early.length) R.push({lvl:'warning', t:'Early sign: '+st.earlyAreas.map(a => DOMAINS.find(d => d.id === a).name.toLowerCase()).join(' and ')+' sliding for 3 weeks'});
    const level = worstOf(R.map(r => r.lvl));
    return {q, level, R, score:RANK[level]*10 + R.length};
  }).sort((a, b) => b.score - a.score);
}
function attentionPanel(){
  const list = attentionList(state.day), need = list.filter(x => x.level !== 'normal'), clear = list.filter(x => x.level === 'normal');
  const rad = radiation(state.day), c = cabin(state.day), openAl = store.alerts.filter(a => !a.closed && !a.ack.ground).length;
  const cab = worstOf([radLevel(rad.rate), c.co2 > THRESHOLDS.co2.crit ? 'critical' : c.co2 > THRESHOLDS.co2.warn ? 'warning' : 'normal', band(c.temp, THRESHOLDS.temp), band(c.humidity, THRESHOLDS.humidity)]);
  return `<section class="panel q1"><div class="qhead"><span class="qnum">1</span><h2>Who needs attention?</h2></div>
    <div class="prio" style="margin-top:10px">
      <div class="ptile lvl-${openAl ? 'critical' : 'normal'}"><span class="small">Open alerts</span><strong>${openAl}</strong><span class="small">${openAl ? 'Waiting for ground' : 'All handled'}</span></div>
      <div class="ptile lvl-${cab}"><span class="small">Cabin safety (whole crew)</span><strong>${WORD[cab]}</strong><span class="small">Radiation ${live('rad', rad.rate, 1, 'µSv/h')} · CO₂ ${c.co2.toFixed(1)} mmHg</span></div>
    </div>
    ${need.length ? `<div class="needs">${need.map(x => `<button class="need lvl-${x.level}" data-person="${x.q.id}" aria-pressed="${x.q.id === state.person}">
        <span class="need-h"><span class="av av-${x.q.id}">${x.q.name[0]}</span><span><strong>${x.q.name}</strong><br><span class="small">${x.q.role}</span></span>${chip(x.level)}</span>
        <ul>${x.R.map(r => `<li>${ICON[r.lvl].replace('<svg', '<svg class="ri"')}${esc(r.t)}</li>`).join('')}</ul></button>`).join('')}</div>`
      : '<p style="margin-top:10px">Nobody needs attention right now.</p>'}
    ${clear.length ? `<p class="small" style="margin-top:8px">${ICON.normal.replace('<svg', '<svg class="ri"')} All clear: ${clear.map(x => x.q.name).join(', ')}.</p>` : ''}
    <p class="small">Vitals and readings use each person's own baseline. Check-in colours are AI-estimated from open answers${state.role === 'surgeon' ? '' : '; the flight surgeon sees the detail'}.</p></section>`;
}

/* ---------- 2. Similar changes ---------- */
function factorsFor(pid, from, to){
  const f = new Set(), name = id => PEOPLE.find(p => p.id === id).name;
  for(let d = Math.max(1, from); d <= to; d++){
    if(cabin(d).co2 > THRESHOLDS.co2.warn) f.add('cabin CO₂ above the limit (scrubber fault)');
    if(radiation(d).spe) f.add('solar particle event');
    WORK_PLANTS.filter(w => w.who.includes(pid) && d >= w.from && d <= w.to).forEach(w => f.add('extra duty for '+w.why));
    TASKS.filter(t => t.day === d && t.who.includes(pid)).forEach(t => f.add(t.name.toLowerCase()));
    EVENTS.filter(e => e.who === pid && d >= e.from && d <= e.to).forEach(e => f.add(e.label.toLowerCase()));   // cabin-wide events are covered above
    const n = night(pid, d); if(n.duty) f.add('late duty in the sleep window'); if(n.alarm) f.add('a night alarm'); if(n.warm) f.add('a warm sleep station'); if(n.light) f.add('bright light before sleep');
    if((SLEEP_SHIFTS[pid] || {})[d]) f.add('sleep window moved for the spacewalk');
    PAIR_EFFECTS.filter(e => (e.a === pid || e.b === pid) && d >= e.from && d <= e.to).forEach(e => f.add(`tension between ${name(e.a)} and ${name(e.b)}`));
  }
  return f;
}
function similarChanges(day){
  const out = [], w0 = day - 6, w1 = day - 13;
  METRICS.forEach(m => {
    const movers = PEOPLE.map(p => { const now = safeMean(lastN(d => zval(p, m.id, d), day, 7)), prev = safeMean(lastN(d => zval(p, m.id, d), day - 7, 7));
      return {p, d:now === null || prev === null ? 0 : now - prev, now}; }).filter(x => x.d <= -1 && x.now <= -0.8);   // a real drop, and now below their normal
    if(movers.length >= 2) out.push({what:`${m.name} ${m.dir > 0 ? 'lower' : 'higher'} than the week before`, src:SOURCE_OF[m.id], who:movers.map(x => x.p), lvl:movers.some(x => x.d <= -1.8) ? 'critical' : 'warning'});
  });
  const vit = [['Resting breathing rate up', (a, b) => a.rr - b.rr >= 2], ['Blood pressure up', (a, b) => a.sys - b.sys >= 8], ['Day-night temperature swing flatter', (a, b) => b.amp - a.amp >= 0.12], ['Hydration lower', (a, b) => b.hyd - a.hyd >= 5]];
  vit.forEach(([what, test]) => { const who = PEOPLE.filter(p => test(vitalsDay(p, day), vitalsDay(p, day - 7))); if(who.length >= 2) out.push({what:what+' compared with a week ago', src:'Wearable', who, lvl:'warning'}); });
  ORDER.forEach(k => {
    const who = PEOPLE.filter(p => { const r = d => (checkinOf(p.id, d) || {report:null}).report, avg = (a, b) => safeMean([...Array(b - a + 1)].map((_, i) => r(a + i)).filter(Boolean).map(x => x.subscales[k].score));
      const now = avg(day - 3, day), prev = avg(day - 10, day - 7); return now !== null && prev !== null && now - prev >= 2; });
    if(who.length >= 2) out.push({what:`${PARTS[k]} higher in daily check-ins than the week before`, src:'Daily check-in', who, lvl:'warning'});
  });
  sudden(day).filter(r => r.crewWide && r.day >= w0).forEach(r => out.push({what:`${r.metric.name} changed sharply on day ${r.day} for ${r.n} of ${PEOPLE.length} crew`, src:SOURCE_OF[r.metric.id], who:r.who.map(id => PEOPLE.find(p => p.id === id)), lvl:r.verdict === 'crew-unknown' ? 'critical' : 'warning', ctx:r.context}));
  out.forEach(c => {
    const sets = c.who.map(p => factorsFor(p.id, w1, day)), shared = [...sets[0]].filter(f => sets.every(s => s.has(f)));
    c.shared = c.ctx ? [c.ctx.toLowerCase()] : shared;
  });
  return out.sort((a, b) => RANK[b.lvl] - RANK[a.lvl] || b.who.length - a.who.length).slice(0, 6);
}
function similarPanel(){
  const list = similarChanges(state.day);
  return `<section class="panel"><div class="qhead"><span class="qnum">2</span><h2>Is anyone experiencing similar changes?</h2></div>
    <p class="sub">Readings that moved the same way for two or more people over the last week, and what they had in common in the logs.</p>
    ${list.length ? `<div class="sims">${list.map(c => `<div class="sim lvl-${c.lvl}"><div class="sim-who">${c.who.map(p => `<span class="av av-${p.id}" title="${p.name}">${p.name[0]}</span>`).join('')}</div>
        <div><strong>${esc(c.what)}</strong>: ${c.who.map(p => p.name).join(', ')}<br><span class="small">${c.src}</span>
        <p>${c.shared.length ? `${ICON.early.replace('<svg', '<svg class="ri"')} Shared factor: <strong>${esc(c.shared.slice(0, 2).join('; '))}</strong>` : '<span class="small">No shared factor in the schedule or cabin logs. Worth checking the habitat and how they are getting on.</span>'}</p></div></div>`).join('')}</div>`
      : '<p class="small" style="margin-top:8px">No shared changes in the last 7 days.</p>'}</section>`;
}

/* ---------- 3. What changed since yesterday ---------- */
function changesSince(day){
  const up = [], down = [], skipCabin = id => ['temp','humidity','co2','noise','light','radiation'].includes(id);
  const sd = a => a.length > 1 ? Math.sqrt(a.reduce((s, v) => s + (v - mean(a))**2, 0)/(a.length - 1)) : null;
  PEOPLE.forEach(p => {
    const now = readings(p, day), prev = readings(p, day - 1);
    now.forEach(r => { if(skipCabin(r.id)) return; const o = prev.find(x => x.id === r.id); if(!o || o.level === r.level || o.level === 'unavailable' || r.level === 'unavailable') return;
      (RANK[r.level] > RANK[o.level] ? down : up).push({p, lvl:r.level, t:`${r.name}: ${WORD[o.level]} → ${WORD[r.level]} (${r.value})`}); });
    const hrNow = lastN(d => val(p, 'rhr', d), day, 3), hrPrev = lastN(d => val(p, 'rhr', d), day - 3, 3), a = sd(hrNow), b = sd(hrPrev);
    if(a !== null && b !== null && b > 1.5 && a < b*0.6) up.push({p, lvl:'normal', t:`Heart rate steadier than earlier this week (day-to-day swing ${a.toFixed(1)} bpm, was ${b.toFixed(1)})`});
    if(a !== null && b !== null && a > 2.5 && a > b*1.7) down.push({p, lvl:'warning', t:`Heart rate less stable than earlier this week (day-to-day swing ${a.toFixed(1)} bpm, was ${b.toFixed(1)})`});
    [['rhr', 'Resting heart rate'], ['hrv', 'Heart-rate variability'], ['sleeph', 'Sleep'], ['mood', 'Mood rating'], ['stress', 'Stress rating']].forEach(([id, nm]) => {
      const z1 = zval(p, id, day), z0 = zval(p, id, day - 1), r = now.find(x => x.id === id), o = prev.find(x => x.id === id);
      if(z1 === null || z0 === null || (r && o && r.level !== o.level) || Math.abs(z1 - z0) < 1.6) return;
      const m = METRICS.find(x => x.id === id), v1 = val(p, id, day), v0 = val(p, id, day - 1);
      (z1 > z0 ? up : down).push({p, lvl:z1 > z0 ? 'normal' : 'warning', t:`${nm} ${v0.toFixed(m.dp)} → ${v1.toFixed(m.dp)} ${m.unit}${z1 > z0 ? ', closer to their normal' : ', further from their normal'}`});
    });
    const c1 = checkinOf(p.id, day) || checkinOf(p.id, day - 1), c0 = c1 ? checkinOf(p.id, c1.day - 1) : null;
    if(c1 && c0 && c1.report.overall.band !== c0.report.overall.band){
      const worse = ['green','yellow','red'].indexOf(c1.report.overall.band) > ['green','yellow','red'].indexOf(c0.report.overall.band);
      (worse ? down : up).push({p, lvl:BAND_LVL[c1.report.overall.band], t:`Check-in ${BAND_WORD[c0.report.overall.band]} → ${BAND_WORD[c1.report.overall.band]}`}); }
  });
  const cn = readings(PEOPLE[0], day), cp = readings(PEOPLE[0], day - 1);
  cn.filter(r => skipCabin(r.id) && r.id !== 'noise' && r.id !== 'light').forEach(r => { const o = cp.find(x => x.id === r.id); if(o && o.level !== r.level) (RANK[r.level] > RANK[o.level] ? down : up).push({p:null, lvl:r.level, t:`Cabin: ${r.name} ${WORD[o.level]} → ${WORD[r.level]} (${r.value})`}); });
  return {up, down};
}
function changesPanel(){
  const {up, down} = changesSince(state.day);
  const item = (x, good) => `<li><span class="arrow ${good ? 'good' : 'bad'}" aria-hidden="true">${good ? '▲' : '▼'}</span><span>${x.p ? `<strong>${x.p.name}</strong>: ` : ''}${esc(x.t)}</span></li>`;
  return `<section class="panel"><div class="qhead"><span class="qnum">3</span><h2>What has changed since yesterday?</h2></div>
    <div class="grid2" style="margin-top:8px">
      <div><h3 class="chg-h bad">Getting worse <span class="small">(${down.length})</span></h3>${down.length ? `<ul class="chg">${down.slice(0, 9).map(x => item(x, false)).join('')}</ul>` : '<p class="small">Nothing got worse.</p>'}</div>
      <div><h3 class="chg-h good">Getting better <span class="small">(${up.length})</span></h3>${up.length ? `<ul class="chg">${up.slice(0, 9).map(x => item(x, true)).join('')}</ul>` : '<p class="small">No improvements logged.</p>'}</div>
    </div></section>`;
}

/* ---------- daily check-ins: table for everyone, and detail for the selected person ---------- */
function checkinTable(){
  const rows = PEOPLE.map(q => ({q, c:latestCheckin(q.id, state.day)})), surgeon = state.role === 'surgeon';
  return `<section class="panel"><h2>Daily check-ins</h2><p class="sub">${surgeon ? 'Flight surgeon view: subscale estimates and summaries.' : 'Flight director view: overall colour only. Switch to Flight surgeon for the detail.'} Simulated past check-ins are labelled.</p>
    <div class="tablewrap" style="margin-top:8px"><table><thead><tr><th>Crew member</th><th>Latest</th><th>Overall</th>${surgeon ? '<th>Stress</th><th>Mood</th><th>Anxiety</th><th>Crew/isolation</th><th>vs baseline</th><th>Summary</th>' : ''}</tr></thead><tbody>
    ${rows.map(({q, c}) => !c ? `<tr><td>${q.name}</td><td colspan="${surgeon ? 8 : 2}" class="small">No check-in yet</td></tr>` :
      `<tr class="row-${BAND_LVL[c.report.overall.band]}"><td><button class="link" data-person="${q.id}">${q.name}</button></td><td>Day ${c.day}${c.simulated ? '<div class="small">Simulated</div>' : `<div class="small">${c.time} · ${c.demo ? 'Demo (scripted)' : 'done here'}</div>`}</td><td>${bandChip(c.report.overall.band)}</td>
       ${surgeon ? ORDER.map(k => `<td>${bandChip(c.report.subscales[k].band)}<div class="small">${c.report.subscales[k].score}/12</div></td>`).join('') + `<td>${c.report.overall.delta === null ? '–' : (c.report.overall.delta >= 0 ? '+' : '') + Math.round(c.report.overall.delta)}</td><td class="small">${esc(c.report.overall.summary_for_surgeon)}</td>` : ''}</tr>`).join('')}
    </tbody></table></div></section>`;
}
function checkinDetail(p){
  const c = latestCheckin(p.id, state.day), surgeon = state.role === 'surgeon';
  const hist = []; for(let d = state.day - 13; d <= state.day; d++){ const x = checkinOf(p.id, d); hist.push({d, x}); }
  const bars = `<div class="ckbars" role="img" aria-label="Check-in totals, last 14 days">${hist.map(({d, x}) => x ? `<span class="b lvl-${BAND_LVL[x.report.overall.band]}" style="height:${8 + x.report.overall.total*1.6}px" title="Day ${d}: ${BAND_WORD[x.report.overall.band]}, total ${x.report.overall.total}/48${x.simulated ? ' (simulated)' : ''}"></span>` : `<span class="b none" title="Day ${d}: no check-in"></span>`).join('')}</div>`;
  if(!c) return `<div><h3>Daily check-in</h3><p class="small">No check-in yet.</p></div>`;
  const r = c.report;
  return `<div><h3>Daily check-in</h3><p class="sub">Latest: day ${c.day}${c.simulated ? ' (simulated)' : ', '+c.time+(c.demo ? ' · Demo (scripted)' : '')} · overall ${bandChip(r.overall.band)} · ${c.demo ? 'Demo report: scripted, not AI.' : 'AI-estimated from open answers, not a validated score.'}</p>
    ${surgeon ? `<div class="subs">${ORDER.map(k => `<div class="sub-b lvl-${BAND_LVL[r.subscales[k].band]}"><span class="small">${PARTS[k]}</span><strong>${r.subscales[k].score}/12</strong><span class="small">${esc(r.subscales[k].evidence)}</span></div>`).join('')}</div>
      <p style="margin-top:8px">${esc(r.overall.summary_for_surgeon)}</p>
      ${r.vitals_check ? `<p class="small" style="margin-top:4px"><strong>Vitals check:</strong> ${esc(r.vitals_check)}</p>` : ''}
      <p class="small">Total ${r.overall.total}/48${r.overall.delta !== null ? `, ${r.overall.delta >= 0 ? '+' : ''}${Math.round(r.overall.delta)} on personal baseline` : ''}${(r.red_flag_items || []).length ? `. Red-flag items: ${r.red_flag_items.join(', ')}` : ''}. Protocol triage: Green 0–11 or within +3 of baseline, Yellow 12–21 or +4 to +7, Red 22+, +8, or a red-flag item.</p>
      ${c.answers ? `<details class="how"><summary>Answers (${c.answers.length})</summary>${c.answers.map(a => `<div class="qa"><p class="small">Item ${a.n}: ${esc(a.q)}</p><p>${esc(a.a)}</p></div>`).join('')}</details>` : ''}`
    : '<p class="small">Subscales, summary and answers are visible to the flight surgeon only.</p>'}
    <p class="lab" style="margin-top:8px">Last 14 days</p>${bars}</div>`;
}
