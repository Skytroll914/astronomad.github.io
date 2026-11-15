# Putting the site on GoDaddy (cPanel hosting)

## 1. Upload the website
1. In GoDaddy, open **cPanel**, then **File Manager**, then `public_html`.
2. Upload everything **inside** the `site/` folder: `index.html`, `css/`, `js/`, `assets/` and `api/`. Include the hidden `api/.htaccess` (turn on **Settings → Show hidden files** in File Manager).
   - The easy way: zip the *contents* of `site/`, upload the zip, then right-click it and choose **Extract**.
   - Do **not** upload `gemini-config.sample.php` with a real key in it.

## 2. Add the Gemini key (kept secret on the server)
1. Copy `site/gemini-config.sample.php` to a new file named `gemini-config.php`, and paste your key from https://aistudio.google.com/apikey in place of `PASTE_YOUR_GEMINI_API_KEY_HERE`.
2. In File Manager, go **one level above** `public_html` (your home folder, for example `/home/<cpanel-user>/`) and upload `gemini-config.php` there.
   The browser can't reach anything outside `public_html`, so the key stays private.

## 3. Check it works
- Open your domain. You should see the sign-in screen.
- Sign in as Astronaut and say hi to Rimau. Under each reply you'll see `Gemini · concern: …` when the live AI answered.
- If you see "Live AI unavailable (…)", the message in brackets tells you why:
  - `API key not configured`: `gemini-config.php` isn't in the folder above `public_html`, or the key wasn't pasted in.
  - `Model … not available`: Google renamed its models. Put the current Flash model id first in the `models` list in `gemini-config.php`.
  - `Gemini error 403/429`: the key is wrong or has hit its free quota.
- Even when the live AI fails, the demo keeps working: Rimau answers with scripted replies.

## Tips for recording the video
- The **Developer: demo walkthrough** link on the sign-in screen opens all tabs. The **About this demo** tab lists the scenes in order, each with a **Show** button.
- In **Demo controls**, choose **Rimau replies: Scripted demo** for repeatable takes, and **Clear reports, alerts, chats and remote** between takes.
- Deep links jump straight to a scene. A refresh without them returns to sign-in.
  - `?as=demo&view=team&day=64`: the solar particle event
  - `?as=astronaut&p=tomas&day=26&rimau=scripted`: Tomas after a late duty night
  - `?as=ground&day=26&role=surgeon`: the flight surgeon view
- Opening `index.html` straight from your computer works too, with Rimau in scripted mode, because there is no PHP server locally.
