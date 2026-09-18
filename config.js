/* ============================================================
   Kanah Buyer Mock — the only file you need to edit.

   STAGE          one of the keys in stages.js (the table at the top of that file).
                  Default 'choose_inspector'.
   SHOW_DEMO_BAR  true shows the stage picker bottom-right; false hides it for screenshots.
   LOGIN          the demo sign-in gate. enabled:false removes the lock screen entirely.
                  Plain text in a static file is a demo gate, not security.

   A URL hash can override STAGE for one visit:  index.html#view=home&stage=counteroffer
   ============================================================ */
const STAGE = 'choose_inspector';
const SHOW_DEMO_BAR = true;
const LOGIN = { enabled: true, user: 'alex', pass: 'willowridge' };
