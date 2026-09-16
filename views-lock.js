/* Lock screen. Returns HTML; Shell mounts it into #lock and handles sign-in. */
const Lock = (() => {
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  const ARROW = '<path d="M16.17 11 10.81 5.64l1.41-1.42L20 12l-7.78 7.78-1.41-1.42L16.17 13H4v-2z"/>';
  function render(opts) {
    const o = opts || {};
    const err = o.error ? ' error' : '';
    // Nothing on this pane identifies the buyer, the agent or the property: it is rendered before anyone has signed in.
    return `<div class="lock-bg kit-sky" aria-hidden="true"><i class="s1"></i><i class="s2"></i><i class="s3"></i><img class="house" src="assets/brand/house-night.png" alt=""></div>
      <div class="lpane brand brandpane">
        <div class="mark"><img src="assets/brand/kanah-mark.svg" alt="Kanah"><span>Kanah<i>.</i></span></div>
        <p class="creed">Simplifying the home buying experience</p>
      </div>
      <div class="lpane form formpane">
        <h2>Sign in</h2>
        <div class="kit-line${err}"><input type="text" id="lock-user" autocomplete="username" required aria-label="Username"><label class="lbl" for="lock-user">Username</label><span class="ul"></span></div>
        <div class="kit-line${err}"><input type="password" id="lock-pass" autocomplete="current-password" required aria-label="Password"><label class="lbl" for="lock-pass">Password</label><span class="ul"></span></div>
        <label class="keep"><input type="checkbox" class="kit-switch" id="lock-keep">Keep me signed in</label>
        <p class="vmsg" role="alert" ${o.error ? '' : 'hidden'}>Please check your username and password.</p>
        <div class="actions"><button type="button" class="kit-cta" data-cta data-signin><svg viewBox="0 0 24 24" class="arr-2">${ARROW}</svg><span class="text">Sign in</span><svg viewBox="0 0 24 24" class="arr-1">${ARROW}</svg></button></div>
        <p class="small muted">Demo sign-in. Credentials are set in config.js.</p>
      </div>`;
  }
  return { render };
})();
