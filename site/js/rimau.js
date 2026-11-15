/* ================= Rimau: the crew's wellbeing companion =================
   Live mode sends the conversation and the astronaut's simulated data to api/gemini.php, which calls Gemini.
   Scripted mode, or any failed call, uses the local reply engine below so the demo never stalls. */

const RIMAU = {mode:'live', busy:false, typing:false, notice:'', endpoint:'api/gemini.php'};
const RIMAU_SIGNALS = ['stress','anxiety','loneliness','homesickness','low_mood','fatigue','sleep','conflict'];
const chatOf = pid => (store.chats[pid] = store.chats[pid] || []);

/* ---------- What Rimau knows: the same simulated data the dashboard shows ---------- */
function rimauContext(p, day){
  const st = personStatus(p, day), sess = sleepSession(p, day), today = x => x.pid === p.id && x.day === day;
  return {
    astronaut:{name:p.name, role:p.role}, mission_day:day, mission:PROFILES[state.profile].name,
    overall_status:st.level,
    heart_rate_now_bpm:hrNow(p, day),
    readings:st.rows.map(r => ({name:r.name, value:r.value, status:r.level, note:r.level === 'normal' ? '' : (r.plain || '')})),
    early_signs:st.earlyAreas,
    last_night_sleep:{hours:sess.slept === null ? 'no reading' : +sess.slept.toFixed(1), efficiency_pct:sess.eff === null ? 'no reading' : Math.round(sess.eff),
      disturbances:sess.D.map(d => `${hh(d.t)} ${d.kind}: ${d.what} (${d.env})`)},
    workload_last_7_days_h:+workload(p.id, day).total.toFixed(1),
    upcoming_critical_task:(t => t ? `${t.name} on day ${t.day} at ${hh(t.hour)}` : 'none in the next 3 days')(nextTask(p.id, day, 3)),
    check_ins_today:store.checkins.filter(today).map(c => c.answer),
    reports_today:store.reports.filter(today).map(r => r.symptoms.map(s => SYMPTOMS[s]).join(', ')),
    event_log_last_7_days:timeline({pid:p.id, day, span:7, viewer:'self'}).slice(0, 14).map(e => `Day ${e.day} ${hh(e.t)}: ${e.what}`)
  };
}

function rimauSystem(p, day){
  const list = Object.entries(INTERVENTIONS).map(([id, v]) => `- ${id}: ${v.name}. ${v.what}`).join('\n');
  return `You are Rimau, a warm, playful tiger astronaut who lives on board as the crew's wellbeing companion. You are chatting privately with ${p.name}, the ${p.role}.

Your job: through natural conversation, gently notice signs of emotional distress, loneliness or homesickness, low mood or depression, anxiety, and stress. Use the astronaut's data below to reason about how they are really doing: for example, short or broken sleep, a raised resting heart rate, a long work week, a critical task coming up, or a cabin problem.

How to talk:
- Sound like a caring friend, never like a clinical questionnaire. Never list questions. Ask at most one gentle, open question per reply.
- Keep replies short: 2 to 4 sentences. Reflect what they said and how they might feel before offering anything.
- Bring in the data naturally and sparingly ("Last night looked a bit broken, with that pump noise around 3 am"), never as a list of numbers.
- You are not a doctor. Do not diagnose or name disorders.

Advice: only suggest interventions from this list, and only when they fit. Give at most 2, by id:
${list}

Escalation: if the concern is moderate or high, set offer_escalation to true. The app will then ask the astronaut, in their own words, whether they agree to share a short summary with the flight surgeon. Never say you have shared anything yourself.
If they mention self-harm, harming others, or feeling unsafe, set concern to "crisis" and kindly urge them to use the Alert crew & ground button now, and to tell a crewmate.

Reply with JSON only, no other text, in exactly this shape:
{"reply": string, "concern": "none" | "low" | "moderate" | "high" | "crisis", "signals": array of ${RIMAU_SIGNALS.map(s => '"'+s+'"').join(', ')}, "suggestions": array of intervention ids, "offer_escalation": boolean, "summary_for_surgeon": string (1 to 2 factual sentences in the third person, empty if none)}

Astronaut data (simulated for this demo):
${JSON.stringify(rimauContext(p, day))}`;
}

