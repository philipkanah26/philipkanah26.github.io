/* Chrome, router, lock, sheet, motion hooks and events. Pure composition in compose(); DOM only in render()/boot().
   Spec: Kanah-Buyer-Mock-Alignment-Spec.md §5 (shell and routes) and §8 (the rail). */
const Shell = (() => {
  const VIEWS = ['home', 'messages', 'homes', 'people', 'documents', 'offer', 'financing', 'inspection', 'appraisal', 'insurance', 'closing'];
  let lastView = 'documents';
  let pendingQuestion = null;
  let sheet = null;
  let unlockedFlag = false;
  let loaderTimer = null, toastTimer = null, pop = null;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));

  const ICONS = {
    home:'<path d="M3 11l9-8 9 8v9a2 2 0 0 1-2 2h-4v-6H9v6H5a2 2 0 0 1-2-2z"/>',
    messages:'<path d="M4 5h16v11H8l-4 4z"/>',
    documents:'<path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5"/>',
    people:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 15.5a5 5 0 0 1 5.5 4.5"/>',
    homes:'<path d="M3 21h18"/><path d="M5 21V8l7-5 7 5v13"/><path d="M10 21v-6h4v6"/>',
    offer:'<path d="M5 12.5l4.5 4.5L19 7"/>',
    financing:'<path d="M3 10l9-6 9 6"/><path d="M5 10v9"/><path d="M9 10v9"/><path d="M15 10v9"/><path d="M19 10v9"/><path d="M3 19h18"/>',
    inspection:'<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/><path d="M8.5 11h5"/>',
    appraisal:'<path d="M4 20h16"/><path d="M7 16V9"/><path d="M12 16V5"/><path d="M17 16v-6"/>',
    insurance:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    closing:'<path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5"/><path d="M9 14h6"/><path d="M9 17h6"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
    logout:'<path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5"/><path d="M15 16l4-4-4-4"/><path d="M9 12h10"/>',
    bell:'<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    sparkle:'<path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/><path d="M19 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>',
    send:'<path d="M4 12l16-8-6 16-2-6z"/><path d="M12 14l8-10"/>',
    ask:'<path d="M21 12a8 8 0 0 1-11.6 7.2L3 21l1.8-5.4A8 8 0 1 1 21 12z"/><path d="M9.5 10a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.5"/><path d="M12 17h.01"/>',
    call:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
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

  /* ---------- routing (spec §5.3) ---------- */
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
    return { cur, view, sub, doc, hashStage, forceLock: p.lock === '1', bad: p.bad === '1', still: p.still === '1' };
  }
  function viewString(st) { return st.sub ? (st.view === 'homes' ? 'homes/' : 'messages/') + st.sub : st.view; }
  function msgAttr(p) {
    if (['maya', 'sam'].includes(p.id)) return 'data-go="messages/maya"';
    if (p.id === 'jordan') return 'data-go="messages/jordan"';
    if (['renee', 'elena'].includes(p.id)) return 'data-go="messages/closing"';
    return `data-toast="${esc(p.name.split(' ')[0])} is reached through Maya. Ask in your private thread."`;
  }

  /* ---------- the sidebar as drawn (spec §5.1) ---------- */
  function sideHtml(st) {
    const cur = st.cur, idx = Engine.idx;
    const item = (v, label, extra) => `<button type="button" data-go="${v}" ${st.view === v ? 'aria-current="page"' : ''}>${ico(v)}<span class="lbl">${label}</span>${extra || ''}</button>`;
    const showHomes = idx(cur) >= idx('searching') && idx(cur) < idx('under_contract');
    const showTx = idx(cur) >= idx('offer_drafting');
    const tx = showTx ? `<button type="button" class="grp more" data-more-toggle aria-expanded="true">More</button><div class="grp"><span>Transaction</span></div><div class="sub" data-more-panel>${Engine.workstreams(cur).map(w => item(w.id, w.label, `<span class="pill ${w.status}">${esc(w.pill)}</span>`)).join('')}</div>` : '';
    return `<button type="button" class="mark" data-go="home"><img src="assets/brand/kanah-mark.svg" alt="Kanah"><span>Kanah<i>.</i></span></button><div class="tag">A clearer way home.</div>
      <nav class="nav" aria-label="Main">
        ${item('home', 'Home')}${item('messages', 'Messages')}${item('documents', 'Documents')}${item('people', 'People')}${showHomes ? item('homes', 'Homes') : ''}
        ${tx}
      </nav>
      <div class="foot">
        <div class="me"><img class="avatar" src="${WORLD.buyer.img}" alt="${esc(WORLD.images[WORLD.buyer.img] || '')}"><b>${esc(WORLD.buyer.name)}</b><button type="button" class="bell" aria-label="Notifications" data-toast="Notifications open here. Nothing sensitive is ever in one.">${mi('bell')}</button></div>
        <button type="button" class="fitem" data-toast="Settings are not part of this mock.">${ico('settings')}<span class="lbl">Settings</span></button>
        <div class="frow"><button type="button" class="fitem" data-signout>${ico('logout')}<span class="lbl">Logout</span></button><button type="button" class="theme" role="switch" aria-checked="false" aria-label="Dark theme" data-toast="Dark theme is not part of this mock.">${mi('sun')}<i></i></button></div>
      </div>`;
  }
  function topHtml() { return ''; }

  /* ---------- the rail (spec §8): Ask Kanah and the Transaction Room ---------- */
  const TINTS = ['#D9E2D8', '#DDE6EA', '#E6E7DE', '#E7DDD7'];
  const initials = n => n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const visibleAsk = cur => WORLD.ask.filter(a => Engine.visible(a, cur) && (a.cites || []).every(c => Engine.visible(Engine.byId(WORLD.documents, c), cur)));
  function askEntries(cur) {
    return visibleAsk(cur).map((a, i) => ({ a, i })).sort((x, y) => (Engine.idx(x.a.from) - Engine.idx(y.a.from)) || (x.i - y.i)).map(x => x.a).slice(-3);
  }
  function chipAttr(a) {
    if (!a.act) return `data-ask="${esc(a.q)}"`;
    const kind = a.act.split('/')[0], arg = a.act.slice(a.act.indexOf('/') + 1);
    return kind === 'doc' ? `data-doc="${esc(arg)}"` : kind === 'go' ? `data-go="${esc(arg)}"` : kind === 'sheet' ? `data-sheet="${esc(arg)}"` : `data-toast="${esc(arg)}"`;
  }
  function answerHtml(cur, q) {
    if (!q) return '';
    const avail = visibleAsk(cur).filter(a => a.a);
    const hit = avail.find(a => a.q === q) || avail.find(a => q.toLowerCase().includes(a.q.toLowerCase().slice(0, 18))) || (q.startsWith('Explain “') ? { a: 'Here is what I can tell you from the document itself. Open it to read the full text; I explain, and your team confirms anything consequential.', cites: WORLD.documents.filter(d => q.includes(d.title) && Engine.visible(d, cur)).map(d => d.id) } : null);
    const text = hit ? hit.a : 'I can explain documents you can see and summarize your own conversations. For dates, decisions, amounts or anything that changes your contract, Maya or the responsible professional confirms — I’ve routed this to Maya.';
    const cites = hit ? hit.cites : [];
    return `<div class="answer"><div class="msg me"><div><div class="bubble">${esc(q)}</div></div></div><div class="typing"><span class="kit-loader"></span>Reading what you can see…</div><div class="msg reply"><div><div class="who">Ask Kanah</div><div class="bubble">${esc(text)}${cites.length ? '<br>' + cites.map(c => `<button type="button" class="cite" data-doc="${c}">📄 ${esc(Engine.byId(WORLD.documents, c).title)}</button>`).join('') : ''}${!hit ? '<br><button type="button" class="cite" data-go="messages/maya">Ask Maya</button>' : ''}</div></div></div></div>`;
  }
  function rail(cur) {
    const chips = askEntries(cur).map(a => `<button type="button" class="chip q" ${chipAttr(a)}>${esc(a.q)}</button>`).join('');
    const members = WORLD.people.filter(p => Engine.visible(p, cur) && p.side !== 'seller');
    const row = (p, i) => `<div class="member"><span class="ini" style="background:${TINTS[i % 4]}">${initials(p.name)}<i class="online" aria-hidden="true"></i></span><div><b>${esc(p.name)}</b><span>${esc(p.role)}</span></div><button type="button" class="msgico" aria-label="Message ${esc(p.name)}" ${msgAttr(p)}>${mi('messages')}</button></div>`;
    return `<div class="card rail-ask"><div class="rail-h"><span class="rico">${mi('sparkle')}</span><h3>Ask Kanah</h3><button type="button" class="dots" data-menu="ask" aria-label="Ask Kanah options">•••</button></div><div class="chips">${chips}</div>${answerHtml(cur, pendingQuestion)}<div class="composer-ask"><input type="text" id="ask-q" placeholder="Ask a question or make a request…" aria-label="Ask Kanah" data-ask-input><button type="button" class="send" aria-label="Send" data-toast="Typed questions are not part of this mock; use the suggestions.">${mi('send')}</button></div></div>
      <div class="card rail-room"><div class="rail-h"><span class="rico">${mi('people')}</span><h3>Transaction Room</h3><span class="count">${members.length} member${members.length === 1 ? '' : 's'}</span></div><div class="members">${members.map(row).join('')}${members.length ? '' : '<p class="empty">Your team appears here as people join.</p>'}</div></div>`;
  }

  /* ---------- the inspector sheet (spec §7.2) ---------- */
  function sheetHtml(cur, kind) {
    if (kind !== 'inspectors') return '';
    const star = '<svg class="star" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L12 16.9l-5.3 2.8 1.1-5.9L3.5 9.7l5.9-.8z"/></svg>';
    const av = i => i.img ? `<img class="avatar md" src="${i.img}" alt="${esc(WORLD.images[i.img] || i.name)}">` : `<span class="avatar md ini" aria-hidden="true">${esc(i.initials)}</span>`;
    const row = i => `<div class="irow"><div class="who">${av(i)}<div><b>${esc(i.name)}${i.recommended ? ' <span class="pill confirmed">Recommended</span>' : ''}</b><span>${esc(i.org)}</span><span class="rating">${star}<b>${esc(i.rating)}</b> (${i.reviews} reviews)</span></div></div><div class="price"><small>Price</small><b>${esc(i.price)}</b></div><button type="button" class="kit-submit small" data-choose="${i.id}">Choose</button></div>`;
    return `<div class="vwrap sheet" role="dialog" aria-label="Inspectors near Willow Ridge"><div class="vhead"><div><div class="eyebrow">Inspection</div><h2>Inspectors near Willow Ridge</h2></div><button type="button" class="btn text" data-close>Close ✕</button></div>
      <div class="vbody"><div class="ilist">${WORLD.inspectors.map(row).join('')}<button type="button" class="irow invite" data-toast="Inviting your own inspector is not part of this mock.">${mi('people')}<b>Invite your own inspector</b></button></div><p class="small muted">Ratings as published by Google. Whichever inspector you choose, this mock continues with Marcus Bell on Tue Oct 28 at 9:00 AM.</p></div></div>`;
  }
  function openSheet(kind) { sheet = kind; if (typeof document !== 'undefined') render(); }
  function closeSheet() { sheet = null; if (typeof document !== 'undefined') render(); }

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
    return fn(st.cur, st.sub);
  }
  function viewerHtml(st) {
    if (!st.doc) return sheet ? sheetHtml(st.cur, sheet) : '';
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
      $('side').innerHTML = out.side; $('main').innerHTML = out.main; $('rail').innerHTML = out.rail;
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
    const ans = main.querySelector('.answer'); if (ans && !prefersReduced()) { ans.classList.add('pending'); setTimeout(() => ans.classList.remove('pending'), 600); }
    if (!st.doc && out.mode === 'workspace' && !sheet) window.scrollTo(0, 0);
    if (out.mode === 'lock' && !st.bad) { const u = $('lock').querySelector('#lock-user'); if (u) u.focus(); }
  }
  function flashLoader() {
    const l = $('stageload'); if (!l) return;
    l.hidden = false; l.classList.add('on'); clearTimeout(loaderTimer);
    loaderTimer = setTimeout(() => { l.classList.remove('on'); setTimeout(() => { l.hidden = true; }, 150); }, 400);
  }
  function setHash(view, stageKey) { location.hash = Engine.buildHash({ view, stage: stageKey }); }
  function go(view) { const st = parse(location.hash); pendingQuestion = null; sheet = null; setHash(view, st.hashStage); }
  function setStage(key) { const st = parse(location.hash); pendingQuestion = null; sheet = null; flashLoader(); setHash(st.doc ? 'doc/' + st.doc : viewString(st), key); }
  function advance() { const st = parse(location.hash); const n = Engine.next(st.cur); if (n) { flashLoader(); setHash('home', n); } }
  function cta() {
    const st = parse(location.hash); const s = Engine.stage(st.cur);
    const nx = s.screen === 'workspace' ? Engine.spine(st.cur).next : null;
    const inline = s.screen === 'workspace' && Engine.idx(st.cur) >= Engine.idx('offer_drafting');
    const opens = nx ? (inline ? 'home' : nx.opens) : s.opens;
    const stageKey = s.advances ? (Engine.next(st.cur) || st.cur) : st.hashStage;
    pendingQuestion = null; sheet = null;
    if (s.advances) flashLoader();
    if (opens.startsWith('doc/')) { lastView = 'home'; }
    setHash(opens, stageKey);
    if (!s.advances && opens === st.view) toast('You’re already here. Use the stage picker to move the story on.');
  }
  function openDoc(id) { const st = parse(location.hash); lastView = viewString(st); sheet = null; setHash('doc/' + id, st.hashStage); }
  function closeViewer() { const st = parse(location.hash); setHash(lastView, st.hashStage); }
  function toast(text) { const t = $('toast'); if (!t) return; t.textContent = text; t.hidden = false; requestAnimationFrame(() => t.classList.add('in')); clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.classList.remove('in'); setTimeout(() => { t.hidden = true; }, 300); }, 2600); }
  function chooseInspector(id) {
    const i = Engine.byId(WORLD.inspectors, id); if (!i) return;
    WORLD.inspectorChoice = id; sheet = null; render();
    toast(i.name + ' chosen. This mock continues with Marcus Bell on Tue Oct 28 at 9:00 AM.');
  }
  function pick(el) {
    const group = el.parentElement; if (!group) return;
    group.querySelectorAll('[data-pick]').forEach(b => { b.classList.remove('on'); b.setAttribute('aria-pressed', 'false'); });
    el.classList.add('on'); el.setAttribute('aria-pressed', 'true');
    const main = $('main'); const note = main && main.querySelector('[data-slot-note]');
    if (!note) return;
    const on = sel => { const b = main.querySelector(sel + ' [data-pick].on'); return b ? b.dataset.i : null; };
    const dDay = String(WORLD.slots.days.findIndex(d => d.selected)), dTime = String(WORLD.slots.times.findIndex(t => t.selected));
    note.hidden = on('.s-days') === dDay && on('.s-times') === dTime;
  }

  /* ---------- popover menus ---------- */
  function closePop() { if (pop) { pop.remove(); pop = null; } }
  function openPop(btn) {
    closePop();
    const kind = btn.dataset.menu; const items = [];
    if (kind === 'ask') { items.push(['Open a document', 'data-go="documents"', mi('documents')]); items.push(['Ask Maya instead', 'data-go="messages/maya"', mi('messages')]); }
    else if (kind.startsWith('person:')) { const p = Engine.byId(WORLD.people, kind.slice(7)); if (!p) return; items.push(['Message', msgAttr(p), mi('messages')]); items.push(['Call', `data-toast="Calling ${esc(p.name)}${p.phone ? ' at ' + esc(p.phone) : ''} (mock)"`, mi('call')]); items.push(['Shared with them', `data-toast="${esc(p.name.split(' ')[0])} sees only what their role and side allow."`, mi('documents')]); }
    else if (kind.startsWith('doc:')) { const d = Engine.byId(WORLD.documents, kind.slice(4)); if (!d) return; items.push(['Open', `data-doc="${d.id}"`, mi('documents')]); items.push(['Ask Kanah', `data-ask="Explain “${esc(d.title)}”"`, mi('ask')]); items.push(['Download', 'data-toast="Downloads are not part of this mock."', mi('dl')]); }
    pop = document.createElement('div'); pop.className = 'kit-menu pop'; pop.setAttribute('role', 'menu');
    pop.innerHTML = `<ul>${items.map(([label, attr, icon]) => `<li role="menuitem" tabindex="0" ${attr}>${icon}<p>${label}</p></li>`).join('')}</ul>`;
    const host = kind === 'ask' ? btn.closest('.rail-ask') : (btn.closest('.pcard, .doc') || btn.parentElement);
    host.style.position = 'relative';
    host.appendChild(pop);
  }

  /* ---------- lock actions ---------- */
  function attemptSignIn() {
    const L = $('lock'); const u = L.querySelector('#lock-user'), p = L.querySelector('#lock-pass'), k = L.querySelector('#lock-keep');
    if (signIn(u ? u.value : '', p ? p.value : '', !!(k && k.checked))) { L.classList.add('out'); setTimeout(() => { L.classList.remove('out'); render(); }, 320); return; }
    const msg = L.querySelector('.vmsg'); if (msg) msg.hidden = false;
    L.querySelectorAll('.kit-line, .kit-field').forEach(x => x.classList.add('error'));
    const fp = L.querySelector('.formpane'); if (fp) { fp.classList.remove('shake'); void fp.offsetWidth; fp.classList.add('shake'); }
    if (p) { p.value = ''; p.focus(); }
  }

  function boot() {
    document.addEventListener('click', e => {
      const el = e.target.closest('[data-go],[data-doc],[data-cta],[data-advance],[data-close],[data-toast],[data-ask],[data-stage],[data-more-toggle],[data-menu],[data-signin],[data-signout],[data-sheet],[data-choose],[data-pick]');
      if (!el) { closePop(); return; }
      if (el.hasAttribute('data-signin')) { attemptSignIn(); return; }
      if (el.hasAttribute('data-signout')) { closePop(); signOut(); toast('Signed out.'); render(); return; }
      if (el.hasAttribute('data-menu')) { e.stopPropagation(); if (pop && pop.parentElement && pop.previousElementSibling === el) closePop(); else openPop(el); return; }
      if (el.hasAttribute('data-more-toggle')) { const panel = document.querySelector('[data-more-panel]'); if (panel) { panel.classList.toggle('open'); el.setAttribute('aria-expanded', panel.classList.contains('open') ? 'true' : 'false'); } return; }
      if (el.hasAttribute('data-stage')) { const st = parse(location.hash); const k = el.dataset.stage === 'next' ? Engine.next(st.cur) : Engine.prev(st.cur); if (k) setStage(k); return; }
      if (el.hasAttribute('data-sheet')) { closePop(); openSheet(el.dataset.sheet); return; }
      if (el.hasAttribute('data-choose')) { chooseInspector(el.dataset.choose); return; }
      if (el.hasAttribute('data-pick')) { pick(el); return; }
      if (el.hasAttribute('data-close')) { if (sheet) closeSheet(); else closeViewer(); return; }
      if (el.hasAttribute('data-cta')) { cta(); return; }
      if (el.hasAttribute('data-advance')) { advance(); return; }
      if (el.hasAttribute('data-doc')) { closePop(); openDoc(el.dataset.doc); return; }
      if (el.hasAttribute('data-ask')) { closePop(); pendingQuestion = el.dataset.ask; if (sheet) sheet = null; const st = parse(location.hash); if (st.doc) closeViewer(); else render(); return; }
      if (el.hasAttribute('data-toast')) { closePop(); toast(el.dataset.toast); return; }
      if (el.hasAttribute('data-go')) { closePop(); go(el.dataset.go); return; }
    });
    document.addEventListener('change', e => {
      const sel = e.target.closest('[data-stage-select]'); if (sel) { setStage(sel.value); return; }
      const hide = e.target.closest('[data-demo-toggle]'); if (hide) { $('demo').classList.toggle('min', hide.checked); return; }
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Enter' && e.target.closest('#lock input')) { e.preventDefault(); attemptSignIn(); return; }
      if (e.key === 'Enter' && e.target.closest('[data-ask-input]')) { e.preventDefault(); toast('Typed questions are not part of this mock; use the suggestions.'); return; }
      if (e.key === 'Escape') { closePop(); if (sheet) { closeSheet(); return; } if (!$('viewer').hidden) closeViewer(); return; }
      if (e.target.matches('input,select,textarea')) return;
      if (SHOW_DEMO_BAR && e.key === ']') { const k = Engine.next(parse(location.hash).cur); if (k) setStage(k); }
      if (SHOW_DEMO_BAR && e.key === '[') { const k = Engine.prev(parse(location.hash).cur); if (k) setStage(k); }
    });
    window.addEventListener('hashchange', render);
    render();
  }

  const api = { parse, compose, render, go, advance, setStage, openDoc, closeViewer, toast, boot, cta, signIn, signOut, locked, msgAttr, rail, sheetHtml, openSheet, closeSheet };
  Object.defineProperty(api, 'pendingQuestion', { get: () => pendingQuestion, set: v => { pendingQuestion = v; } });
  if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', boot);
  return api;
})();
