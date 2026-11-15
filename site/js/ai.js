/* ================= Onboard AI client =================
   One endpoint for both AI roles (Rimau the general assistant, and the daily check-in assessor).
   In this demo the endpoint is dev_server.py on this computer; on a spacecraft it would be the onboard model. */
const AI = {endpoint:'api/gemini'};

async function callAI(system, messages, opt){
  opt = opt || {};
  let res;
  try{
    res = await fetch(AI.endpoint, {method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({system, messages, json:!!opt.json, maxTokens:opt.maxTokens || 1024})});
  }catch(e){ throw new Error('The onboard AI is not reachable. Start the site with dev_server.py.'); }
  const data = await res.json().catch(() => ({}));
  if(!res.ok || !data.text) throw new Error(data.error || (res.status === 501 || res.status === 404 || res.status === 405 ? 'The onboard AI is not reachable. Start the site with dev_server.py.' : 'AI error '+res.status));
  return data.text;
}
function parseAIJson(text){
  const t = String(text).trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
  const a = t.indexOf('{'), b = t.lastIndexOf('}');
  return JSON.parse(a >= 0 ? t.slice(a, b + 1) : t);
}

/* Small, safe markdown: paragraphs, line breaks, **bold**, `code`, and - or 1. lists. Everything is escaped first. */
function md(text){
  const lines = esc(String(text).trim()).split('\n'), out = []; let list = null;
  const inline = s => s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code>$1</code>');
  const close = () => { if(list){ out.push(`</${list}>`); list = null; } };
  lines.forEach(l => {
    const ul = l.match(/^\s*[-*•]\s+(.*)/), ol = l.match(/^\s*\d+[.)]\s+(.*)/);
    if(ul || ol){ const tag = ul ? 'ul' : 'ol'; if(list !== tag){ close(); out.push(`<${tag}>`); list = tag; } out.push(`<li>${inline((ul || ol)[1])}</li>`); }
    else if(!l.trim()){ close(); out.push('<br>'); }
    else { close(); out.push(`<p>${inline(l)}</p>`); }
  });
  close();
  return out.join('').replace(/(<br>)+/g, '');
}
