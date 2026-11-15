<?php
/* Rimau -> Gemini proxy. The browser sends {system, messages:[{role:'user'|'model', text}]};
   this script adds the API key server-side and returns {text} or {error}.
   The key is read from gemini-config.php ONE LEVEL ABOVE the web root (outside public_html),
   or from the GEMINI_API_KEY environment variable. It never reaches the browser. */

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function cut($s, $n){ return function_exists('mb_substr') ? mb_substr($s, 0, $n) : substr($s, 0, $n); }
function fail($code, $msg){ http_response_code($code); echo json_encode(['error' => $msg]); exit; }

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail(405, 'POST only');

// --- config ---
$cfg = [];
$candidates = [
  rtrim($_SERVER['DOCUMENT_ROOT'] ?? '', '/') . '/../gemini-config.php',   // recommended: outside public_html
  __DIR__ . '/config.php'                                                  // fallback: next to this file
];
foreach ($candidates as $f) { if ($f && is_readable($f)) { $c = include $f; if (is_array($c)) { $cfg = $c; break; } } }
$key = getenv('GEMINI_API_KEY') ?: ($cfg['api_key'] ?? '');
if (!$key || strpos($key, 'PASTE') === 0) fail(500, 'API key not configured');
$models = $cfg['models'] ?? ['gemini-3.5-flash-lite', 'gemini-flash-latest', 'gemini-2.5-flash'];

// --- input: small and well-formed only ---
$raw = file_get_contents('php://input', false, null, 0, 120000);
$in = json_decode($raw, true);
if (!is_array($in) || !isset($in['system'], $in['messages']) || !is_array($in['messages'])) fail(400, 'Bad request');
$system = cut((string)$in['system'], 60000);
$contents = [];
foreach (array_slice($in['messages'], -20) as $m) {
  $role = ($m['role'] ?? '') === 'model' ? 'model' : 'user';
  $text = cut((string)($m['text'] ?? ''), 2000);
  if ($text === '') continue;
  $contents[] = ['role' => $role, 'parts' => [['text' => $text]]];
}
if (!$contents || end($contents)['role'] !== 'user') fail(400, 'Last message must be from the user');

$payload = json_encode([
  'systemInstruction' => ['parts' => [['text' => $system]]],
  'contents' => $contents,
  'generationConfig' => ['responseMimeType' => 'application/json', 'maxOutputTokens' => 1024]
]);

// --- call Gemini, trying each model in turn (model names change over time) ---
$last = 'No model answered';
foreach ($models as $model) {
  $url = 'https://generativelanguage.googleapis.com/v1beta/models/' . rawurlencode($model) . ':generateContent';
  $ch = curl_init($url);
  curl_setopt_array($ch, [
    CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 30,
    CURLOPT_HTTPHEADER => ['Content-Type: application/json', 'x-goog-api-key: ' . $key],
    CURLOPT_POSTFIELDS => $payload
  ]);
  $res = curl_exec($ch); $code = curl_getinfo($ch, CURLINFO_HTTP_CODE); $err = curl_error($ch); curl_close($ch);
  if ($res === false) { $last = 'Network error: ' . $err; continue; }
  $j = json_decode($res, true);
  if ($code === 404 || $code === 400 && stripos($res, 'model') !== false && stripos($res, 'not found') !== false) { $last = "Model $model not available"; continue; }
  if ($code !== 200) { $last = 'Gemini error ' . $code . ': ' . ($j['error']['message'] ?? 'unknown'); if ($code === 429 || $code >= 500) continue; fail(502, $last); }
  $text = '';
  foreach (($j['candidates'][0]['content']['parts'] ?? []) as $p) { if (empty($p['thought'])) $text .= $p['text'] ?? ''; }
  if ($text === '') { $last = 'Empty reply from ' . $model; continue; }
  echo json_encode(['text' => $text, 'model' => $model]);
  exit;
}
fail(502, $last);
