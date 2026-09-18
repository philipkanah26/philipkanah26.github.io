/* Workspace screens on the kit and the Figma surfaces. Every function returns an HTML string; Shell mounts it.
   Spec: Kanah-Buyer-Mock-Alignment-Spec.md §5.4 (Home before the offer), §6 (the workspace screen), §9 (other pages). */
const Views = (() => {
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  const CLS = ['Representation','Financing','Listing','Offer','Contract','Inspection','Insurance','Title and settlement','Closing','Ownership'];
  const ARROW = '<path d="M16.17 11 10.81 5.64l1.41-1.42L20 12l-7.78 7.78-1.41-1.42L16.17 13H4v-2z"/>';
  const CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7"/></svg>';
  const DOTS = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>';
  const STRIP_ICONS = [
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>',
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5"/></svg>',
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h16"/><path d="M7 16V9"/><path d="M12 16V5"/><path d="M17 16v-6"/></svg>'
  ];
  const person = id => id === 'alex' ? WORLD.buyer : Engine.byId(WORLD.people, id);
  const pname = id => id === 'mls' ? 'MLS' : (person(id) || {}).name || id;
  const alt = src => esc(WORLD.images[src] || '');
  const av = (p, size) => `<img class="avatar ${size || ''}" src="${p.img}" alt="${alt(p.img) || esc(p.name)}">`;
  const pill = (kind, text) => `<span class="pill ${kind}">${esc(text)}</span>`;
  const cta = (label, block) => `<button type="button" class="kit-cta${block ? ' block' : ''}" data-cta><svg viewBox="0 0 24 24" class="arr-2">${ARROW}</svg><span class="text">${esc(label)}</span><svg viewBox="0 0 24 24" class="arr-1">${ARROW}</svg></button>`;
  const at = (cur, key) => Engine.idx(cur) >= Engine.idx(key);
  const msgAttr = p => (typeof Shell !== 'undefined' && Shell.msgAttr) ? Shell.msgAttr(p) : '';
  const rail = cur => (typeof Shell !== 'undefined' && Shell.rail) ? Shell.rail(cur) : '';
  const propertyStatus = cur => at(cur, 'possession') ? pill('confirmed', 'Yours') : at(cur, 'under_contract') ? pill('confirmed', 'Under contract') : at(cur, 'offer_drafting') ? pill('you', 'Offer in progress') : pill('neutral', 'Saved');
  const shortDate = d => String(d || '').replace(/^(Sun|Mon|Tue|Wed|Thu|Fri|Sat) /, '').replace(/,? \d{1,2}:\d{2} (AM|PM)( ET)?/, '').replace(/ ET$/, '');
  const ownerPerson = owner => { if (!owner) return null; if (/^You\b/.test(owner)) return WORLD.buyer; return WORLD.people.find(p => owner.includes(p.name.split(' ')[0])) || null; };
  const menuBtn = (kind, label) => `<button type="button" class="iconbtn" aria-label="More for ${esc(label)}" data-menu="${kind}">${DOTS}</button>`;
  const cpRail = cps => Surfaces.cpRail(cps);

  /* ---------- shared partials ---------- */
  function docRow(d, cur) {
    return `<div class="doc"><span class="ico"></span><button type="button" class="open" data-doc="${d.id}"><b>${esc(d.title)}</b><span>${esc(Engine.statusAt(d, cur))}</span><span>${esc(d.meta.source)} · ${esc(d.meta.date)}</span></button>${pill('neutral', d.cls)}${menuBtn('doc:' + d.id, d.title)}</div>`;
  }
  const uploadZone = (text, foot) => `<div class="kit-upload"><div class="header"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4m0 0-4 4m4-4 4 4"/><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/></svg><p>${esc(text)}</p></div><label class="footer" data-toast="${esc(foot)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5"/></svg><p>No file selected</p><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg><input type="file" disabled></label></div>`;
  const phead = (eyebrow, title, sub, display) => `<div class="phead">${eyebrow ? `<div class="eyebrow">${esc(eyebrow)}</div>` : ''}<h1${display ? ' class="display"' : ''}>${esc(title)}</h1>${sub ? `<p class="sub">${esc(sub)}</p>` : ''}</div>`;
  const withRail = (cur, main) => `<div class="cols"><div class="stack">${main}</div><div class="rail">${rail(cur)}</div></div>`;

  /* ---------- header card and stepper (spec §6) ---------- */
  const KPI = {
    list: [['List price', '$485,000'], ['MLS', '#24-118472'], ['Synced', 'Wed Oct 15, 6:00 AM ET']],
    offer: [['Offer price', '$478,000'], ['Loan type', 'Conventional 30-yr'], ['Proposed closing', 'Thu Dec 4, 2026']],
    counter: [['Offer price', '$482,000 proposed'], ['Loan type', 'Conventional 30-yr'], ['Proposed closing', 'Fri Dec 12 proposed']],
    contract: [['Contract price', '$482,000'], ['Loan type', 'Conventional 30-yr fixed'], ['Est. closing', 'Fri Dec 12, 2026']],
    closed: [['Contract price', '$482,000'], ['Loan type', 'Conventional 30-yr fixed'], ['Closed', 'Fri Dec 12, 2026']]
  };
  const kpis = cur => at(cur, 'possession') ? KPI.closed : at(cur, 'under_contract') ? KPI.contract : cur === 'counteroffer' ? KPI.counter : at(cur, 'offer_drafting') ? KPI.offer : KPI.list;
  function stepper(wss) {
    return `<div class="stepper">${wss.map((w, i) => {
      const prev = wss[i - 1];
      const dark = i > 0 && prev.node === 'done' && (w.node === 'done' || w.node === 'current');
      const glyph = w.node === 'done' ? CHECK : w.node === 'current' ? '<i></i>' : '';
      return `${i ? `<span class="conn${dark ? ' dark' : ''}"></span>` : ''}<button type="button" class="snode ${w.node}" data-go="${w.id}" aria-label="${esc(w.label)}: ${esc(w.pill)}"><span class="sdot">${glyph}</span><b>${esc(w.label)}</b></button>`;
    }).join('')}</div>`;
  }
  function headerCard(cur, wss, withStepper) {
    const p = WORLD.property;
    return `<div class="card hcard"><div class="hrow"><img class="hthumb" src="${p.img}" alt="${alt(p.img)}"><div class="hmain"><div class="htop"><div class="haddr"><button type="button" class="addr" data-go="homes/willow">${esc(p.address)}</button><span>${esc(p.city)}</span></div><div class="hkpis">${kpis(cur).map(([l, v]) => `<div><small>${esc(l)}</small><b>${esc(v)}</b></div>`).join('')}</div></div>${withStepper ? '<hr class="soft">' + stepper(wss || Engine.workstreams(cur)) : ''}</div></div></div>`;
  }

  /* ---------- the workspace screen (spec §6): Home from the offer on, and every step page ---------- */
  function workspace(cur, wsId) {
    const wss = Engine.workstreams(cur);
    const ws = wss.find(w => w.id === wsId) || wss.find(w => w.current) || wss[0];
    const sf = Surfaces.render(cur, ws);
    const surface = `<div class="card surface" data-ws="${ws.id}">${sf.body}${sf.primary ? cta(sf.primary.label, true) : ''}</div>`;
    const strip = sf.strip ? `<div class="strip">${sf.strip.map((t, i) => `<div class="item"><span class="sico">${STRIP_ICONS[i % 3]}</span><span>${esc(t)}</span></div>`).join('')}</div>` : '';
    const withStepper = at(cur, 'offer_drafting');
    return (at(cur, 'searching') ? headerCard(cur, wss, withStepper) : '') + `<div class="phead"><h1 class="display">${esc(sf.title)}</h1><p class="sub">${esc(sf.sub)}</p></div>` + withRail(cur, surface + (sf.extra || '') + strip);
  }
  const page = id => cur => workspace(cur, id);

  /* ---------- Home before the offer (spec §5.4): the next-step card, restyled flat ---------- */
  function home(cur) {
    if (at(cur, 'offer_drafting')) return workspace(cur, null);
    const s = Engine.stage(cur), sp = Engine.spine(cur), nx = sp.next;
    const owner = nx ? ownerPerson(nx.owner) : null;
    const next = nx ? `<div class="card next"><div><div class="eyebrow">Your next step</div><h2>${esc(nx.action)}</h2><div class="who">${owner ? av(owner, 'xs') : ''}<span>${esc(nx.detail || '')}</span></div><div class="kv"><b>${esc(sp.current.label)} · ${esc(nx.label)}</b><span>${esc(nx.date || '—')}</span><b>Owner</b><span>${esc(nx.owner)}</span><b>Source</b><span>${esc(nx.source || '—')}</span></div></div><div class="waiting">${nx.bucket === 'team' ? `<span class="kit-loader"></span><span class="small muted">Waiting on ${esc(nx.owner)}</span>` : ''}${cta(nx.action)}</div></div>` : '';
    return (at(cur, 'searching') ? headerCard(cur, null, false) : '') + phead('', s.headline, s.sub, true) + withRail(cur, next);
  }

  /* ---------- People (spec §9) ---------- */
  const SIDE = { buyer:'Your side', seller:'Seller side', neutral:'Neutral', provider:'Your provider' };
  const myNow = cur => { const nx = Engine.spine(cur).next; return nx ? (nx.bucket === 'you' ? nx.action + '.' : 'Waiting on ' + nx.owner + '.') : 'Everything is confirmed.'; };
  function people(cur) {
    const vis = WORLD.people.filter(p => Engine.visible(p, cur));
    const chip = p => `<span class="sidechip${p.side === 'seller' ? ' seller' : ''}">${SIDE[p.side]}</span>`;
    const card = p => `<div class="pcard${p.limited ? ' limited' : ''}"><div class="who">${av(p, 'lg')}<div><b>${esc(p.name)}</b><span>${esc(p.role)}${p.org ? ' · ' + esc(p.org) : ''}</span></div>${p.limited ? '' : menuBtn('person:' + p.id, p.name)}</div><div class="now"><em>Now:</em> ${esc(Engine.statusAt(p, cur) || '—')}</div><div class="acts">${p.limited ? '' : `<button type="button" class="btn secondary small" ${msgAttr(p)}>Message</button>${p.phone ? `<button type="button" class="textbtn" data-toast="Calling ${esc(p.name)} at ${esc(p.phone)} (mock)">Call</button>` : ''}`}${chip(p)}</div></div>`;
    const me = `<div class="pcard"><div class="who">${av(WORLD.buyer, 'lg')}<div><b>${esc(WORLD.buyer.name)}</b><span>Buyer · you</span></div></div><div class="now"><em>Now:</em> ${esc(myNow(cur))}</div><div class="acts"><span class="sidechip">Your side</span></div></div>`;
    const grp = (title, ids, note) => { const list = vis.filter(p => ids.includes(p.id)); return list.length ? `<div class="grouph">${title}${note ? `<small>${note}</small>` : ''}</div><div class="people">${list.map(card).join('')}</div>` : ''; };
    const body = `<div class="grouph">Buyers</div><div class="people">${me}${vis.filter(p => p.id === 'sam').map(card).join('')}</div>` +
      grp('Your representation', ['maya', 'renee']) + grp('Your professionals', ['jordan', 'elena', 'marcus', 'nora']) + grp('Seller side', ['daniel'], 'Communicates through Maya. Never sees your workspace, drafts or financing.');
    return phead('', 'People', 'Everyone in your transaction, what side they are on, and what they are handling now. Joining does not give anyone access to everything.') + withRail(cur, body);
  }

  /* ---------- Documents ---------- */
  function documents(cur) {
    const vis = WORLD.documents.filter(d => Engine.visible(d, cur));
    const upload = `<div class="uploadwrap"><h3>Add a document you received elsewhere</h3>${uploadZone('Drop a file here, or browse. It stays on your side until you share it.', 'Uploads are not part of this mock.')}</div>`;
    if (!vis.length) return phead('', 'Documents', 'Documents appear here as they are shared with you.') + withRail(cur, `<div class="card"><p class="empty">Nothing shared yet.</p></div>${upload}`);
    return phead('', 'Documents', 'Each document shows its status, its source and who can see it. Nothing here is visible to the seller side unless it was deliberately sent.') +
      withRail(cur, CLS.map(c => { const list = vis.filter(d => d.cls === c); return list.length ? `<div class="docgroup"><h3>${c}</h3>${list.map(d => docRow(d, cur)).join('')}</div>` : ''; }).join('') + upload);
  }

  /* ---------- Viewer ---------- */
  function doc(cur, id) {
    const d = Engine.byId(WORLD.documents, id);
    const kv = [['Status', Engine.statusAt(d, cur)], ['Source', d.meta.source], ['Date', d.meta.date], d.meta.version ? ['Version', d.meta.version + (d.meta.hash ? ' · hash ' + d.meta.hash : '')] : null, ['Who can see this', d.audience]].filter(Boolean);
    return `<div class="vwrap" role="dialog" aria-label="${esc(d.title)}"><div class="vhead"><div><div class="eyebrow">${esc(d.cls)}</div><h2>${esc(d.title)}</h2><div class="kv">${kv.map(([k, v]) => `<b>${esc(k)}</b><span>${esc(v)}</span>`).join('')}</div></div><button type="button" class="btn text" data-close>Close ✕</button></div>
      <div class="vbody">${DOC_BODIES[d.id] || '<p class="empty">No body.</p>'}</div>
      <div class="vfoot"><label class="kit-dl"><input type="checkbox" class="input"><span class="circle"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v13m0 0-4-4m4 4 4-4"/><path d="M5 20h14"/></svg><span class="square"></span></span><span class="title">Download</span><span class="title">Open</span></label><div class="row"><button type="button" class="textbtn" data-ask="Explain “${esc(d.title)}”">Ask Kanah about this</button><button type="button" class="kit-submit" data-close>Done</button></div></div></div>`;
  }

  /* ---------- Homes ---------- */
  const PREFS = { area:'Ann Arbor west side · Lawton, Dicken, Burns Park', range:'$450,000 – $500,000', must:'3+ bedrooms, a yard, a real kitchen, under 20 minutes to campus' };
  function homes(cur) {
    if (!at(cur, 'searching')) {
      return phead('', 'Add your search preferences', 'Tell Maya what would feel like home. These stay private to you and Maya; sellers never see your range.') +
        withRail(cur, `<div class="card"><div class="prefs"><div class="kit-field"><input type="text" id="pref-area" value="${esc(PREFS.area)}" required><span>Area</span></div><div class="kit-field"><input type="text" id="pref-range" value="${esc(PREFS.range)}" required><span>Price range</span></div><div class="kit-field"><input type="text" id="pref-must" value="${esc(PREFS.must)}" required><span>Must-haves</span></div><div><button type="button" class="kit-submit" data-toast="Preferences saved. Maya can see them; sellers cannot.">Save preferences</button></div></div></div>`);
    }
    const vis = WORLD.homes.filter(h => Engine.visible(h, cur));
    return phead('', 'Your homes, together.', 'Save a home or review one Maya shared. Listing data comes from the MLS and may change.') +
      withRail(cur, `<div class="card flat"><div class="card-h"><h3>Your search preferences</h3><span class="small muted">Private to you and Maya</span></div><div class="kv"><b>Area</b><span>${esc(PREFS.area)}</span><b>Price range</b><span>${esc(PREFS.range)}</span><b>Must-haves</b><span>${esc(PREFS.must)}</span></div></div>
      <div class="homes">${vis.map(h => { const off = h.unavailableFrom && at(cur, h.unavailableFrom); return `<button type="button" class="home-card${off ? ' off' : ''}" data-go="homes/${h.id}"><img src="${h.img}" alt="${alt(h.img)}"><div class="hb"><span class="price">$${h.price.toLocaleString()}</span><b>${esc(h.address)}</b><span class="small muted">${h.beds} bd · ${h.baths} ba · ${h.sqft.toLocaleString()} sq ft · ${h.built}</span><div style="margin-top:6px">${pill(off ? 'attention' : h.id === 'willow' ? 'confirmed' : 'neutral', Engine.statusAt(h, cur))}</div></div></button>`; }).join('')}</div>
      <div class="uploadwrap"><h3>Add a home</h3>${uploadZone('Drop a listing sheet here, or add an address. MLS lookup where licensed; otherwise a reviewed manual entry.', 'Adding a home is not part of this mock.')}</div>`);
  }
  function homeDetail(cur, id) {
    const h = Engine.byId(WORLD.homes, id) || WORLD.homes[0];
    const off = h.unavailableFrom && at(cur, h.unavailableFrom);
    const imgs = h.imgs || [h.img];
    const gallery = imgs.length > 1 ? `<div class="gallery"><img src="${imgs[0]}" alt="${alt(imgs[0])}"><div class="stack">${imgs.slice(1, 3).map(i => `<img src="${i}" alt="${alt(i)}">`).join('')}</div></div>` : `<div class="gallery" style="grid-template-columns:1fr"><img src="${h.img}" alt="${alt(h.img)}" style="max-height:340px"></div>`;
    const listingDocs = h.id === 'willow' ? WORLD.documents.filter(d => d.cls === 'Listing' && Engine.visible(d, cur)) : [];
    const nx = Engine.spine(cur).next;
    let action = '';
    if (off) action = `<div class="warn">This home’s availability changed. Maya confirmed the source; your search and financing history are unaffected.</div>`;
    else if (h.id !== 'willow') action = `<div class="row"><button type="button" class="btn secondary" data-toast="Tour request sent to Maya (mock). She confirms availability and any next steps.">Ask about a tour</button><button type="button" class="btn text" data-go="messages/maya">Talk to Maya</button></div>`;
    else if (cur === 'searching' || cur === 'toured') action = `<div class="row">${cta(nx.action)}<button type="button" class="btn text" data-go="messages/maya">${cur === 'searching' ? 'Talk about an offer' : 'Ask Maya a question'}</button></div>`;
    else if (cur === 'tour_confirmed') action = `<div class="card next"><div class="row"><div><b>Tour confirmed</b> · Fri Oct 17, 10:30 AM ET · you’ll meet Maya at the front door.</div>${cta(nx.action)}<button type="button" class="btn text" data-toast="Reschedule or cancel goes to Maya (mock).">Reschedule</button></div></div>`;
    else if (at(cur, 'offer_drafting')) action = `<div class="row"><button type="button" class="btn secondary" data-go="${at(cur, 'under_contract') ? 'home' : 'offer'}">${at(cur, 'under_contract') ? 'Open your Closing Room' : 'Open your offer'}</button></div>`;
    const body = `<button type="button" class="btn text" data-go="homes">← Homes</button>
      <div class="phead" style="margin:8px 0 12px"><div class="row"><h1>${esc(h.address)}</h1>${h.id === 'willow' ? propertyStatus(cur) : off ? pill('attention', 'Availability changed') : pill('neutral', 'Saved')}</div></div>
      ${gallery}
      <div class="facts"><span class="serif" style="font-size:24px;color:var(--ink)">$${h.price.toLocaleString()}</span><span>${h.beds} bd</span><span>${h.baths} ba</span><span>${h.sqft.toLocaleString()} sq ft</span><span>Built ${h.built}</span><span>${esc(h.lot)}</span><span class="small">${esc(h.source)} · synced ${esc(h.synced)} · listing data may change</span></div>
      ${h.id === 'willow' ? `<p>${esc(WORLD.property.blurb)}</p>` : ''}
      ${action}
      ${listingDocs.length ? `<h3 style="margin:22px 0 8px">Approved listing documents</h3>${listingDocs.map(d => docRow(d, cur)).join('')}` : ''}
      <div class="card" style="margin-top:18px"><div class="row">${av(Engine.byId(WORLD.people, 'maya'), 'sm')}<b>Maya’s notes</b></div><p class="muted small" style="margin:6px 0 0">${h.id === 'willow' ? 'Two other buyers toured this week. The 2009 roof is the thing to inspect; the kitchen remodel was permitted.' : 'Maya has not added notes on this home yet.'}</p></div>`;
    return withRail(cur, body);
  }

  /* ---------- Messages ---------- */
  function messages(cur, threadId) {
    const threads = WORLD.threads.filter(t => Engine.visible(t, cur));
    const sel = threads.find(t => t.id === threadId) || threads[threads.length - 1];
    const msgs = WORLD.messages.filter(m => m.thread === sel.id && Engine.idx(m.stage) <= Engine.idx(cur));
    const list = threads.map(t => { const last = WORLD.messages.filter(m => m.thread === t.id && Engine.idx(m.stage) <= Engine.idx(cur)).slice(-1)[0]; return `<button type="button" class="thread" aria-current="${t.id === sel.id}" data-go="messages/${t.id}"><b>${esc(t.title)}</b><span>${last ? esc(last.text.slice(0, 60)) + '…' : 'No messages yet'}</span></button>`; }).join('');
    const body = msgs.length ? msgs.map(m => { const p = person(m.from); const me = m.from === 'alex'; return `<div class="msg${me ? ' me' : ''}">${me ? '' : av(p, 'sm')}<div><div class="who">${esc(p.name)} · ${esc(m.at)}</div><div class="bubble">${esc(m.text)}${m.doc ? `<br><button type="button" class="att" data-doc="${m.doc}">📎 ${esc(Engine.byId(WORLD.documents, m.doc).title)}</button>` : ''}</div></div></div>`; }).join('') : '<p class="empty">Created empty. Nothing from your private threads is copied in.</p>';
    return phead('', 'Messages', 'Three separate conversations. Each shows who can read it. Your private thread with Maya never reaches the seller side.') +
      withRail(cur, `<div class="threads"><div>${list}</div><div class="card convo"><div class="card-h"><h3>${esc(sel.title)}</h3></div><p class="small muted" style="margin-top:-6px">${esc(sel.scope)} · ${sel.members.map(pname).join(', ')}</p><div class="msgs">${body}</div>
      <div class="composer"><div class="kit-field"><input type="text" id="msg-${sel.id}" required aria-label="Message"><span>Message ${esc(sel.title.split(' ·')[0])}</span></div><button type="button" class="kit-submit small" data-toast="Sending is not part of this mock.">Send</button></div></div></div>`);
  }

  return { _: { esc, pill, cta, cpRail, docRow, person, pname, CLS, at, propertyStatus, shortDate, headerCard, stepper }, workspace, home, offer: page('offer'), financing: page('financing'), inspection: page('inspection'), appraisal: page('appraisal'), insurance: page('insurance'), closing: page('closing'), people, documents, doc, homes, homeDetail, messages };
})();
