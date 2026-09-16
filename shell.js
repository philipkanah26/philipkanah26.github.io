/* Chrome, router, lock, motion hooks and events. Pure composition in compose(); DOM only in render()/boot(). */
const Shell = (() => {
  const VIEWS = ['home','timeline','ask','messages','homes','team','documents','money','offer'];
  let lastView = 'documents';
  let pendingQuestion = null;
  let unlockedFlag = false;
  let loaderTimer = null, toastTimer = null, pop = null;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));

  const ICONS = {
    home:'<path d="M3 11l9-8 9 8v9a2 2 0 0 1-2 2h-4v-6H9v6H5a2 2 0 0 1-2-2z"/>',
    timeline:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    ask:'<path d="M21 12a8 8 0 0 1-11.6 7.2L3 21l1.8-5.4A8 8 0 1 1 21 12z"/><path d="M9.5 10a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.5"/><path d="M12 17h.01"/>',
    messages:'<path d="M4 5h16v11H8l-4 4z"/>',
    homes:'<path d="M3 21h18"/><path d="M5 21V8l7-5 7 5v13"/><path d="M10 21v-6h4v6"/>',
    team:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 15.5a5 5 0 0 1 5.5 4.5"/>',
    documents:'<path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5"/>',
    money:'<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/>',
    call:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
    out:'<path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5"/><path d="M15 16l4-4-4-4"/><path d="M9 12h10"/>',
    dl:'<path d="M12 5v13m0 0-4-4m4 4 4-4"/><path d="M5 20h14"/>'
  };
  const ico = k => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${ICONS[k]}</svg>`;
  const mi = k => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[k]}</svg>`;

  /* ---------- lock state ---------- */
  const store = kind => { try { return kind === 'local' ? localStorage : sessionStorage; } catch (e) { return null; } };
  function storageUnlocked() { try { const s = store('session'), l = store('local'); return !!((s && s.getItem('kanah.unlocked')) || (l && l.getItem('kanah.unlocked'))); } catch (e) { return false; } }
  function locked() { return !!(typeof LOGIN !== 'undefined' && LOGIN.enabled) && !unlockedFlag && !storageUnlocked(); }
  function signIn(user, pass, keep) {
    if (typeof LOGIN === 'undefined' || !LOGIN.enabled) { unlockedFlag = true; return true; }
    if (String(user || '').trim().toLowerCase() !== String(LOGIN.user).toLowerCase() || String(pass || '') !== String(LOGIN.pass)) return false;
    unlockedFlag = true;
    try { const s = store('session'); if (s) s.setItem('kanah.unlocked', '1'); if (keep) { const l = store('local'); if (l) l.setItem('kanah.unlocked', '1'); } } catch (e) { /* storage unavailable: the flag carries this visit */ }
    return true;
  }
  function signOut() { unlockedFlag = false; try { ['session', 'local'].forEach(k => { const s = store(k); if (s) s.removeItem('kanah.unlocked'); }); } catch (e) { /* ignore */ } }

  /* ---------- routing ---------- */
  function parse(hash) {
    const p = Engine.parseHash(hash);
    const cur = Engine.current(hash);
    const hashStage = p.stage && Engine.keys.includes(p.stage) ? p.stage : '';
    let view = p.view || 'home', sub = null, doc = null;
    if (view.startsWith('doc/')) { doc = view.slice(4); view = lastView; }
    if (view.startsWith('homes/')) { sub = view.slice(6); view = 'homes'; }
    if (view.startsWith('messages/')) { sub = view.slice(9); view = 'messages'; }
    if (!VIEWS.includes(view)) view = 'home';
    if (p.key && typeof LOGIN !== 'undefined' && p.key === String(LOGIN.pass)) signIn(LOGIN.user, LOGIN.pass, false);
    const step = p.step && SPINE.steps.some(s => s.id === p.step) ? p.step : null;
    return { cur, view, sub, doc, hashStage, step, forceLock: p.lock === '1', bad: p.bad === '1', still: p.still === '1' };
  }
  function viewString(st) { return st.sub ? (st.view === 'homes' ? 'homes/' : 'messages/') + st.sub : st.view; }
  function msgAttr(p) {
    if (['maya', 'sam'].includes(p.id)) return 'data-go="messages/maya"';
    if (p.id === 'jordan') return 'data-go="messages/jordan"';
    if (['renee', 'elena'].includes(p.id)) return 'data-go="messages/closing"';
    return `data-toast="${esc(p.name.split(' ')[0])} is reached through Maya. Ask in your private thread."`;
  }

  function counts(cur) {
    const attn = WORLD.tasks.filter(t => Engine.visible(t, cur)).filter(t => ['you', 'attention'].includes(Engine.statusAt({ status: t.bucket }, cur))).length;
    const unread = WORLD.messages.filter(m => m.stage === cur && m.from !== 'alex').length;
    return { attn, unread };
  }

  /* ---------- chrome ---------- */
  function sideHtml(st) {
    const c = counts(st.cur);
    const item = (v, label, badge) => `<button type="button" data-go="${v}" ${st.view === v ? 'aria-current="page"' : ''}>${ico(v)}<span class="lbl">${label}</span>${badge || ''}</button>`;
    const hasProp = Engine.idx(st.cur) >= Engine.idx('searching');
    const maya = Engine.byId(WORLD.people, 'maya');
    const foot = hasProp
      ? `<div class="foot"><img src="${WORLD.property.img}" alt="${esc(WORLD.images[WORLD.property.img] || '')}"><div><b>${esc(WORLD.property.address)}</b><span>${esc(maya.name)} · ${esc(maya.org)}</span></div></div>`
      : `<div class="foot"><img src="${maya.img}" alt="${esc(WORLD.images[maya.img] || '')}" style="border-radius:50%"><div><b>${esc(maya.name)}</b><span>${esc(maya.role)} · ${esc(maya.org)}</span></div></div>`;
    return `<button type="button" class="mark" data-go="home"><img src="assets/brand/kanah-mark.svg" alt="Kanah"><span>Kanah<i>.</i></span></button>
      <nav class="nav" aria-label="Main">
        ${item('home', 'Home', c.attn ? `<span class="badge attn">${c.attn}</span>` : '')}
        ${item('timeline', 'Timeline')}
        ${item('ask', 'Ask Kanah')}
        ${item('messages', 'Messages', c.unread ? `<span class="badge">${c.unread}</span>` : '')}
        <button type="button" class="grp" data-more-toggle aria-expanded="true">More</button>
        <div class="sub" data-more-panel>${item('homes', 'Homes')}${item('team', 'Team')}${item('documents', 'Documents')}${item('money', 'Money')}</div>
      </nav>${foot}`;
  }
  function topHtml(st) {
    return `<button type="button" class="search" data-toast="Search is not part of this mock."><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>Search homes, documents, people</button>
      <button type="button" class="bell" aria-label="Notifications" data-toast="Notifications open here. Nothing sensitive is ever in one."><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg><i></i></button>
      <button type="button" class="me" data-menu="me" aria-haspopup="menu"><img class="avatar" src="${WORLD.buyer.img}" alt="${esc(WORLD.images[WORLD.buyer.img] || '')}">${esc(WORLD.buyer.name)}</button>`;
  }
  function rail(cur) {
    const s = Engine.stage(cur);
    const people = WORLD.people.filter(p => Engine.visible(p, cur) && p.side !== 'seller').slice(0, 5);
    const who = txt => { const p = WORLD.people.find(x => txt.startsWith(x.name.split(' ')[0])); return p ? `<img class="avatar sm" src="${p.img}" alt="${esc(WORLD.images[p.img] || '')}">` : `<img class="avatar sm" src="assets/brand/kanah-mark.svg" alt="Kanah">`; };
    const ask = WORLD.ask.filter(a => Engine.visible(a, cur) && a.cites.every(c => Engine.visible(Engine.byId(WORLD.documents, c), cur))).slice(-2);
    return `<div class="card team-rail"><div class="card-h"><h3>Your team</h3><button type="button" class="btn text small" data-go="team">View all</button></div>
      ${people.map(p => `<div class="person"><img class="avatar" src="${p.img}" alt="${esc(WORLD.images[p.img] || '')}"><div><b>${esc(p.name)}</b><span>${esc(p.role)}${p.org ? ' · ' + esc(p.org) : ''}</span></div>
        <div class="acts"><button type="button" aria-label="Message ${esc(p.name)}" ${msgAttr(p)}>${mi('messages')}</button><button type="button" aria-label="Call ${esc(p.name)}" data-toast="Calling ${esc(p.name)}${p.phone ? ' at ' + esc(p.phone) : ''} (mock)">${mi('call')}</button></div></div>`).join('')}
      ${people.length === 0 ? '<p class="empty">Your team appears here as people join.</p>' : ''}</div>
      <div class="card"><div class="card-h"><h3>Your team is also working on</h3><button type="button" class="btn text small" data-go="timeline">Timeline</button></div>${s.updates.map(u => `<div class="person">${who(u)}<div><span style="color:var(--ink);font-size:13.5px">${esc(u)}</span></div><div></div></div>`).join('')}</div>
      ${ask.length ? `<div class="card sage"><div class="card-h"><h3>Ask Kanah</h3></div><div class="chips">${ask.map(a => `<button type="button" class="chip q" data-ask="${esc(a.q)}">${esc(a.q)}</button>`).join('')}</div></div>` : ''}`;
  }
  function demoHtml(st) {
    if (!SHOW_DEMO_BAR) return '';
    const opts = STAGES.map((s, i) => `<option value="${s.key}" ${s.key === st.cur ? 'selected' : ''}>${i + 1}. ${esc(s.label)} (${s.key})</option>`).join('');
    return `<label class="dtoggle" title="Hide the stage picker"><input type="checkbox" class="kit-switch" data-demo-toggle aria-label="Hide the stage picker"></label>
      <span>Stage</span><button type="button" data-stage="prev" title="Previous stage ([)">◀</button>
      <select data-stage-select aria-label="Stage">${opts}</select>
      <button type="button" data-stage="next" title="Next stage (])">▶</button>
      <code>STAGE = '${st.cur}'</code>`;
  }
  function placeholder(view) { return `<div class="card"><h2>${esc(view)}</h2><p class="muted">This view is not implemented in this build.</p></div>`; }
  function mainHtml(st) {
    const V = (typeof Views !== 'undefined') ? Views : {};
    const fn = V[st.view === 'homes' && st.sub ? 'homeDetail' : st.view];
    if (!fn) return placeholder(st.view);
    return fn(st.cur, st.sub, st.step);
  }
  function viewerHtml(st) {
    if (!st.doc) return '';
    const d = Engine.byId(WORLD.documents, st.doc);
    if (!d || !Engine.visible(d, st.cur)) {
      return `<div class="vwrap"><div class="vhead"><div><h2>Not available yet</h2><p class="muted">This document is not available yet at this stage. It appears when the journey reaches it.</p></div><button type="button" class="btn text" data-close>Close</button></div></div>`;
    }
    const V = (typeof Views !== 'undefined') ? Views : {};
    if (V.doc) return V.doc(st.cur, st.doc);
    return `<div class="vwrap"><div class="vhead"><div><h2>${esc(d.title)}</h2></div><button type="button" class="btn text" data-close>Close</button></div><div class="vbody">${DOC_BODIES[d.id] || ''}</div></div>`;
  }

  function compose(hash) {
    const st = parse(hash);
    if (locked() || st.forceLock) {
      const L = (typeof Lock !== 'undefined') ? Lock : null;
      return { mode: 'lock', lock: L ? L.render({ error: st.bad }) : placeholder('lock'), side: '', top: '', main: '', rail: '', onboard: '', viewer: '', demo: '' };
    }
    const stage = Engine.stage(st.cur);
    if (stage.screen === 'onboarding') {
      const O = (typeof Onboarding !== 'undefined') ? Onboarding : null;
      return { mode: 'onboarding', side: '', top: '', main: '', rail: '', onboard: O ? O.render(st.cur) : placeholder('onboarding ' + st.cur), viewer: '', demo: demoHtml(st) };
    }
    return { mode: 'workspace', side: sideHtml(st), top: topHtml(st), main: mainHtml(st), rail: '', onboard: '', viewer: viewerHtml(st), demo: demoHtml(st) };
  }

  /* ---------- DOM side ---------- */
  const $ = id => (typeof document !== 'undefined' ? document.getElementById(id) : null);
  const prefersReduced = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) || document.documentElement.classList.contains('still');
  function render() {
    const st = parse(location.hash);
    if (st.still) document.documentElement.classList.add('still');
    if (!st.doc && st.view) lastView = st.view;
    const out = compose(location.hash);
    const paint = () => {
      closePop();
      $('lock').hidden = out.mode !== 'lock'; $('lock').innerHTML = out.lock || '';
      $('app').hidden = out.mode !== 'workspace';
      $('onboard').hidden = out.mode !== 'onboarding'; $('onboard').innerHTML = out.onboard;
      $('side').innerHTML = out.side; $('top').innerHTML = out.top; $('main').innerHTML = out.main; $('rail').innerHTML = out.rail;
      $('body').classList.toggle('norail', !out.rail);
      const v = $('viewer'); const wasHidden = v.hidden;
      if (out.viewer) { v.innerHTML = out.viewer; if (wasHidden) { v.hidden = false; requestAnimationFrame(() => requestAnimationFrame(() => v.classList.add('in'))); } }
      else if (!wasHidden) { v.classList.remove('in'); setTimeout(() => { if (!v.classList.contains('in')) { v.hidden = true; v.innerHTML = ''; } }, 320); }
      $('demo').hidden = !out.demo; $('demo').innerHTML = out.demo;
      document.title = 'Kanah · ' + (out.mode === 'lock' ? 'Sign in' : Engine.stage(st.cur).label);
      afterPaint(st, out);
    };
    if (document.startViewTransition && !prefersReduced() && !navigator.webdriver) document.startViewTransition(paint); else paint();
  }
  function afterPaint(st, out) {
    const main = $('main'); main.classList.remove('enter'); void main.offsetWidth; main.classList.add('enter');
    const fp = ($('onboard').querySelector('.formpane') || $('lock').querySelector('.formpane')); if (fp) fp.classList.add('enter');
    const fill = main.querySelector('.map .fill'); if (fill) requestAnimationFrame(() => requestAnimationFrame(() => { fill.style.width = fill.dataset.w + '%'; }));
    main.querySelectorAll('.count').forEach(countUp);
    const ans = main.querySelector('.answer'); if (ans && !prefersReduced()) { ans.classList.add('pending'); setTimeout(() => ans.classList.remove('pending'), 600); }
    if (st.step) { const el = main.querySelector('.card[data-step="' + st.step + '"]'); if (el) setTimeout(() => el.scrollIntoView({ behavior: prefersReduced() ? 'auto' : 'smooth', block: 'center' }), 60); }
    else if (!st.doc && out.mode === 'workspace') window.scrollTo(0, 0);
    if (out.mode === 'lock' && !st.bad) { const u = $('lock').querySelector('#lock-user'); if (u) u.focus(); }
  }
  function countUp(el) {
    if (prefersReduced()) return;
    const target = parseFloat(el.dataset.value), prefix = el.dataset.prefix || '', decimals = (String(el.dataset.value).split('.')[1] || '').length;
    const final = el.textContent, t0 = performance.now();
    const fmt = n => prefix + n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    const tick = now => { const k = Math.min(1, (now - t0) / 600); const e = 1 - Math.pow(1 - k, 3); el.textContent = k < 1 ? fmt(target * e) : final; if (k < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }
  function flashLoader() {
    const l = $('stageload'); if (!l) return;
    l.hidden = false; l.classList.add('on'); clearTimeout(loaderTimer);
    loaderTimer = setTimeout(() => { l.classList.remove('on'); setTimeout(() => { l.hidden = true; }, 150); }, 400);
  }
  function setHash(view, stageKey, step) { location.hash = Engine.buildHash({ view, stage: stageKey, step: step || '' }); }
  function go(view) { const st = parse(location.hash); setHash(view, st.hashStage); }
  function goStep(stepId) { const st = parse(location.hash); setHash('timeline', st.hashStage, stepId); }
  function setStage(key) { const st = parse(location.hash); flashLoader(); setHash(st.doc ? 'doc/' + st.doc : viewString(st), key); }
  function advance() { const st = parse(location.hash); const n = Engine.next(st.cur); if (n) { flashLoader(); setHash('home', n); } }
  function cta() {
    const st = parse(location.hash); const s = Engine.stage(st.cur);
    const nx = s.screen === 'workspace' ? Engine.spine(st.cur).next : null;
    const opens = nx ? nx.opens : s.opens;
    const stageKey = s.advances ? (Engine.next(st.cur) || st.cur) : st.hashStage;
    if (s.advances) flashLoader();
    if (opens.startsWith('doc/')) { lastView = 'home'; }
    setHash(opens, stageKey);
    if (!s.advances && opens === st.view) toast('You’re already here. Use the stage picker to move the story on.');
  }
  function openDoc(id) { const st = parse(location.hash); lastView = viewString(st); setHash('doc/' + id, st.hashStage); }
  function closeViewer() { const st = parse(location.hash); setHash(lastView, st.hashStage); }
  function toast(text) { const t = $('toast'); if (!t) return; t.textContent = text; t.hidden = false; requestAnimationFrame(() => t.classList.add('in')); clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.classList.remove('in'); setTimeout(() => { t.hidden = true; }, 300); }, 2600); }

  /* ---------- popover menus ---------- */
  function closePop() { if (pop) { pop.remove(); pop = null; } }
  function openPop(btn) {
    closePop();
    const kind = btn.dataset.menu; const items = [];
    if (kind === 'me') { items.push(['Team', 'data-go="team"', mi('team')]); items.push(['Sign out', 'data-signout', mi('out')]); }
    else if (kind.startsWith('person:')) { const p = Engine.byId(WORLD.people, kind.slice(7)); if (!p) return; items.push(['Message', msgAttr(p), mi('messages')]); items.push(['Call', `data-toast="Calling ${esc(p.name)}${p.phone ? ' at ' + esc(p.phone) : ''} (mock)"`, mi('call')]); items.push(['Shared with them', `data-toast="${esc(p.name.split(' ')[0])} sees only what their role and side allow."`, mi('documents')]); }
    else if (kind.startsWith('doc:')) { const d = Engine.byId(WORLD.documents, kind.slice(4)); if (!d) return; items.push(['Open', `data-doc="${d.id}"`, mi('documents')]); items.push(['Ask Kanah', `data-ask="Explain “${esc(d.title)}”"`, mi('ask')]); items.push(['Download', 'data-toast="Downloads are not part of this mock."', mi('dl')]); }
    pop = document.createElement('div'); pop.className = 'kit-menu pop'; pop.setAttribute('role', 'menu');
    pop.innerHTML = `<ul>${items.map(([label, attr, icon]) => `<li role="menuitem" tabindex="0" ${attr}>${icon}<p>${label}</p></li>`).join('')}</ul>`;
    const host = kind === 'me' ? $('top') : (btn.closest('.pcard, .doc') || btn.parentElement);
    host.style.position = 'relative';
    if (kind === 'me') { pop.style.right = '36px'; pop.style.top = '56px'; }
    host.appendChild(pop);
  }

  /* ---------- lock actions ---------- */
  function attemptSignIn() {
    const L = $('lock'); const u = L.querySelector('#lock-user'), p = L.querySelector('#lock-pass'), k = L.querySelector('#lock-keep');
    if (signIn(u ? u.value : '', p ? p.value : '', !!(k && k.checked))) { L.classList.add('out'); setTimeout(() => { L.classList.remove('out'); render(); }, 320); return; }
    const msg = L.querySelector('.vmsg'); if (msg) msg.hidden = false;
    L.querySelectorAll('.kit-line').forEach(x => x.classList.add('error'));
    const fp = L.querySelector('.formpane'); if (fp) { fp.classList.remove('shake'); void fp.offsetWidth; fp.classList.add('shake'); }
    if (p) { p.value = ''; p.focus(); }
  }
  function completeTask(cbx) {
    const row = cbx.closest('.kit-task'); const dest = $('main').querySelector('[data-bucket="confirmed"]');
    setTimeout(() => {
      row.classList.add('leaving');
      setTimeout(() => { row.classList.remove('leaving'); row.classList.add('done'); cbx.disabled = true; if (dest) { const e = dest.querySelector('.empty'); if (e) e.remove(); dest.prepend(row); } toast('Done. Your team can see it.'); }, 380);
    }, 500);
  }

  function boot() {
    document.addEventListener('click', e => {
      const el = e.target.closest('[data-go],[data-doc],[data-cta],[data-advance],[data-close],[data-toast],[data-ask],[data-stage],[data-more-toggle],[data-menu],[data-signin],[data-signout],[data-step]');
      if (!el) { closePop(); return; }
      if (el.hasAttribute('data-signin')) { attemptSignIn(); return; }
      if (el.hasAttribute('data-signout')) { closePop(); signOut(); toast('Signed out.'); render(); return; }
      if (el.hasAttribute('data-menu')) { e.stopPropagation(); if (pop && pop.parentElement && pop.previousElementSibling === el) closePop(); else openPop(el); return; }
      if (el.hasAttribute('data-more-toggle')) { const panel = document.querySelector('[data-more-panel]'); if (panel) { panel.hidden = !panel.hidden; el.setAttribute('aria-expanded', panel.hidden ? 'false' : 'true'); } return; }
      if (el.hasAttribute('data-stage')) { const st = parse(location.hash); const k = el.dataset.stage === 'next' ? Engine.next(st.cur) : Engine.prev(st.cur); if (k) setStage(k); return; }
      if (el.hasAttribute('data-step')) { goStep(el.dataset.step); return; }
      if (el.hasAttribute('data-close')) { closeViewer(); return; }
      if (el.hasAttribute('data-cta')) { cta(); return; }
      if (el.hasAttribute('data-advance')) { advance(); return; }
      if (el.hasAttribute('data-doc')) { closePop(); openDoc(el.dataset.doc); return; }
      if (el.hasAttribute('data-ask')) { closePop(); pendingQuestion = el.dataset.ask; const st = parse(location.hash); if (st.view === 'ask' && !st.doc) render(); else { lastView = 'ask'; go('ask'); } return; }
      if (el.hasAttribute('data-toast')) { closePop(); toast(el.dataset.toast); return; }
      if (el.hasAttribute('data-go')) { closePop(); go(el.dataset.go); return; }
    });
    document.addEventListener('change', e => {
      const sel = e.target.closest('[data-stage-select]'); if (sel) { setStage(sel.value); return; }
      const hide = e.target.closest('[data-demo-toggle]'); if (hide) { $('demo').classList.toggle('min', hide.checked); return; }
      const tl = e.target.closest('[data-tl-done]'); if (tl) { $('main').classList.toggle('hide-done', !tl.checked); return; }
      const cbx = e.target.closest('.kit-cbx'); if (cbx && cbx.checked && !cbx.disabled) completeTask(cbx);
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Enter' && e.target.closest('#lock input')) { e.preventDefault(); attemptSignIn(); return; }
      if (e.key === 'Escape') { closePop(); if (!$('viewer').hidden) closeViewer(); return; }
      if (e.target.matches('input,select,textarea')) return;
      if (SHOW_DEMO_BAR && e.key === ']') { const k = Engine.next(parse(location.hash).cur); if (k) setStage(k); }
      if (SHOW_DEMO_BAR && e.key === '[') { const k = Engine.prev(parse(location.hash).cur); if (k) setStage(k); }
    });
    window.addEventListener('hashchange', render);
    render();
  }

  const api = { parse, compose, render, go, goStep, advance, setStage, openDoc, closeViewer, toast, boot, cta, signIn, signOut, locked, msgAttr, rail };
  Object.defineProperty(api, 'pendingQuestion', { get: () => pendingQuestion, set: v => { pendingQuestion = v; } });
  if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', boot);
  return api;
})();
