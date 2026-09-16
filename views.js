/* Workspace screens on the kit. Every function returns an HTML string; Shell mounts it. */
const Views = (() => {
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  const CLS = ['Representation','Financing','Listing','Offer','Contract','Inspection','Insurance','Title and settlement','Closing','Ownership'];
  const BUCKETS = [['you','Waiting on you'],['attention','Needs attention'],['team','Waiting on your team'],['confirmed','Confirmed']];
  const LABEL = { confirmed:'Confirmed', you:'Waiting on you', team:'Waiting on your team', attention:'Needs attention', todo:'Not started' };
  const ARROW = '<path d="M16.17 11 10.81 5.64l1.41-1.42L20 12l-7.78 7.78-1.41-1.42L16.17 13H4v-2z"/>';
  const CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7"/></svg>';
  const DOTS = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>';
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

  /* ---------- shared partials ---------- */
  function line(sp, opts) {
    const o = opts || {};
    let lastDone = -1; sp.steps.forEach((s, i) => { if (s.status === 'confirmed') lastDone = i; });
    const fillPct = lastDone < 0 ? 0 : (lastDone / (sp.steps.length - 1)) * 100;
    const phases = sp.phases.map(p => `<div class="ph ${p.now ? 'now' : ''}" style="grid-column:span ${p.steps.length}">${esc(p.label)}<b>${p.done} of ${p.total}${p.open ? ' · ' + p.open + ' open' : ''}</b></div>`).join('');
    const nodes = sp.steps.map(s => {
      const nx = s.checkpoints.find(c => c.bucket === s.status) || s.checkpoints[s.checkpoints.length - 1];
      const date = s.status === 'confirmed' ? (s.checkpoints[s.checkpoints.length - 1].date || '') : (nx.date || '');
      const glyph = s.status === 'confirmed' ? CHECK : s.status === 'you' ? '<span class="pip"></span>' : s.status === 'attention' ? '!' : '';
      const tip = `${s.label}: ${LABEL[s.status]}${nx.owner && s.status !== 'confirmed' ? '. ' + nx.owner : ''}${date ? '. ' + date : ''}${s.gate && s.control ? '. ' + s.control : ''}`;
      return `<button type="button" class="node ${s.status}" data-step="${s.id}" data-tip="${esc(tip)}"><span class="dot">${glyph}</span><b>${esc(s.label)}</b><small>${esc(shortDate(date))}</small></button>`;
    }).join('');
    const legend = o.legend ? `<div class="legend"><span><i class="confirmed"></i>Done</span><span><i class="you"></i>Needs you</span><span><i class="team"></i>Your team has it</span><span><i class="attention"></i>Needs attention</span><span><i class="todo"></i>Ahead</span></div>` : '';
    const segs = sp.phases.map(p => `<div class="${p.now ? 'now' : ''}"><i style="width:${p.total ? Math.round(100 * p.done / p.total) : 0}%"></i></div>`).join('');
    const lbls = sp.phases.map(p => p.now ? `<b>${esc(p.label)}<br>${p.done} of ${p.total}${p.open ? ' · ' + p.open + ' open' : ''}</b>` : `<span>${esc(p.label)}<br>${p.done} of ${p.total}</span>`).join('');
    return `<div class="map"><div class="phases">${phases}</div><div class="line"><div class="track"><div class="fill" data-w="${fillPct.toFixed(1)}" style="width:0%;--fill:${fillPct.toFixed(1)}%"></div></div><div class="nodes">${nodes}</div></div>${legend}</div>
      <div class="folded-only"><div class="segs">${segs}</div><div class="seglbl">${lbls}</div><p class="small" style="margin-top:8px"><button type="button" class="btn text small" data-go="timeline">See every step</button></p></div>`;
  }
  const cpLine = c => c.date ? shortDate(c.date) : (c.bucket === 'todo' ? '' : String(c.text).split(' · ')[0]);
  function cpRail(cps) { return `<div class="checkpoints">${cps.map(c => `<div class="cp ${c.bucket}"><i></i><b>${esc(c.label)}</b><span>${esc(cpLine(c))}</span></div>`).join('')}</div>`; }
  function taskRow(t, cur) {
    const b = Engine.statusAt({ status: t.bucket }, cur);
    const done = b === 'confirmed';
    const open = t.opens.startsWith('doc/') ? `data-doc="${t.opens.slice(4)}"` : `data-go="${t.opens}"`;
    return `<div class="kit-task${done ? ' done' : ''}" data-task="${t.id}"><input type="checkbox" class="kit-cbx" id="t-${t.id}"${done ? ' checked disabled' : b === 'you' ? '' : ' disabled'}><label class="kit-check" for="t-${t.id}" aria-label="Mark ${esc(t.title)} done"><svg viewBox="0 0 18 18" aria-hidden="true"><path d="M1,9 L1,3.5 C1,2 2,1 3.5,1 L14.5,1 C16,1 17,2 17,3.5 L17,14.5 C17,16 16,17 14.5,17 L3.5,17 C2,17 1,16 1,14.5 L1,9 Z"></path><polyline points="1 9 7 14 15 4"></polyline></svg></label><button type="button" class="body" ${open}><b>${esc(t.title)}</b><small>${esc(t.detail)}</small><small>${esc(t.owner)} · ${esc(t.due)}</small></button></div>`;
  }
  function docRow(d, cur) {
    return `<div class="doc"><span class="ico"></span><button type="button" class="open" data-doc="${d.id}"><b>${esc(d.title)}</b><span>${esc(Engine.statusAt(d, cur))}</span><span>${esc(d.meta.source)} · ${esc(d.meta.date)}</span></button>${pill('neutral', d.cls)}${menuBtn('doc:' + d.id, d.title)}</div>`;
  }
  const uploadZone = (text, foot) => `<div class="kit-upload"><div class="header"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4m0 0-4 4m4-4 4 4"/><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/></svg><p>${esc(text)}</p></div><label class="footer" data-toast="${esc(foot)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5"/></svg><p>No file selected</p><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg><input type="file" disabled></label></div>`;
  const MOMENTS = {
    under_contract: { img:'assets/homes/willow-ridge-living.jpg', eyebrow:'Executed Wed Oct 22', title:'You’re under contract on Willow Ridge.', text:'Maya confirmed the effective date. Seven gates stand between here and keys; the first is your $5,000 deposit, due Sat Oct 25 to Great Lakes Title.' },
    clear_to_close: { img:'assets/homes/willow-ridge-kitchen.jpg', eyebrow:'Clear to close · Thu Dec 4', title:'Your lender confirmed every condition.', text:'Closing is scheduled for Fri Dec 12. The Closing Disclosure is next; review it and acknowledge receipt.' },
    signed: { img:'assets/homes/willow-ridge.jpg', eyebrow:'Signed · Fri Dec 12, 9:40 AM', title:'Your documents are signed.', text:'Funding, recording, disbursement and possession are confirmed separately. Keys come with the last one.' },
    possession: { img:'assets/homes/willow-ridge.jpg', eyebrow:'Possession · Fri Dec 12, 5:00 PM', title:'Welcome home.', text:'Funded, recorded and disbursed. Maya meets you at the house with the keys at 5:00 PM.' }
  };
  function momentCard(cur) {
    const m = MOMENTS[cur]; if (!m) return '';
    const nx = Engine.spine(cur).next;
    return `<div class="moment"><img src="${m.img}" alt="${alt(m.img)}"><div class="t"><div class="eyebrow">${esc(m.eyebrow)}</div><h2>${esc(m.title)}</h2><p>${esc(m.text)}</p>${nx ? `<div class="momentline"><i></i>Next: ${esc(nx.label)} · ${esc(nx.owner)}${nx.date ? ' · ' + esc(shortDate(nx.date)) : ''}</div>` : ''}</div></div>`;
  }
  const phead = (eyebrow, title, sub, display) => `<div class="phead">${eyebrow ? `<div class="eyebrow">${esc(eyebrow)}</div>` : ''}<h1${display ? ' class="display"' : ''}>${esc(title)}</h1>${sub ? `<p class="sub">${esc(sub)}</p>` : ''}</div>`;

  /* ---------- Home ---------- */
  function home(cur) {
    const s = Engine.stage(cur), sp = Engine.spine(cur), nx = sp.next, st = sp.current;
    const phase = sp.phases.find(p => p.now) || sp.phases[Math.max(0, Engine.phaseIndex(cur))];
    const hasProp = at(cur, 'searching');
    const prop = hasProp ? `<div class="prop"><img src="${WORLD.property.img}" alt="${alt(WORLD.property.img)}"><div><button type="button" class="addr" data-go="homes/willow">${esc(WORLD.property.address)}, ${esc(WORLD.property.city)}</button><span>${at(cur, 'under_contract') ? 'Executed Oct 22 · effective date confirmed by Maya Chen' : 'MLS · synced ' + esc(WORLD.property.synced) + ' · listing data may change'}</span></div><div class="right">${propertyStatus(cur)}${at(cur, 'under_contract') && !at(cur, 'possession') ? '<span>Closing Fri Dec 12, 9:00 AM ET</span>' : ''}</div></div>` : '';
    const owner = nx ? ownerPerson(nx.owner) : null;
    const nextCard = nx
      ? `<div class="card sage next"><div><div class="eyebrow">Your next step</div><h2>${esc(nx.action)}</h2><div class="who">${owner ? av(owner, 'xs') : ''}<span>${esc(nx.detail || '')}</span></div><div class="kv"><b>${esc(st.label)} · ${esc(nx.label)}</b><span>${esc(nx.date || '—')}</span><b>Owner</b><span>${esc(nx.owner)}</span><b>Source</b><span>${esc(nx.source || '—')}</span></div></div><div class="waiting">${nx.bucket === 'team' ? `<span class="kit-loader"></span><span class="small muted">Waiting on ${esc(nx.owner)}</span>` : ''}${cta(nx.action)}</div></div>`
      : `<div class="card sage next"><div><div class="eyebrow">Your home, organized</div><h2>${esc(s.cta)}</h2><p class="muted">${esc(s.ctaDetail || '')}</p></div><div>${cta(s.cta)}</div></div>`;
    const others = st ? sp.steps.filter(x => x.id !== st.id && ['you', 'team', 'attention'].includes(x.status)) : [];
    const chips = others.length ? `<div class="chips" style="margin-top:14px">${others.map(x => { const c = x.checkpoints.find(c => c.bucket === x.status); return `<button type="button" class="chip" data-step="${x.id}">${esc(x.label)} · ${esc(cpLine(c))}${c.owner && x.status !== 'you' ? ' · ' + esc(c.owner.split(',')[0]) : ''}</button>`; }).join('')}</div>` : '';
    const stepCard = st ? `<div class="card"><div class="card-h"><h3>This step · ${esc(st.label)}</h3><span class="small muted">${st.done} of ${st.total} checkpoints done</span></div>${cpRail(st.checkpoints)}${st.control ? `<div class="control"><b>What this gate controls.</b> ${esc(st.control)}</div>` : ''}${chips}</div>` : '';
    const tasks = WORLD.tasks.filter(t => Engine.visible(t, cur));
    const buckets = `<div><div class="card-h"><h3>Where things stand</h3><span class="small muted">Tick a box to mark it done</span></div><div class="buckets">${BUCKETS.map(([k, label]) => { const rows = tasks.filter(t => Engine.statusAt({ status: t.bucket }, cur) === k); return `<div class="bucket ${k}"><h4><i></i>${label}</h4><div class="tasks" data-bucket="${k}">${rows.length ? rows.map(t => taskRow(t, cur)).join('') : '<p class="empty">Nothing right now.</p>'}</div></div>`; }).join('')}</div></div>`;
    return phead(phase.label + ' · ' + s.label, s.headline, s.sub, true) + prop + momentCard(cur) + line(sp, { legend: true }) + `<div class="cols"><div class="stack">${nextCard}${stepCard}${buckets}</div><div class="rail">${rail(cur)}</div></div>`;
  }

  /* ---------- Timeline ---------- */
  function timeline(cur, _sub, step) {
    const sp = Engine.spine(cur);
    const cpRow = c => { const p = ownerPerson(c.owner); return `<li>${p ? av(p, 'sm') : '<span class="avatar sm" aria-hidden="true"></span>'}<div><b>${esc(c.label)}</b><span class="src">${esc(c.owner)}${c.source ? ' · ' + esc(c.source) : ''}${c.date ? ' · ' + esc(c.date) : ''}</span>${(c.changes || []).map(ch => `<div class="change"><b>${esc(ch.field)}</b>: <s>${esc(ch.old)}</s> → ${esc(ch.new)} · ${esc(ch.reason)} · approved by ${esc(ch.approver)} · ${esc(ch.at)}</div>`).join('')}</div>${pill(c.bucket, c.bucket === 'todo' ? 'Not started' : c.text)}</li>`; };
    const stepCard = st => `<div class="card step ${st.status}${step === st.id ? ' hl' : ''}" data-step="${st.id}"><div class="card-h"><h3>${esc(st.label)}${st.gate ? ' <span class="small muted">· gate</span>' : ''}</h3>${pill(st.status, LABEL[st.status])}</div>${st.control ? `<div class="control">${esc(st.control)}</div>` : ''}<ul class="cpl">${st.checkpoints.map(cpRow).join('')}</ul></div>`;
    return phead('', 'Timeline', 'Every step on the line and every checkpoint inside it, with its owner, date, source and status. Target dates are labelled as targets until a professional confirms them.') +
      `<div class="tltools"><label style="display:flex;align-items:center;gap:10px"><input type="checkbox" class="kit-switch" id="tl-done" checked data-tl-done>Show completed steps</label></div>` +
      sp.phases.map(p => `<div class="tlphase"><h2>${esc(p.label)}</h2><span class="small muted">${p.done} of ${p.total} done${p.open ? ' · ' + p.open + ' open' : ''}</span></div>${sp.steps.filter(st => p.steps.includes(st.id)).map(stepCard).join('')}`).join('');
  }

  /* ---------- Team ---------- */
  const SIDE = { buyer:'Your side', seller:'Seller side', neutral:'Neutral', provider:'Your provider' };
  const myNow = cur => { const nx = Engine.spine(cur).next; return nx ? (nx.bucket === 'you' ? nx.action + '.' : 'Waiting on ' + nx.owner + '.') : 'Everything is confirmed.'; };
  function team(cur) {
    const vis = WORLD.people.filter(p => Engine.visible(p, cur));
    const chip = p => `<span class="sidechip${p.side === 'seller' ? ' seller' : ''}">${SIDE[p.side]}</span>`;
    const card = p => `<div class="pcard${p.limited ? ' limited' : ''}"><div class="who">${av(p, 'lg')}<div><b>${esc(p.name)}</b><span>${esc(p.role)}${p.org ? ' · ' + esc(p.org) : ''}</span></div>${p.limited ? '' : menuBtn('person:' + p.id, p.name)}</div><div class="now"><em>Now:</em> ${esc(Engine.statusAt(p, cur) || '—')}</div><div class="acts">${p.limited ? '' : `<button type="button" class="btn secondary small" ${msgAttr(p)}>Message</button>${p.phone ? `<button type="button" class="textbtn" data-toast="Calling ${esc(p.name)} at ${esc(p.phone)} (mock)">Call</button>` : ''}`}${chip(p)}</div></div>`;
    const me = `<div class="pcard"><div class="who">${av(WORLD.buyer, 'lg')}<div><b>${esc(WORLD.buyer.name)}</b><span>Buyer · you</span></div></div><div class="now"><em>Now:</em> ${esc(myNow(cur))}</div><div class="acts"><span class="sidechip">Your side</span></div></div>`;
    const grp = (title, ids, note) => { const list = vis.filter(p => ids.includes(p.id)); return list.length ? `<div class="grouph">${title}${note ? `<small>${note}</small>` : ''}</div><div class="people">${list.map(card).join('')}</div>` : ''; };
    return phead('', 'Your team', 'Everyone in your transaction, what side they are on, and what they are handling now. Joining does not give anyone access to everything.') +
      `<div class="grouph">Buyers</div><div class="people">${me}${vis.filter(p => p.id === 'sam').map(card).join('')}</div>` +
      grp('Your representation', ['maya', 'renee']) + grp('Your professionals', ['jordan', 'elena', 'marcus', 'nora']) + grp('Seller side', ['daniel'], 'Communicates through Maya. Never sees your workspace, drafts or financing.');
  }

  /* ---------- Documents ---------- */
  function documents(cur) {
    const vis = WORLD.documents.filter(d => Engine.visible(d, cur));
    const upload = `<div class="uploadwrap"><h3>Add a document you received elsewhere</h3>${uploadZone('Drop a file here, or browse. It stays on your side until you share it.', 'Uploads are not part of this mock.')}</div>`;
    if (!vis.length) return phead('', 'Documents', 'Documents appear here as they are shared with you.') + `<div class="card"><p class="empty">Nothing shared yet.</p></div>${upload}`;
    return phead('', 'Documents', 'Each document shows its status, its source and who can see it. Nothing here is visible to the seller side unless it was deliberately sent.') +
      CLS.map(c => { const list = vis.filter(d => d.cls === c); return list.length ? `<div class="docgroup"><h3>${c}</h3>${list.map(d => docRow(d, cur)).join('')}</div>` : ''; }).join('') + upload;
  }

  /* ---------- Money ---------- */
  function money(cur) {
    if (!at(cur, 'under_contract')) return phead('', 'Money', 'Deposits, closing funds and verified instructions.') + `<div class="card"><h3>No funds are due</h3><p class="muted">Nothing is owed before a contract is executed. ${at(cur, 'preapproved') ? 'Your pre-approval is for up to $495,000; your search range is private to you and Maya.' : ''}</p></div>`;
    const sp = Engine.spine(cur);
    const received = at(cur, 'inspection_scheduled');
    const deposit = sp.steps.find(s => s.id === 'deposit');
    const earnest = `<div class="card money"><div class="card-h"><h3>Earnest money</h3>${received ? pill('confirmed', 'Received · confirmed by Great Lakes Title') : pill('you', 'Due Sat Oct 25, 5:00 PM ET')}</div><div class="big count" data-value="5000" data-prefix="$">$5,000</div><p class="muted">Held by Great Lakes Title. Credited toward your cash to close.</p><div class="trace">${cpRail(deposit.checkpoints)}</div><div class="row"><button type="button" class="btn secondary" data-doc="earnest_instructions">View verified payment steps</button>${received ? '<button type="button" class="btn text" data-doc="deposit_receipt">Receipt</button>' : '<button type="button" class="btn text" data-toast="Marked as sent (reported by you). Great Lakes Title confirms receipt separately.">I’ve sent it</button>'}</div></div>`;
    const funds = sp.steps.find(s => s.id === 'funds');
    const closing = at(cur, 'closing_scheduled') ? `<div class="card money"><div class="card-h"><h3>Closing funds</h3>${at(cur, 'signed') ? pill('confirmed', 'Received Dec 11') : pill('you', 'Wire by Thu Dec 11, 2:00 PM ET')}</div><div class="big count" data-value="96812.18" data-prefix="$">$96,812.18</div><p class="muted">Cash to close per the Closing Disclosure. Instructions verified by phone with Elena Vasquez on Dec 9.</p><div class="trace">${cpRail(funds.checkpoints)}</div><div class="warn">Confirm instructions only through the Great Lakes Title number you already have. Kanah never shows account numbers, and any change restarts verification.</div><div class="row" style="margin-top:12px"><button type="button" class="btn secondary" data-doc="closing_funds">View verified next steps</button><button type="button" class="btn text" data-doc="closing_disclosure">Closing Disclosure</button></div></div>` : '';
    const breakdown = at(cur, 'clear_to_close') ? `<div class="card"><div class="card-h"><h3>Cash to close</h3><span class="small muted">From the Closing Disclosure · Dec 8</span></div><table class="jt"><tbody><tr><td>Sale price</td><td class="num">$482,000.00</td></tr><tr><td>Loan amount</td><td class="num">−$385,600.00</td></tr><tr><td>Closing costs</td><td class="num">$8,912.18</td></tr><tr><td>Earnest money already paid</td><td class="num">−$5,000.00</td></tr><tr><td>Seller credit (Amendment 1)</td><td class="num">−$3,500.00</td></tr><tr><th>Cash to close</th><th class="num">$96,812.18</th></tr></tbody></table></div>` : at(cur, 'in_diligence') ? `<div class="card"><h3>Estimated closing costs</h3><p class="muted">$8,912.18 on the Loan Estimate (Nov 3). Your $3,500 seller credit will reduce cash to close. Final figures come on the Closing Disclosure.</p><button type="button" class="btn text" data-doc="loan_estimate">Loan Estimate</button></div>` : '';
    return phead('', 'Money', 'Deposits, closing funds and verified instructions. “Sent” is what you report; “received” is what the holder confirms.') + `<div class="stack">${earnest}${closing}${breakdown}</div>`;
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
        `<div class="card"><div class="prefs"><div class="kit-field"><input type="text" id="pref-area" value="${esc(PREFS.area)}" required><span>Area</span></div><div class="kit-field"><input type="text" id="pref-range" value="${esc(PREFS.range)}" required><span>Price range</span></div><div class="kit-field"><input type="text" id="pref-must" value="${esc(PREFS.must)}" required><span>Must-haves</span></div><div><button type="button" class="kit-submit" data-toast="Preferences saved. Maya can see them; sellers cannot.">Save preferences</button></div></div></div>`;
    }
    const vis = WORLD.homes.filter(h => Engine.visible(h, cur));
    return phead('', 'Your homes, together.', 'Save a home or review one Maya shared. Listing data comes from the MLS and may change.') +
      `<div class="card flat"><div class="card-h"><h3>Your search preferences</h3><span class="small muted">Private to you and Maya</span></div><div class="kv"><b>Area</b><span>${esc(PREFS.area)}</span><b>Price range</b><span>${esc(PREFS.range)}</span><b>Must-haves</b><span>${esc(PREFS.must)}</span></div></div>
      <div class="homes">${vis.map(h => { const off = h.unavailableFrom && at(cur, h.unavailableFrom); return `<button type="button" class="home-card${off ? ' off' : ''}" data-go="homes/${h.id}"><img src="${h.img}" alt="${alt(h.img)}"><div class="hb"><span class="price">$${h.price.toLocaleString()}</span><b>${esc(h.address)}</b><span class="small muted">${h.beds} bd · ${h.baths} ba · ${h.sqft.toLocaleString()} sq ft · ${h.built}</span><div style="margin-top:6px">${pill(off ? 'attention' : h.id === 'willow' ? 'confirmed' : 'neutral', Engine.statusAt(h, cur))}</div></div></button>`; }).join('')}</div>
      <div class="uploadwrap"><h3>Add a home</h3>${uploadZone('Drop a listing sheet here, or add an address. MLS lookup where licensed; otherwise a reviewed manual entry.', 'Adding a home is not part of this mock.')}</div>`;
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
    else if (cur === 'tour_confirmed') action = `<div class="card sage"><div class="row"><div><b>Tour confirmed</b> · Fri Oct 17, 10:30 AM ET · you’ll meet Maya at the front door.</div>${cta(nx.action)}<button type="button" class="btn text" data-toast="Reschedule or cancel goes to Maya (mock).">Reschedule</button></div></div>`;
    else if (at(cur, 'offer_drafting')) action = `<div class="row"><button type="button" class="btn secondary" data-go="${at(cur, 'under_contract') ? 'home' : 'offer'}">${at(cur, 'under_contract') ? 'Open your Closing Room' : 'Open your offer'}</button></div>`;
    return `<button type="button" class="btn text" data-go="homes">← Homes</button>
      <div class="phead" style="margin:8px 0 12px"><div class="row"><h1>${esc(h.address)}</h1>${h.id === 'willow' ? propertyStatus(cur) : off ? pill('attention', 'Availability changed') : pill('neutral', 'Saved')}</div></div>
      ${gallery}
      <div class="facts"><span class="serif" style="font-size:24px;color:var(--forest)">$${h.price.toLocaleString()}</span><span>${h.beds} bd</span><span>${h.baths} ba</span><span>${h.sqft.toLocaleString()} sq ft</span><span>Built ${h.built}</span><span>${esc(h.lot)}</span><span class="small">${esc(h.source)} · synced ${esc(h.synced)} · listing data may change</span></div>
      ${h.id === 'willow' ? `<p>${esc(WORLD.property.blurb)}</p>` : ''}
      ${action}
      ${listingDocs.length ? `<h3 style="margin:22px 0 8px">Approved listing documents</h3>${listingDocs.map(d => docRow(d, cur)).join('')}` : ''}
      <div class="card" style="margin-top:18px"><div class="row">${av(Engine.byId(WORLD.people, 'maya'), 'sm')}<b>Maya’s notes</b></div><p class="muted small" style="margin:6px 0 0">${h.id === 'willow' ? 'Two other buyers toured this week. The 2009 roof is the thing to inspect; the kitchen remodel was permitted.' : 'Maya has not added notes on this home yet.'}</p></div>`;
  }

  /* ---------- Offer surface ---------- */
  const OFFER = [['Purchase price','$478,000','$482,000'],['Earnest money','$5,000','$5,000'],['Financing','Conventional 30-yr fixed, 20% down · contingency','same'],['Inspection period','10 days','10 days'],['Appraisal contingency','Yes','Yes'],['Closing date','Thu Dec 4, 2026','Fri Dec 12, 2026'],['Possession','At closing','At closing'],['Offer expiration','Wed Oct 22, 5:00 PM ET','Counter expires Thu Oct 23, 5:00 PM ET']];
  function offer(cur) {
    if (!at(cur, 'offer_drafting')) return phead('', 'Offer') + `<div class="card"><h3>No offer yet</h3><p class="muted">When you and Maya decide to make an offer, it is drafted privately here. Nothing goes to a seller until you authorize it.</p><button type="button" class="btn secondary" data-go="homes">Saved homes</button></div>`;
    const executed = at(cur, 'under_contract'), countered = at(cur, 'counteroffer'), sent = at(cur, 'offer_submitted');
    const sam = person('sam');
    const terms = `<div class="card"><div class="card-h"><h3>${executed ? 'Executed terms' : countered ? 'What changed' : 'Your offer terms'}</h3>${executed ? pill('confirmed', 'Effective Oct 22') : sent ? pill('team', 'Sent · v1') : pill('you', 'Draft · not sent')}</div>
      <table class="jt${countered && !executed ? ' diff' : ''}"><thead><tr><th>Term</th>${countered && !executed ? '<th>Offer v1</th><th>Counter v2</th>' : '<th>Value</th>'}</tr></thead><tbody>${OFFER.map(([t, v1, v2]) => {
        // each version carries its own expiration; not a changed contract term
        const changed = v1 !== v2 && v2 !== 'same' && t !== 'Offer expiration';
        const val = executed ? (v2 === 'same' ? v1 : v2) : v1;
        return countered && !executed ? `<tr class="${changed ? 'changed' : ''}"><td>${t}</td><td>${v1}</td><td>${v2 === 'same' ? v1 : v2}</td></tr>` : `<tr><td>${t}</td><td>${val}</td></tr>`;
      }).join('')}</tbody></table>
      ${!sent ? '<p class="small muted">These terms are not sent yet. Structured summary beside the authoritative documents.</p>' : ''}</div>`;
    const signers = !executed ? `<div class="card signers"><div class="card-h"><h3>Signatures</h3><span class="small muted">Each signer signs for themselves</span></div>
      <div class="row">${av(WORLD.buyer, 'sm')}<b>Alex Morgan</b>${at(cur, 'offer_signing') ? pill('confirmed', 'Signed Oct 20, 11:02 AM') : pill('you', 'Not yet')}</div>
      <div class="row">${av(sam, 'sm')}<b>Sam Okafor</b>${at(cur, 'offer_ready') ? pill('confirmed', 'Signed Oct 20, 1:48 PM') : pill('team', 'Pending')}</div></div>` : '';
    const authorize = cur === 'offer_ready' ? `<div class="card sage"><h3>Ready for Maya to send?</h3><p>The seller’s side will receive only what is listed here.</p><div class="kv"><b>Version</b><span>Offer v1 · content hash a3f9…c21e</span><b>Documents</b><span>Purchase agreement v1 · Pre-approval letter (version 1) · Lead paint acknowledgment</span><b>Recipients</b><span>Daniel Reyes, Arbor Homes Realty (verified listing agent)</span><b>Not included</b><span>Your workspace, preferences, drafts, or any other version of your letter</span></div><div style="margin-top:12px"><button type="button" class="kit-submit" data-cta>Authorize submission</button></div></div>` : '';
    const trackCps = [{ label:'Sent', bucket:'confirmed', date:'2:05 PM' }, { label:'Delivered', bucket:'confirmed', date:'2:05 PM' }, { label:'Opened', bucket:'confirmed', date:'3:42 PM' }, { label:'Acknowledged', bucket:'confirmed', date:'4:10 PM · Daniel Reyes' }];
    const tracking = sent && !executed ? `<div class="card"><div class="card-h"><h3>Tracking</h3><span class="small muted">Sent by Maya · Oct 20</span></div>${cpRail(trackCps)}${countered ? '<p>Counteroffer v2 received Tue Oct 21, 11:30 AM. Review the changes above; then accept and sign, counter, or decline with Maya.</p><div class="row"><button type="button" class="kit-submit" data-cta>Accept and sign</button><button type="button" class="btn text" data-go="messages/maya">Discuss with Maya</button><button type="button" class="btn text" data-toast="Counter or decline goes through Maya as a new version (mock).">Counter or decline</button></div>' : '<p class="muted">Seller response pending. Your offer expires Wed Oct 22, 5:00 PM ET.</p>'}</div>` : '';
    const executedCard = executed ? `<div class="card"><h3>Executed Oct 22</h3><p class="muted">Maya confirmed the effective date and the dates that flow from it. Your Closing Room is open with the line, tasks and your team.</p><div class="row"><button type="button" class="btn secondary" data-go="home">Open your Closing Room</button><button type="button" class="btn text" data-doc="executed_agreement">Executed agreement</button></div></div>` : '';
    const docs = WORLD.documents.filter(d => d.cls === 'Offer' || (executed && d.id === 'executed_agreement')).filter(d => Engine.visible(d, cur));
    return phead('', executed ? '1847 Willow Ridge Dr · your purchase' : 'Your offer · 1847 Willow Ridge Dr', executed ? 'The accepted offer became your contract. Other offers on this home, if any, are archived and never visible to you.' : 'Drafts stay on your side. Only the version you authorize goes to the seller’s side.') + `<div class="stack">${terms}${signers}${authorize}${tracking}${executedCard}<div><h3 style="margin:6px 0 8px">Documents</h3>${docs.map(d => docRow(d, cur)).join('')}</div></div>`;
  }

  /* ---------- Messages ---------- */
  function messages(cur, threadId) {
    const threads = WORLD.threads.filter(t => Engine.visible(t, cur));
    const sel = threads.find(t => t.id === threadId) || threads[threads.length - 1];
    const msgs = WORLD.messages.filter(m => m.thread === sel.id && Engine.idx(m.stage) <= Engine.idx(cur));
    const list = threads.map(t => { const last = WORLD.messages.filter(m => m.thread === t.id && Engine.idx(m.stage) <= Engine.idx(cur)).slice(-1)[0]; return `<button type="button" class="thread" aria-current="${t.id === sel.id}" data-go="messages/${t.id}"><b>${esc(t.title)}</b><span>${last ? esc(last.text.slice(0, 60)) + '…' : 'No messages yet'}</span></button>`; }).join('');
    const body = msgs.length ? msgs.map(m => { const p = person(m.from); const me = m.from === 'alex'; return `<div class="msg${me ? ' me' : ''}">${me ? '' : av(p, 'sm')}<div><div class="who">${esc(p.name)} · ${esc(m.at)}</div><div class="bubble">${esc(m.text)}${m.doc ? `<br><button type="button" class="att" data-doc="${m.doc}">📎 ${esc(Engine.byId(WORLD.documents, m.doc).title)}</button>` : ''}</div></div></div>`; }).join('') : '<p class="empty">Created empty. Nothing from your private threads is copied in.</p>';
    return phead('', 'Messages', 'Three separate conversations. Each shows who can read it. Your private thread with Maya never reaches the seller side.') +
      `<div class="threads"><div>${list}</div><div class="card convo"><div class="card-h"><h3>${esc(sel.title)}</h3></div><p class="small muted" style="margin-top:-6px">${esc(sel.scope)} · ${sel.members.map(pname).join(', ')}</p><div class="msgs">${body}</div>
      <div class="composer"><div class="kit-field"><input type="text" id="msg-${sel.id}" required aria-label="Message"><span>Message ${esc(sel.title.split(' ·')[0])}</span></div><button type="button" class="kit-submit small" data-toast="Sending is not part of this mock.">Send</button></div></div></div>`;
  }

  /* ---------- Ask Kanah ---------- */
  function ask(cur) {
    const avail = WORLD.ask.filter(a => Engine.visible(a, cur) && a.cites.every(c => Engine.visible(Engine.byId(WORLD.documents, c), cur)));
    const q = (typeof Shell !== 'undefined' && Shell.pendingQuestion) || null;
    let answer = '';
    if (q) {
      const hit = avail.find(a => a.q === q) || avail.find(a => q.toLowerCase().includes(a.q.toLowerCase().slice(0, 18))) || (q.startsWith('Explain “') ? { a: 'Here is what I can tell you from the document itself. Open it to read the full text; I explain, and your team confirms anything consequential.', cites: WORLD.documents.filter(d => q.includes(d.title) && Engine.visible(d, cur)).map(d => d.id) } : null);
      const a = hit ? hit.a : 'I can explain documents you can see and summarize your own conversations. For dates, decisions, amounts or anything that changes your contract, Maya or the responsible professional confirms — I’ve routed this to Maya.';
      const cites = hit ? hit.cites : [];
      answer = `<div class="answer"><div class="msg me"><div><div class="who">You</div><div class="bubble">${esc(q)}</div></div></div>
        <div class="typing"><span class="kit-loader"></span>Reading what you can see…</div>
        <div class="msg reply"><img class="avatar sm" src="assets/brand/kanah-mark.svg" alt="Kanah"><div><div class="who">Ask Kanah</div><div class="bubble">${esc(a)}${cites.length ? '<br>' + cites.map(c => `<button type="button" class="cite" data-doc="${c}">📄 ${esc(Engine.byId(WORLD.documents, c).title)}</button>`).join('') : ''}${!hit ? '<br><button type="button" class="cite" data-go="messages/maya">Ask Maya</button>' : ''}</div></div></div></div>`;
    }
    return phead('', 'Ask Kanah', 'Explanations with sources. I can explain a document you can see and summarize your conversations; I never confirm a deadline, an offer or a payment instruction. Your team does.') +
      `<div class="card convo"><div class="chat"><div class="msg"><img class="avatar sm" src="assets/brand/kanah-mark.svg" alt="Kanah"><div><div class="who">Ask Kanah</div><div class="bubble">Hi Alex. Here are things I can explain right now.</div></div></div>
      <div class="chips">${avail.map(a => `<button type="button" class="chip q" data-ask="${esc(a.q)}">${esc(a.q)}</button>`).join('')}</div>${answer}</div>
      <div class="composer"><div class="kit-field"><input type="text" id="ask-q" required aria-label="Question"><span>Ask about a document or your timeline</span></div><button type="button" class="kit-submit small" data-toast="Typed questions are not part of this mock; use the suggestions.">Ask</button></div></div>
      <p class="small muted">Ask Kanah explains; Maya and your team confirm dates and decisions.</p>`;
  }

  return { _: { esc, pill, cta, line, cpRail, docRow, taskRow, person, pname, CLS, at, propertyStatus, shortDate }, home, timeline, team, documents, money, doc, homes, homeDetail, offer, messages, ask };
})();
