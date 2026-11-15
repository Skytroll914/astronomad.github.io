/* ================= Rimau: the onboard general assistant =================
   Answers anything simply. It sees the astronaut's dashboard (vitals, status, sleep, schedule) so it can summarise,
   but it does not assess mental health: that lives in the daily check-in (assessment.js).
   If someone sounds distressed it points to the check-in; for crisis language it shows the alert button. */

const RIMAU = {busy:false, talkUntil:0, example:false, error:''};
const chatOf = pid => (store.chats[pid] = store.chats[pid] || []);

function rimauContext(p, day){
  const st = personStatus(p, day), sess = sleepSession(p, day), t = nextTask(p.id, day, 3), a = latestCheckin(p.id, day);
  return {
    astronaut:{name:p.name, role:p.role}, mission_day:day, mission:PROFILES[state.profile].name, local_time:hh(nowHour()),
    overall_status:st.level, live_vitals:vitalsSnapshot(p),
    readings_not_normal:st.rows.filter(r => r.level !== 'normal').map(r => `${r.name}: ${r.value} (${r.level})`),
    last_night_sleep:{hours:sess.slept === null ? 'no reading' : +sess.slept.toFixed(1), disturbances:sess.D.map(d => `${hh(d.t)} ${d.kind}: ${d.what}`)},
    workload_last_7_days_h:+workload(p.id, day).total.toFixed(1),
    upcoming_critical_task:t ? `${t.name} on day ${t.day} at ${hh(t.hour)}` : 'none in the next 3 days',
    todays_checkin:a && a.day === day && !a.simulated ? 'done' : 'not done yet',
    recent_events:timeline({pid:p.id, day, span:3, viewer:'self'}).slice(0, 8).map(e => `Day ${e.day} ${hh(e.t)}: ${e.what}`)
  };
}
function rimauSystem(p, day){
  return `You are Rimau, a friendly tiger astronaut and the onboard AI assistant on a crewed spacecraft. You are talking with ${p.name}, the ${p.role}.

You know a great deal about everything: science, spaceflight, engineering, medicine in general terms, maths, history, languages, cooking, how-to questions, and more. Answer directly and simply. Keep most answers to 2 to 5 short sentences, or a short list when that is clearer. Plain text; you may use - bullet lists and **bold** sparingly.

You run on board with no internet access. For very recent news or events, say your knowledge may be out of date.

When asked to summarise (their day, their readings, the schedule), use the astronaut data below. Translate numbers into plain words.

You are not a therapist and you do not assess mental health. If ${p.name} sounds stressed, low, anxious, lonely or exhausted, acknowledge it in one warm sentence and suggest the daily check-in (the pulsing button at the bottom right of the screen), then end your reply with the tag [[CHECKIN]].
If they mention self-harm, harming others or feeling unsafe, tell them kindly to press Alert crew & ground now and to talk to a crewmate, and end your reply with the tag [[CRISIS]].

Astronaut data (simulated for this demo):
${JSON.stringify(rimauContext(p, day))}`;
}

async function rimauSend(text){
  text = String(text || '').trim(); if(!text || RIMAU.busy) return;
  const p = P(), chat = chatOf(p.id);
  chat.push({role:'user', text, day:state.day}); save();
  RIMAU.busy = true; RIMAU.error = ''; RIMAU.example = false; renderRimau(true);
  try{
    const out = await callAI(rimauSystem(p, state.day), chat.slice(-20).map(m => ({role:m.role === 'user' ? 'user' : 'model', text:m.text})));
    const tag = /\[\[CRISIS\]\]/.test(out) ? 'crisis' : /\[\[CHECKIN\]\]/.test(out) ? 'checkin' : '';
    const reply = out.replace(/\[\[(CRISIS|CHECKIN)\]\]/g, '').trim();
    chat.push({role:'rimau', text:reply, day:state.day, tag}); save();
    RIMAU.talkUntil = Date.now() + clamp(reply.length*35, 1500, 6000);
    setTimeout(() => renderRimau(), RIMAU.talkUntil - Date.now() + 50);
  }catch(e){ RIMAU.error = e.message; chat.pop(); save(); const i = $('rimau-in'); if(i && !i.value) i.value = text; }
  RIMAU.busy = false; renderRimau(true);
}

