"""Serve the site locally and act as the onboard AI endpoint (POST /api/gemini).

Usage (Windows PowerShell):
    $env:GEMINI_API_KEY = "your-key"
    python dev_server.py            # then open http://localhost:8000

Usage (Command Prompt):  set GEMINI_API_KEY=your-key  &&  python dev_server.py

The key is read from the environment only, so it never lands in a file or the git repo.
Optional: GEMINI_MODELS="model-a,model-b" to change the models tried, in order. PORT to change the port.
No extra packages needed (standard library only).
"""
import http.server
import json
import os
import urllib.error
import urllib.request

ROOT = os.path.dirname(os.path.abspath(__file__))
KEY = os.environ.get("GEMINI_API_KEY", "").strip()
MODELS = [m.strip() for m in os.environ.get("GEMINI_MODELS", "gemini-3.5-flash-lite,gemini-flash-latest,gemini-2.5-flash").split(",") if m.strip()]
PORT = int(os.environ.get("PORT", "8000"))
API = "https://generativelanguage.googleapis.com/v1beta/models/{}:generateContent"


def call_gemini(body):
    system = str(body.get("system", ""))[:80000]
    contents = []
    for m in (body.get("messages") or [])[-30:]:
        text = str(m.get("text", ""))[:6000]
        if text:
            contents.append({"role": "model" if m.get("role") == "model" else "user", "parts": [{"text": text}]})
    if not contents or contents[-1]["role"] != "user":
        return 400, {"error": "Last message must be from the user"}
    config = {"maxOutputTokens": max(256, min(int(body.get("maxTokens", 1024)), 8192))}
    if body.get("json"):
        config["responseMimeType"] = "application/json"
    payload = json.dumps({"systemInstruction": {"parts": [{"text": system}]}, "contents": contents, "generationConfig": config}).encode()
    last = "No model answered"
    for model in MODELS:
        req = urllib.request.Request(API.format(model), data=payload, method="POST",
                                     headers={"Content-Type": "application/json", "x-goog-api-key": KEY})
        try:
            with urllib.request.urlopen(req, timeout=90) as r:
                j = json.loads(r.read())
        except urllib.error.HTTPError as e:
            detail = e.read().decode(errors="replace")[:300]
            last = f"Gemini error {e.code} on {model}: {detail}"
            if e.code in (404, 429) or e.code >= 500 or (e.code == 400 and "not found" in detail.lower()):
                continue
            return 502, {"error": last}
        except Exception as e:  # network problems
            last = f"Network error: {e}"
            continue
        parts = ((j.get("candidates") or [{}])[0].get("content") or {}).get("parts") or []
        text = "".join(p.get("text", "") for p in parts if not p.get("thought"))
        if text:
            return 200, {"text": text, "model": model}
        last = f"Empty reply from {model}"
    return 502, {"error": last}


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def send_json(self, code, obj):
        data = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_POST(self):
        if self.path.split("?")[0] != "/api/gemini":
            return self.send_json(404, {"error": "Not found"})
        if not KEY:
            return self.send_json(500, {"error": "GEMINI_API_KEY is not set. Set it, then restart dev_server.py."})
        try:
            n = min(int(self.headers.get("Content-Length", "0")), 400000)
            body = json.loads(self.rfile.read(n) or b"{}")
        except Exception:
            return self.send_json(400, {"error": "Bad request"})
        code, obj = call_gemini(body)
        self.send_json(code, obj)


if __name__ == "__main__":
    print(f"Serving {ROOT} at http://localhost:{PORT}")
    print("Gemini key:", "found" if KEY else "MISSING (set GEMINI_API_KEY, the AI will not answer)")
    http.server.ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