/* ---------- Live call ---------- */
async function rimauLive(p, day, history){
  if(location.protocol === 'file:') throw new Error('Opened from a file, so the server is not available');
  const messages = history.slice(-16).map(m => ({role:m.role === 'user' ? 'user' : 'model', text:m.role === 'user' ? m.text : JSON.stringify({reply:m.text})}));
  const res = await fetch(RIMAU.endpoint, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({system:rimauSystem(p, day), messages})});
  const data = await res.json().catch(() => ({}));
  if(!res.ok || !data.text) throw new Error(data.error || 'HTTP '+res.status);
  return parseRimau(data.text);
}
function parseRimau(text){
  let t = String(text).trim().replace(/^```(?:json)?\s*/i, '').replace(/```$/, '').trim();
  const a = t.indexOf('{'), b = t.lastIndexOf('}');
  try{
    const o = JSON.parse(a >= 0 ? t.slice(a, b + 1) : t);
    return {reply:String(o.reply || '').trim() || '…', concern:['none','low','moderate','high','crisis'].includes(o.concern) ? o.concern : 'none',
      signals:(o.signals || []).filter(s => RIMAU_SIGNALS.includes(s)), suggestions:(o.suggestions || []).filter(s => INTERVENTIONS[s]).slice(0, 2),
      offer:!!o.offer_escalation || o.concern === 'high', summary:String(o.summary_for_surgeon || '').trim()};
  }catch(e){ return {reply:t, concern:'none', signals:[], suggestions:[], offer:false, summary:''}; }
}