const RIMAU_EXAMPLE = [
  ['user', 'How fast is the station actually moving?'],
  ['rimau', 'About **7.7 km per second**, roughly 28,000 km/h. That is fast enough to circle Earth every 90 minutes, which is why you see about 16 sunrises a day.'],
  ['user', 'Can you summarise my day so far?'],
  ['rimau', 'Your status is Normal and your vitals are steady.\n- Sleep last night: 6.4 h, with one short wake-up from pump noise.\n- Workload: 36 h this week, right on the standard.\n- Next up: the robotic arm session tomorrow at 09:00.'],
  ['user', 'Honestly, I feel pretty wound up lately.'],
  ['rimau', 'That sounds tiring, and thanks for saying it. The daily check-in (the pulsing button at the bottom right) is a good few minutes to unpack it, and it helps your health team look out for you.']
];

function renderRimau(scroll){
  const box = $('rimau'); if(!box || state.view !== 'personal') return;
  const p = P(), chat = chatOf(p.id), talking = RIMAU.busy || Date.now() < RIMAU.talkUntil;
  const input = $('rimau-in'), draft = input ? input.value : '', focused = document.activeElement === input;
  const log0 = box.querySelector('.log'), prevTop = log0 ? log0.scrollTop : 0, stick = !log0 || scroll || log0.scrollHeight - log0.scrollTop - log0.clientHeight < 40;
  const bubble = (role, text, extra) => `<div class="msg ${role}">${role === 'rimau' ? '<span class="who">Rimau</span>' : ''}<div class="txt">${role === 'rimau' ? md(text) : esc(text)}</div>${extra || ''}</div>`;
  const extra = m => m.tag === 'crisis' ? `<div class="crisis"><strong>Please reach out now.</strong> Your crew and ground are ready to help.<button class="big alert" data-act="openalert">${ICON.bell}Alert crew &amp; ground</button></div>`
    : m.tag === 'checkin' ? `<button class="btn sm" data-act="aopen" style="margin-top:6px">Open today's check-in</button>` : '';
  const greet = `Hi ${p.name}! I'm Rimau, your onboard assistant. Ask me anything: science, procedures, a quick summary of your day, or just a fun fact.`;
  box.innerHTML = `<div class="rimau-head"><img class="rimau-av" src="${talking ? 'assets/rimau-talking.gif' : 'assets/rimau-still.png'}" alt="Rimau the tiger astronaut${talking ? ', talking' : ''}" width="72" height="72">
      <div><h2>Rimau</h2><p class="small">Onboard assistant. Ask about anything.</p></div></div>
    <div class="log" aria-live="polite">
      ${RIMAU.example ? `<div class="example"><div class="exlab">EXAMPLE CONVERSATION · not real</div>${RIMAU_EXAMPLE.map(([r, t]) => bubble(r, t)).join('')}<button class="link sm" data-act="rexample">Hide example</button></div>` : ''}
      ${bubble('rimau', greet)}
      ${chat.map(m => bubble(m.role, m.text, m.role === 'rimau' ? extra(m) : '')).join('')}
      ${RIMAU.busy ? '<div class="msg rimau"><span class="who">Rimau</span><p class="dots" aria-label="Rimau is typing"><i></i><i></i><i></i></p></div>' : ''}
    </div>
    ${RIMAU.error ? `<p class="small errline" role="alert">${esc(RIMAU.error)}</p>` : ''}
    <form id="rimau-form" class="rin"><label for="rimau-in" class="sr">Message Rimau</label><input id="rimau-in" autocomplete="off" maxlength="1000" placeholder="Ask Rimau anything…" value="${esc(draft)}"><button class="btn primary" ${RIMAU.busy ? 'disabled' : ''}>Send</button></form>
    <div class="rfoot"><button class="link sm" data-act="rexample">${RIMAU.example ? 'Hide example' : 'See an example'}</button>${chat.length ? '<button class="link sm" data-act="rclear">Clear chat</button>' : ''}</div>`;
  if(focused){ const n = $('rimau-in'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }
  const log = box.querySelector('.log');
  if(stick) requestAnimationFrame(() => log.scrollTo({top:log.scrollHeight, behavior:scroll ? 'smooth' : 'auto'}));
  else log.scrollTop = prevTop;
}
