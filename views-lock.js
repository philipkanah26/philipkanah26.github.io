/* Lock screen. Returns HTML; Shell mounts it into #lock and handles sign-in.
   One full-width night scene with a centred column: the mark and wordmark, the slogan, then the form (18 Sep 2026). */
const Lock = (() => {
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  const ARROW = '<path d="M16.17 11 10.81 5.64l1.41-1.42L20 12l-7.78 7.78-1.41-1.42L16.17 13H4v-2z"/>';
  function render(opts) {
    const o = opts || {};
    const err = o.error ? ' error' : '';
    // Nothing on this screen identifies the buyer, the agent or the property: it is rendered before anyone has signed in.
    return `<div class="lock-bg kit-sky" aria-hidden="true"><i class="s1"></i><i class="s2"></i><i class="s3"></i><img class="house" src="assets/brand/house-night.png" alt=""></div>
      <div class="lock-shade" aria-hidden="true"></div>
      <div class="lock-col">
        <div class="mark"><img src="assets/brand/kanah-mark.svg" alt="Kanah"><span>Kanah<i>.</i></span></div>
        <p class="creed">A clearer way home.</p>
        <div class="formpane">
          <div class="kit-field${err}"><input type="text" id="lock-user" autocomplete="username" required aria-label="Username"><span>Username</span></div>
          <div class="kit-field${err}"><input type="password" id="lock-pass" autocomplete="current-password" required aria-label="Password"><span>Password</span></div>
          <label class="keep"><input type="checkbox" class="kit-switch" id="lock-keep">Keep me signed in</label>
          <p class="vmsg" role="alert" ${o.error ? '' : 'hidden'}>Please check your username and password.</p>
          <div class="actions"><button type="button" class="kit-cta" data-cta data-signin><svg viewBox="0 0 24 24" class="arr-2">${ARROW}</svg><span class="text">Sign in</span><svg viewBox="0 0 24 24" class="arr-1">${ARROW}</svg></button></div>
          <p class="small muted">Demo sign-in. Credentials are set in config.js.</p>
        </div>
      </div>`;
  }
  return { render };
})();