/* ---------- Scripted replies: used in Scripted mode, and whenever the live call fails ---------- */
const KW = {
  crisis:/(hurt myself|kill myself|end it all|suicid|don'?t want to (be here|live)|no point (in )?living|harm (myself|someone)|not safe)/i,
  sleep:/(sleep|tired|exhaust|awake|insomnia|rest|nap|wake)/i,
  lonely:/(lonely|alone|miss|family|home|isolat|kids|daughter|son|wife|husband|partner|friends)/i,
  stress:/(stress|anxious|anxiety|overwhelm|pressure|worr|nervous|panic|on edge|spacewalk|scared|afraid)/i,
  low:/(sad|down|low|empty|pointless|unmotivat|depress|flat|numb|hopeless|cry)/i,
  conflict:/(argu|annoy|tension|fight|irritat|angry|frustrat|crewmate|snapped)/i,
  good:/^(i'?m |all |doing |feeling )?(good|fine|great|ok|okay|alright|not bad)\b/i
};
function rimauScripted(p, day, history, text){
  const ctx = rimauContext(p, day), sess = sleepSession(p, day), d0 = sess.D[0];
  const prior = history.filter(m => m.role === 'rimau' && m.meta).flatMap(m => m.meta.signals || []);
  const nightNote = d0 ? ` I noticed last night got interrupted around ${hh(d0.t)} (${d0.kind.toLowerCase()}).` : sess.slept !== null && sess.slept < 6 ? ` Your sleep tracker says you only got about ${sess.slept.toFixed(1)} h last night.` : '';
  const task = nextTask(p.id, day, 3);
  let r;
  if(KW.crisis.test(text)) r = {reply:`${p.name}, thank you for telling me. That sounds really heavy, and you deserve support right now, not later. Please press Alert crew & ground below, and let a crewmate know you need them. I'm staying right here with you.`, concern:'crisis', signals:['low_mood'], suggestions:['ppc'], offer:true, summary:`${p.name} expressed thoughts suggesting they may not feel safe. Immediate contact recommended.`};
  else if(KW.lonely.test(text)) r = {reply:`Missing home is one of the hardest parts of being up here. It doesn't mean you're not coping, it means you have people worth missing.${ctx.readings.find(x => x.name === 'Time with crew' && x.status !== 'normal') ? ' I also noticed you\'ve been spending a bit less time with the crew lately.' : ''} Would a call home help this week?`, concern:prior.includes('loneliness') || prior.includes('low_mood') ? 'moderate' : 'low', signals:['loneliness','homesickness'], suggestions:['family_call','care']};
  else if(KW.low.test(text)) r = {reply:`I'm really glad you told me. Feeling flat for a while can creep up quietly, especially with long days and not much change of scene.${nightNote} What has felt heaviest this week?`, concern:prior.length ? 'high' : 'moderate', signals:['low_mood'], suggestions:['ppc','offduty']};
  else if(KW.stress.test(text)) r = {reply:`That makes a lot of sense${task ? `, with the ${task.name.toLowerCase()} coming up on day ${task.day}` : ''}. Feeling on edge before something big is normal, and your body is probably carrying some of it too. Want to try a two-minute reset together, then pick just the next small thing?`, concern:prior.includes('stress') || prior.includes('anxiety') ? 'moderate' : 'low', signals:['stress','anxiety'], suggestions:['calm','solve']};
  else if(KW.conflict.test(text)) r = {reply:`Small crews, small spaces: friction is almost guaranteed, and it says nothing bad about you. It usually gets easier once it's said calmly, away from a critical task. Do you want to talk through how you might bring it up?`, concern:'low', signals:['conflict'], suggestions:['conflict']};
  else if(KW.sleep.test(text)) r = {reply:`That sounds draining.${nightNote || ' Tired days make everything feel heavier.'} Tonight, warm pre-sleep lighting two hours before bed might help you wind down. How have the last few nights been for you?`, concern:prior.includes('fatigue') || prior.includes('sleep') ? 'moderate' : 'low', signals:['fatigue','sleep'], suggestions:['lighting']};
  else if(KW.good.test(text)) r = {reply:`Love to hear it!${ctx.overall_status !== 'normal' ? ' Your readings look a little off today, so be kind to yourself anyway.' : ''} What's been the best part of your day so far?`, concern:'none', signals:[], suggestions:[]};
  else r = {reply:`Thanks for sharing that with me. I'm here for the big stuff and the small stuff. How are you feeling about it, honestly?`, concern:'none', signals:[], suggestions:[]};
  const worrying = ['moderate','high','crisis'].includes(r.concern);
  r.offer = r.offer || worrying;
  if(worrying && !r.summary) r.summary = `${p.name} described ${r.signals.map(s => s.replace('_', ' ')).join(' and ') || 'distress'} in a check-in chat on day ${day}${sess.slept !== null ? `, after ${sess.slept.toFixed(1)} h of sleep` : ''}. Concern level: ${r.concern}.`;
  return r;
}

function rimauGreeting(p, day){
  const st = personStatus(p, day), sess = sleepSession(p, day), rad = radiation(day);
  if(rad.rate >= THRESHOLDS.radiation.crit) return `Hi ${p.name}. Heads up first: the radiation monitor is high right now, so please head to the shielded shelter if you're not there already. Once you're settled, I'm here if you want to talk. How are you holding up?`;
  const note = sess.slept !== null && sess.slept < p.need - 0.8 ? ' Looks like last night was a bit short on sleep.' : st.level !== 'normal' ? ' A few of your readings look a little off today.' : '';
  return `Hi ${p.name}! I'm Rimau, your wellbeing buddy on board.${note} No checklist, I promise. How are you really doing today?`;
}

/* ---------- Conversation flow ---------- */
async function rimauSend(text){
  text = String(text || '').trim(); if(!text || RIMAU.busy || RIMAU.typing) return;
  const p = P(), day = state.day, chat = chatOf(p.id);
  if(!chat.length) chat.push({role:'rimau', text:rimauGreeting(p, day), day});
  chat.push({role:'user', text, day}); save();
  RIMAU.busy = true; RIMAU.notice = ''; renderRimau();
  let r, live = RIMAU.mode === 'live';
  const minWait = new Promise(res => setTimeout(res, live ? 300 : 1100));   // scripted replies "think" briefly
  try{ r = live ? await rimauLive(p, day, chat.slice(0, -1).concat([{role:'user', text}])) : rimauScripted(p, day, chat, text); }
  catch(e){ r = rimauScripted(p, day, chat, text); RIMAU.notice = `Live AI unavailable (${e.message}). Showing a scripted demo reply.`; live = false; }
  await minWait;
  chat.push({role:'rimau', text:r.reply, day, meta:{concern:r.concern, signals:r.signals, suggestions:r.suggestions, offer:r.offer, summary:r.summary, consent:null, live}});
  save(); RIMAU.busy = false; RIMAU.typing = true; renderRimau(); typeLast();
}
function typeLast(){
  const el = document.querySelector('#rimau .msg.rimau:last-of-type .txt'); const full = el ? el.dataset.full : '';
  if(!el){ RIMAU.typing = false; renderRimau(); return; }
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){ el.textContent = full; RIMAU.typing = false; setTimeout(renderRimau, 400); return; }
  let i = 0; el.textContent = '';
  const step = () => { i = Math.min(full.length, i + 2); el.textContent = full.slice(0, i); scrollChat();
    if(i < full.length) setTimeout(step, 22); else { RIMAU.typing = false; renderRimau(); } };
  step();
}
function scrollChat(){ const log = document.querySelector('#rimau .log'); if(log) log.scrollTop = log.scrollHeight; }

function rimauConsent(idx, yes){
  const p = P(), chat = chatOf(p.id), m = chat[idx]; if(!m || !m.meta) return;
  m.meta.consent = yes ? 'shared' : 'declined';
  if(yes){
    store.shares.push({id:uid(), pid:p.id, day:state.day, ...stamp(), concern:m.meta.concern, signals:m.meta.signals, summary:m.meta.summary || `${p.name} asked for a follow-up after a chat with Rimau.`});
    chat.push({role:'rimau', text:`Done. I've shared a short summary with the flight surgeon, and only them. They'll reach out to set up a private conference. Thank you for trusting me with this, ${p.name}.`, day:state.day});
  } else chat.push({role:'rimau', text:'That\'s completely okay. It stays between us. The offer is always open, and so am I.', day:state.day});
  save(); renderRimau(); scrollChat();
}

/* ---------- Panel ---------- */
const SUGGEST = ['Honestly, I\'m exhausted.', 'I miss my family a lot lately.', 'Feeling on edge about the next task.', 'I\'ve been feeling kind of down.', 'I\'m doing fine, thanks!'];
function renderRimau(){
  const box = $('rimau'); if(!box || state.view !== 'personal') return;
  const p = P(), chat = chatOf(p.id), talking = RIMAU.busy || RIMAU.typing, input = $('rimau-in'), draft = input ? input.value : '', focused = document.activeElement === input;
  const shown = chat.length ? chat : [{role:'rimau', text:rimauGreeting(p, state.day)}];
  const last = shown.length - 1, sharedToday = store.shares.some(s => s.pid === p.id && s.day === state.day);
  const offerAt = sharedToday ? -1 : shown.map((m, i) => m.meta && m.meta.offer && m.meta.consent === null ? i : -1).reduce((a, b) => Math.max(a, b), -1);
  const intv = id => { const v = INTERVENTIONS[id];
    return `<div class="intv"><strong>${v.name}</strong><span>${v.what}</span><span class="small">Source: ${v.src.map(k => `<a href="${srcOf(k)[1]}" target="_blank" rel="noopener">${esc(srcOf(k)[0].split(':')[0].split(',')[0])}</a>`).join('; ')}</span>${v.tool ? `<button class="btn" data-act="opentool" data-tool="${v.tool}">Open</button>` : ''}</div>`; };
  const msg = (m, i) => {
    const typingThis = RIMAU.typing && i === last && m.role === 'rimau', meta = m.meta || {};
    return `<div class="msg ${m.role}">${m.role === 'rimau' ? '<span class="who">Rimau</span>' : ''}<p class="txt" data-full="${esc(m.text)}">${typingThis ? '' : esc(m.text)}</p>
      ${!typingThis && meta.suggestions && meta.suggestions.length ? `<div class="intvs">${meta.suggestions.map(intv).join('')}</div>` : ''}
      ${!typingThis && meta.concern === 'crisis' ? `<div class="crisis"><strong>Please reach out now.</strong> Your crew and ground are ready to help.<button class="big alert" data-act="openalert">${ICON.bell}Alert crew &amp; ground</button></div>` : ''}
      ${!typingThis && i === offerAt ? `<div class="consent"><p><strong>Would you like me to share a short summary with the flight surgeon?</strong> Only with your OK. Nobody else sees it.</p><p class="small">"${esc(meta.summary || '')}"</p><div class="btnrow"><button class="btn primary" data-act="rconsent" data-i="${i}" data-yes="1">Yes, share it</button><button class="btn" data-act="rconsent" data-i="${i}" data-yes="">Not now</button></div></div>` : ''}
      ${!typingThis && meta.consent ? `<p class="small">${meta.consent === 'shared' ? 'Shared with the flight surgeon.' : 'Not shared.'}</p>` : ''}
      ${m.role === 'rimau' && meta.concern ? `<span class="small aimeta">${meta.live ? 'Gemini' : 'Scripted'} · concern: ${meta.concern}</span>` : ''}</div>`; };
  box.innerHTML = `<div class="rimau-head"><img class="rimau-av" src="${talking ? 'assets/rimau-talking.gif' : 'assets/rimau-still.png'}" alt="Rimau the tiger astronaut${talking ? ', talking' : ''}" width="84" height="84">
      <div><h2>Rimau</h2><p class="small">Your private wellbeing buddy. ${RIMAU.mode === 'live' ? 'Powered by Gemini.' : 'Scripted demo mode.'}</p></div></div>
    <div class="log" aria-live="polite">${shown.map(msg).join('')}${RIMAU.busy ? '<div class="msg rimau"><span class="who">Rimau</span><p class="dots" aria-label="Rimau is typing"><i></i><i></i><i></i></p></div>' : ''}</div>
    ${RIMAU.notice ? `<p class="small warnline">${esc(RIMAU.notice)}</p>` : ''}
    <div class="chips">${SUGGEST.map(s => `<button class="btn sm" data-act="rsay" data-t="${esc(s)}" ${talking ? 'disabled' : ''}>${esc(s)}</button>`).join('')}</div>
    <form id="rimau-form" class="rin"><label for="rimau-in" class="sr">Message Rimau</label><input id="rimau-in" autocomplete="off" maxlength="500" placeholder="Talk to Rimau…" value="${esc(draft)}"><button class="btn primary" ${talking ? 'disabled' : ''}>Send</button></form>
    <div class="rfoot"><span class="small">Private: Rimau shares nothing without your OK. Not a medical service.</span>${chat.length ? '<button class="link sm" data-act="rclear">Clear chat</button>' : ''}</div>`;
  if(focused){ const n = $('rimau-in'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }
  scrollChat();
}
