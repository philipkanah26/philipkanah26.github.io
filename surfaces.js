/* ============================================================
   Surfaces: what the buyer sees and does for one workstream at one stage.
   Spec: Kanah-Buyer-Mock-Alignment-Spec.md §7.
   Surfaces.render(cur, ws) returns { title, sub, body, primary, strip, extra }
     title, sub  the section title and its one-line sub
     body        HTML inside the surface card; always opens with the eyebrow row
     primary     { label } for the one kit-cta on the screen, or null
     strip       three reassurance strings, or null
     extra       HTML for a second card under the surface, or ''
   ws is one entry of Engine.workstreams(cur). Depends on Engine, WORLD, DOC_BODIES. No DOM.
   ============================================================ */
const Surfaces = (() => {
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  const before = (cur, k) => Engine.idx(cur) < Engine.idx(k);

  /* ---------- pieces ---------- */
  const eyebrow = (label, link) => `<div class="s-eyebrow"><span class="eyebrow">${esc(label)}</span>${link ? `<button type="button" class="s-link" ${link[1]}>${esc(link[0])} →</button>` : ''}</div>`;
  const rows = list => `<div class="s-rows">${list.map(([k, v, attr]) => `<div class="s-row"><b>${esc(k)}</b><span>${attr ? `<button type="button" class="textlink" ${attr}>${esc(v)}</button>` : esc(v)}</span></div>`).join('')}</div>`;
  const note = t => `<p class="s-note">${esc(t)}</p>`;
  const muted = t => `<p class="s-muted">${esc(t)}</p>`;
  const lines = list => `<ul class="s-lines">${list.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;
  const links = list => `<div class="s-links">${list.map(([label, attr]) => `<button type="button" class="textbtn" ${attr}>${esc(label)}</button>`).join('')}</div>`;
  const docs = (cur, ids) => `<div class="s-docs">${ids.map(id => Engine.byId(WORLD.documents, id)).filter(d => d && Engine.visible(d, cur)).map(d => `<button type="button" class="s-doc" data-doc="${d.id}"><b>${esc(d.title)}</b><span>${esc(Engine.statusAt(d, cur))}</span></button>`).join('')}</div>`;
  const table = (head, body, cls) => `<table class="jt${cls ? ' ' + cls : ''}"><thead><tr>${head.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${body.map(r => `<tr${r.changed ? ' class="changed"' : ''}>${r.cells.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  const cpLine = c => c.date ? String(c.date).replace(/^(Sun|Mon|Tue|Wed|Thu|Fri|Sat) /, '') : (c.bucket === 'todo' ? '' : String(c.text || '').split(' · ')[0]);
  const cpRail = cps => `<div class="checkpoints">${cps.map(c => `<div class="cp ${c.bucket}"><i></i><b>${esc(c.label)}</b><span>${esc(cpLine(c))}</span></div>`).join('')}</div>`;
  const step = (ws, id) => ws.steps.find(s => s.id === id);
  const findings = () => [...(DOC_BODIES.inspection_report || '').matchAll(/<h3>Finding \d+ · ([^<]+)<\/h3>/g)].map(m => { const t = m[1]; const x = t.match(/^(.*) \(([^)]+)\)$/); return x ? { title: x[1], severity: x[2] } : { title: t, severity: '' }; });
  const STAR = '<svg class="star" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L12 16.9l-5.3 2.8 1.1-5.9L3.5 9.7l5.9-.8z"/></svg>';
  const avatar = i => i.img ? `<img class="s-photo" src="${i.img}" alt="${esc(WORLD.images[i.img] || i.name)}">` : `<span class="s-photo ini" aria-hidden="true">${esc(i.initials || i.name.split(' ').map(w => w[0]).join(''))}</span>`;
  const inspectorCard = i => `<div class="s-inspector"><div class="who">${avatar(i)}<div><b class="name">${esc(i.name)}</b><span class="org">${esc(i.org)}</span><span class="rating">${STAR}<b>${esc(i.rating)}</b> (${i.reviews} reviews)</span></div></div><div class="price"><small>Price</small><b>${esc(i.price)}</b></div></div>`;
  const slotsHtml = () => `<div class="s-days">${WORLD.slots.days.map((d, i) => `<button type="button" class="day${d.selected ? ' on' : ''}" data-pick="day" data-i="${i}" aria-pressed="${d.selected ? 'true' : 'false'}"><small>${esc(d.day)}</small><b>${esc(d.date)}</b><em>${d.slots} Slots</em></button>`).join('')}</div><div class="s-times">${WORLD.slots.times.map((t, i) => `<button type="button" class="time${t.selected ? ' on' : ''}" data-pick="time" data-i="${i}" aria-pressed="${t.selected ? 'true' : 'false'}">${esc(t.t)}</button>`).join('')}</div>`;
  const OFFER_TERMS = [['Purchase price','$478,000','$482,000'],['Earnest money','$5,000','$5,000'],['Financing','Conventional 30-yr fixed, 20% down · contingency','same'],['Inspection period','10 days','10 days'],['Appraisal contingency','Yes','Yes'],['Closing date','Thu Dec 4, 2026','Fri Dec 12, 2026'],['Possession','At closing','At closing'],['Offer expiration','Wed Oct 22, 5:00 PM ET','Counter expires Thu Oct 23, 5:00 PM ET']];
  const termsTable = mode => {
    if (mode === 'diff') return table(['Term', 'Offer v1', 'Counter v2'], OFFER_TERMS.map(([t, a, b]) => ({ cells: [t, a, b === 'same' ? a : b], changed: a !== b && b !== 'same' && t !== 'Offer expiration' })), 'diff');
    const list = mode === 'executed' ? OFFER_TERMS.filter(([t]) => t !== 'Offer expiration') : OFFER_TERMS;
    return table(['Term', 'Value'], list.map(([t, a, b]) => ({ cells: [t, mode === 'executed' ? (b === 'same' ? a : b) : a] })));
  };
  const S = {};

  /* ---------- Offer (spec §7.1) ---------- */
  S.offer = (cur) => {
    if (before(cur, 'offer_drafting')) return { title:'No offer yet.', sub:'When you and Maya decide to make an offer, it is drafted privately here. Nothing goes to a seller until you authorize it.',
      body: eyebrow('Offer') + links([['Saved homes', 'data-go="homes"']]), primary:null, strip:null };
    if (cur === 'offer_drafting') return { title:'Let’s put your offer together.', sub:'Review the terms with Maya and tell her they’re right. Nothing is sent yet.',
      body: eyebrow('Your offer terms', ['Ask Maya to change something', 'data-go="messages/maya"']) + termsTable('v1') + muted('Drafted by Maya Chen · Sun Oct 19 · not sent'),
      primary:{ label:'These terms look right' }, strip:['Maya prepares the documents', 'Sam is asked to sign after you', 'Nothing is sent until you authorize it'] };
    if (cur === 'offer_signing') return { title:'Sign your offer.', sub:'Read each document, then sign. Sam signs after you.',
      body: eyebrow('Documents to sign') + docs(cur, ['offer_v1', 'preapproval', 'lead_paint']) + rows([['Alex Morgan', 'Not yet'], ['Sam Okafor', 'After you']]),
      primary:{ label:'Sign offer v1' }, strip:['Sam is notified to sign', 'Maya checks the package', 'Nothing is sent until you authorize it'] };
    if (cur === 'offer_ready') return { title:'Ready for Maya to send?', sub:'Authorize this version and Maya sends it. The seller’s side gets only what is listed.',
      body: eyebrow('What the seller’s side receives') + rows([['Version', 'Offer v1 · content hash a3f9…c21e'], ['Documents', 'Purchase agreement v1 · Pre-approval letter (version 1) · Lead paint acknowledgment'], ['Recipients', 'Daniel Reyes, Arbor Homes Realty (verified listing agent)'], ['Not included', 'Your workspace, preferences, drafts, or any other version of your letter']]),
      primary:{ label:'Authorize submission' }, strip:['Maya sends exactly this version', 'Delivery and opening are tracked', 'You are told the moment the seller responds'] };
    if (cur === 'offer_submitted') return { title:'Your offer is with the seller.', sub:'Sent Oct 20 at 2:05 PM and acknowledged at 4:10 PM. Kanah tells you the moment they respond.',
      body: eyebrow('Tracking') + cpRail([{ label:'Sent', bucket:'confirmed', date:'2:05 PM' }, { label:'Delivered', bucket:'confirmed', date:'2:05 PM' }, { label:'Opened', bucket:'confirmed', date:'3:42 PM' }, { label:'Acknowledged', bucket:'confirmed', date:'4:10 PM · Daniel Reyes' }]) + muted('Seller response pending · your offer expires Wed Oct 22, 5:00 PM ET · offer v1 §12'),
      primary:null, strip:['Acknowledged by Daniel Reyes at 4:10 PM', 'The seller’s side sees only what you authorized', 'Kanah never shows you competing offers'] };
    if (cur === 'counteroffer') return { title:'The seller proposed changes.', sub:'Two terms changed. Accept and sign, or talk it through with Maya.',
      body: eyebrow('What changed') + termsTable('diff') + links([['Counter', 'data-toast="Counter or decline goes through Maya as a new version (mock)."'], ['Decline', 'data-toast="Counter or decline goes through Maya as a new version (mock)."'], ['Discuss with Maya', 'data-go="messages/maya"']]),
      primary:{ label:'Accept and sign' }, strip:['Maya returns the signed counter', 'Execution is confirmed by the agents', 'Your deposit is due within three days of acceptance'] };
    if (cur === 'under_contract') return { title:'You’re under contract. Send your deposit.', sub:'$5,000 to Great Lakes Title by Sat Oct 25. Follow the verified steps and tell us when it’s sent.',
      body: eyebrow('Earnest money', ['View verified payment steps', 'data-doc="earnest_instructions"']) + rows([['Holder', 'Great Lakes Title · Elena Vasquez'], ['Amount', '$5,000'], ['Due', 'Sat Oct 25, 2026, 5:00 PM ET · agreement §4'], ['Verified', 'Wed Oct 22 by a call to the number on file']]) + note('Kanah never shows account numbers. If anything changes these steps, stop and call Elena at the number you already have.') + muted('Sent is what you report; received is what Great Lakes Title confirms.'),
      primary:{ label:'I’ve sent it' }, strip:['Great Lakes Title confirms receipt', 'Your receipt lands in Documents', 'Inspection opens next'] };
    return { title:'Your offer became your contract.', sub:'Executed Oct 22. Deposit received Oct 24 by Great Lakes Title.',
      body: eyebrow('Executed terms') + termsTable('executed') + docs(cur, ['executed_agreement', 'deposit_receipt']), primary:null, strip:null };
  };

  /* ---------- Inspection (spec §7.2) ---------- */
  S.inspection = (cur) => {
    if (before(cur, 'under_contract')) return { title:'Inspection comes after acceptance.', sub:'Once you’re under contract you choose an inspector here. Your deadline is set by the agreement.',
      body: eyebrow('What to expect') + lines(['Choose an inspector or invite your own', 'Scope, price and availability before anything is ordered', 'The report within 24 hours']), primary:null, strip:null };
    if (cur === 'under_contract') return { title:'Your deposit comes first.', sub:'Once Great Lakes Title confirms your $5,000, choose your inspector here. Your deadline is Sun Nov 2.',
      body: eyebrow('Up next') + rows([['Deadline', 'Sun Nov 2, 11:59 PM ET · agreement §7 · confirmed by Maya Chen'], ['Recommended', 'Marcus Bell · Bell Home Inspections · $495'], ['Deposit', 'Due Sat Oct 25 · send it from Home', 'data-go="home"']]), primary:null, strip:null };
    if (cur === 'choose_inspector') {
      const rec = WORLD.inspectors.find(i => i.id === WORLD.inspectorChoice) || WORLD.inspectors.find(i => i.recommended) || WORLD.inspectors[0];
      return { title:'Let’s schedule your home inspection.', sub:'Choose a time and confirm. Kanah handles the rest.',
        body: eyebrow('Recommended inspector', ['See more inspectors', 'data-sheet="inspectors"']) + inspectorCard(rec) + '<hr class="soft">' + '<p class="s-label">Choose a date and time</p>' + slotsHtml() + muted('Slots are Marcus Bell’s published availability. Access is confirmed with the listing side after you confirm.') + '<p class="s-muted" data-slot-note hidden>This mock continues with Tue Oct 28, 9:00 AM.</p>',
        primary:{ label:'Confirm inspection' }, strip:['We’ll notify everyone', 'Report added to room', 'Timeline updates automatically'] };
    }
    if (cur === 'inspection_scheduled') return { title:'Your inspection is booked.', sub:'Marcus Bell, Tue Oct 28 at 9:00 AM. Access is confirmed and Maya will be there.',
      body: eyebrow('Appointment', ['Reschedule', 'data-toast="Reschedule goes to Marcus and the listing side (mock)."']) + rows([['When', 'Tue Oct 28, 2026, 9:00 AM ET'], ['Inspector', 'Marcus Bell · Bell Home Inspections'], ['Fee', '$495 · accepted Oct 24'], ['Access', 'Confirmed by the listing side'], ['Scope', 'Structure, roof, exterior, systems, interior · Open the agreement', 'data-doc="inspection_scope"']]),
      primary:null, strip:['Marcus reports within 24 hours', 'Maya is on site for the whole inspection', 'Your decision window runs to Sun Nov 2'] };
    if (cur === 'inspection_report') return { title:'Your inspection report is in.', sub:'Four findings, one to act on. Decide what to ask the seller for by Sun Nov 2.',
      body: eyebrow('Findings', ['Open the full report', 'data-doc="inspection_report"']) + `<div class="s-findings">${findings().map((f, i) => `<div class="s-finding"><b>${i + 1}</b><span>${esc(f.title)}</span><em>${esc(f.severity)}</em></div>`).join('')}</div>` + links([['Accept the home as is', 'data-toast="Accepting as is or withdrawing goes through Maya (mock)."'], ['Withdraw', 'data-toast="Accepting as is or withdrawing goes through Maya (mock)."']]),
      primary:{ label:'Ask for repairs or a credit' }, strip:['Maya drafts the request', 'The seller responds', 'Everyone signs the amendment'] };
    return { title:'Inspection is complete.', sub:'Amendment 1 signed Nov 2: a $3,500 seller credit at closing.',
      body: eyebrow('Outcome') + rows([['Requested', 'Credit · Thu Oct 30 · $3,500'], ['Signed', 'Sun Nov 2, 3:20 PM ET · Maya Chen and Daniel Reyes'], ['Reason', 'Roof flashing and water heater findings']]) + docs(cur, ['inspection_report', 'repair_amendment']), primary:null, strip:null };
  };

  /* ---------- Financing (spec §7.3) ---------- */
  S.financing = (cur) => {
    if (before(cur, 'under_contract')) return { title:'Financing is ready when you are.', sub:'Pre-approved by Lakeshore Mortgage for up to $495,000, valid to Jan 10, 2027.',
      body: eyebrow('Pre-approval', ['Open the letter', 'data-doc="preapproval"']) + rows([['Lender', 'Lakeshore Mortgage · Jordan Whitfield'], ['Amount', 'Up to $495,000 · 30-year fixed'], ['Issued', 'Oct 12 · expires Jan 10, 2027'], ['Condition', 'Employment verification before closing']]), primary:null, strip:null };
    if (before(cur, 'in_diligence')) return { title:'Jordan is processing your application.', sub:'The executed agreement reached Lakeshore automatically. Your Loan Estimate is expected by Nov 3.',
      body: eyebrow('In progress') + rows([['Application', 'Completed Fri Oct 10'], ['Loan Estimate', 'Expected by Mon Nov 3'], ['Conditions', 'Employment verification before closing · Jordan handles this in the financing channel'], ['Commitment', 'Target Mon Nov 24 · agreement §5']]),
      primary:null, strip:['Jordan sends the Loan Estimate', 'You choose whether to lock', 'Nothing locks until you say so'] };
    if (cur === 'in_diligence') return { title:'Lock your rate.', sub:'Your Loan Estimate is in. Confirm your choice with Jordan by Mon Nov 10.',
      body: eyebrow('Loan Estimate · Lakeshore Mortgage · Nov 3', ['Open the Loan Estimate', 'data-doc="loan_estimate"']) + rows([['Loan amount', '$385,600'], ['Rate', '6.125% fixed · 30 years'], ['Principal and interest', '$2,343.08 / month'], ['Taxes and insurance', '$780 / month, escrowed'], ['Closing costs', '$8,912.18 estimated'], ['Lock', 'Available through Mon Nov 10']]) + links([['Ask Jordan a question', 'data-go="messages/jordan"']]),
      primary:{ label:'Lock this rate with Jordan' }, strip:['Jordan confirms the lock in writing', 'Conditions clear one by one', 'Commitment by Nov 24'] };
    return { title:'Financing is complete.', sub:'Rate locked Nov 10 at 6.125%. Commitment issued Nov 21. Clear to close Dec 4.',
      body: eyebrow('Commitment') + rows([['Locked', 'Mon Nov 10 · 6.125%'], ['Conditions', 'Cleared Fri Nov 21'], ['Commitment', 'Issued Fri Nov 21 · Lakeshore Mortgage'], ['Clear to close', 'Thu Dec 4 · every condition confirmed by your lender']]) + docs(cur, ['loan_estimate', 'appraisal']), primary:null, strip:null };
  };

  /* ---------- Appraisal (spec §7.4): never a buyer button ---------- */
  S.appraisal = (cur) => {
    const strip = ['The appraiser visits', 'Lakeshore receives the report', 'You see the value against your price'];
    if (before(cur, 'inspection_report')) return { title:'Your lender orders the appraisal.', sub:'Lakeshore orders it after the inspection period. Agents never choose the appraiser; Maya coordinates access.',
      body: eyebrow('What to expect') + lines(['Ordered by the lender', 'Scheduled with the listing side', 'Value compared to the contract price']), primary:null, strip:null };
    if (cur === 'inspection_report') return { title:'Jordan is ordering the appraisal.', sub:'Through Lakeshore’s process. Maya coordinates access once it is scheduled.',
      body: eyebrow('In progress') + rows([['Ordered', 'Jordan is ordering through Lakeshore’s process'], ['Scheduled', 'After the order is placed'], ['Report', 'Expected within a week of the visit']]), primary:null, strip };
    if (cur === 'in_diligence') return { title:'The appraisal is scheduled.', sub:'Fri Nov 14. Ordered by Lakeshore Mortgage; Maya arranged access.',
      body: eyebrow('In progress') + rows([['Ordered', 'Mon Nov 3 · Lakeshore Mortgage'], ['Scheduled', 'Fri Nov 14 · access by the listing side'], ['Report', 'Expected within a week of the visit']]), primary:null, strip };
    return { title:'Appraised at $482,000.', sub:'Equal to the contract price. No repairs required.',
      body: eyebrow('Report', ['Open the appraisal', 'data-doc="appraisal"']) + rows([['Effective', 'Fri Nov 14'], ['Reported', 'Thu Nov 20'], ['Value', '$482,000 · contract price $482,000'], ['Conditions', 'None']]), primary:null, strip:null };
  };

  /* ---------- Insurance (spec §7.5) ---------- */
  S.insurance = (cur) => {
    if (before(cur, 'in_diligence')) return { title:'Insurance comes with financing.', sub:'Your lender needs proof of coverage before closing. Nora Lindqvist sends a quote once the inspection is settled.',
      body: eyebrow('What to expect') + lines(['A quote from Nora', 'You confirm coverage and the effective date', 'Evidence goes to your lender and title']), primary:null, strip:null };
    if (cur === 'in_diligence') return { title:'Bind your policy.', sub:'Nora’s quote is in. Confirm coverage and the effective date by Mon Dec 1.',
      body: eyebrow('Quote · Mitten Mutual Insurance · Nora Lindqvist', ['Open the binder', 'data-doc="insurance_binder"']) + rows([['Premium', '$1,640 / year'], ['Dwelling', '$420,000'], ['Liability', '$300,000'], ['Deductible', '$1,500 · wind and hail 1%'], ['Effective', 'Fri Dec 12, 2026'], ['Underwriting', '2009 roof accepted']]) + links([['Ask Nora', 'data-toast="Nora is reached through Maya (mock)."']]),
      primary:{ label:'Bind this policy' }, strip:['Nora binds and sends evidence', 'Your lender and title receive it', 'Closing costs update on the Closing Disclosure'] };
    return { title:'Your policy is bound.', sub:'Mitten Mutual, effective Dec 12. Evidence delivered to your lender and title.',
      body: eyebrow('Bound') + rows([['Bound', 'Wed Dec 3'], ['Effective', 'Fri Dec 12, 2026'], ['Evidence', 'Delivered to Lakeshore Mortgage and Great Lakes Title']]) + docs(cur, ['insurance_binder']), primary:null, strip:null };
  };

  /* ---------- Title & Closing (spec §7.6) ---------- */
  S.closing = (cur, ws) => {
    if (before(cur, 'under_contract')) return { title:'Title and closing come after acceptance.', sub:'Great Lakes Title opens the order when the agreement is executed.',
      body: eyebrow('What to expect') + lines(['Title search and commitment', 'Verified funds instructions, always by phone', 'Signing, funding, recording, keys']), primary:null, strip:null };
    if (before(cur, 'clear_to_close')) return { title:'Elena is running the title search.', sub:'Great Lakes Title accepted the order Oct 22. Commitment target Mon Nov 24.',
      body: eyebrow('In progress') + rows([['Order', 'Accepted Wed Oct 22 · Elena Vasquez'], ['Commitment', 'Target Mon Nov 24'], ['Closing', 'Fri Dec 12, 9:00 AM ET · Great Lakes Title, 2723 S State St, Ann Arbor']]),
      primary:null, strip:['Elena clears exceptions and payoffs', 'Your Closing Disclosure arrives three business days before closing', 'Funds instructions are verified by phone'] };
    if (cur === 'clear_to_close') return { title:'You’re clear to close. Review your numbers.', sub:'Cash to close is $96,812.18. Read the Closing Disclosure and acknowledge it.',
      body: eyebrow('Closing Disclosure · Lakeshore Mortgage · Dec 8', ['Open the Closing Disclosure', 'data-doc="closing_disclosure"']) + table(['', 'Amount'], [{ cells:['Sale price', '$482,000.00'] }, { cells:['Loan amount', '−$385,600.00'] }, { cells:['Closing costs', '$8,912.18'] }, { cells:['Earnest money', '−$5,000.00'] }, { cells:['Seller credit (Amendment 1)', '−$3,500.00'] }, { cells:['Cash to close', '$96,812.18'], changed:true }]) + rows([['Monthly payment', '$3,123.08 estimated']]) + muted('Received Mon Dec 8. Federal rules require three business days between receipt and signing. Acknowledging receipt is not approving every figure.'),
      primary:{ label:'Acknowledge receipt' }, strip:['Elena verifies funds instructions with you by phone', 'Your closing plan is set', 'The walkthrough is booked with Maya'] };
    if (cur === 'closing_scheduled') return { title:'Send your closing funds.', sub:'$96,812.18 by Thu Dec 11 at 2:00 PM, using the instructions you verified with Elena.',
      body: eyebrow('Closing funds', ['View verified next steps', 'data-doc="closing_funds"']) + rows([['Amount', '$96,812.18'], ['Deadline', 'Thu Dec 11, 2026, 2:00 PM ET'], ['Verified', 'Tue Dec 9, 4:05 PM ET by phone with Elena Vasquez'], ['Reference', '1847 Willow Ridge Dr · Morgan/Okafor · closing Dec 12']]) + note('These instructions do not change. If anything appears to change them, stop and call Elena at the number you already have. Kanah never shows account numbers.') + muted('Sent is what you report; received is what Great Lakes Title confirms.'),
      primary:{ label:'I’ve sent the wire' }, strip:['Great Lakes Title confirms receipt', 'Walkthrough with Maya Thursday', 'Signing Friday at 9:00 AM'],
      extra: '<div class="card also"><div class="s-eyebrow"><span class="eyebrow">Also this week</span></div>' + rows([['Final walkthrough', 'Thu Dec 11, 4:00 PM ET with Maya · Open the checklist', 'data-doc="walkthrough"'], ['Closing appointment', 'Fri Dec 12, 9:00 AM ET · Great Lakes Title · bring government ID']]) + '</div>' };
    if (cur === 'signed') {
      const keys = step(ws, 'keys').checkpoints.slice(0, 4).map(c => ({ label:c.label, bucket:c.bucket, text:c.text }));
      return { title:'Your documents are signed.', sub:'Funding, recording, disbursement and possession are confirmed one by one. Keys come with the last.',
        body: eyebrow('After signing') + cpRail([{ label:'Signed', bucket:'confirmed', date:'Fri Dec 12, 9:40 AM' }].concat(keys)) + docs(cur, ['signed_package', 'settlement_statement']),
        primary:null, strip:['Each confirmation comes from its owner', 'Signed is not closed', 'Maya brings the keys when possession is authorized'] };
    }
    if (cur === 'possession') return { title:'Welcome home, Alex.', sub:'Elena confirmed your keys for 5:00 PM today.',
      body: eyebrow('Keys') + rows([['Funded', 'Fri Dec 12, 1:20 PM · Lakeshore Mortgage'], ['Recorded', 'Fri Dec 12, 2:15 PM · Washtenaw County'], ['Disbursed', 'Fri Dec 12, 3:05 PM · Great Lakes Title'], ['Possession', '5:00 PM · Maya meets you at the house']]) + docs(cur, ['deed', 'possession_note']), primary:null, strip:null };
    return { title:'Your home, organized.', sub:'Find your closing documents, warranties, and the people who helped you.',
      body: eyebrow('Closed') + docs(cur, ['deed', 'settlement_statement', 'signed_package', 'warranty']) + links([['Everyone who helped', 'data-go="people"']]), primary:{ label:'Open my documents' }, strip:null };
  };

  function render(cur, ws) {
    const fn = S[ws.id];
    const out = fn ? fn(cur, ws) : null;
    return Object.assign({ title: ws.label, sub: '', body: '', primary: null, strip: null, extra: '' }, out || {});
  }
  return { render, cpRail, findings, esc };
})();
