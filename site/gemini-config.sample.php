<?php
/* Copy this file to gemini-config.php and upload it ONE LEVEL ABOVE public_html
   (for example /home/yourcpaneluser/gemini-config.php), NOT inside the website folder.
   Do not upload this sample with a real key in it. */
return [
  'api_key' => 'PASTE_YOUR_GEMINI_API_KEY_HERE',
  // Tried in order. If Google renames a model, put the new id first.
  'models'  => ['gemini-3.5-flash-lite', 'gemini-flash-latest', 'gemini-2.5-flash'],
];
