/* Two-pane onboarding for stages 1–7: Maya's invitation stays on the left, the one thing to do is on the right. Returns HTML; Shell mounts it into #onboard. */
const Onboarding = (() => {
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  const ARROW = '<path d="M16.17 11 10.81 5.64l1.41-1.42L20 12l-7.78 7.78-1.41-1.42L16.17 13H4v-2z"/>';
  const cta = label => `<button type="button" class="kit-cta" data-cta><svg viewBox="0 0 24 24" class="arr-2">${ARROW}</svg><span class="text">${esc(label)}</span><svg viewBox="0 0 24 24" class="arr-1">${ARROW}</svg></button>`;
  function brand() {
    const maya = Engine.byId(WORLD.people, 'maya');
    const first = WORLD.messages.find(m => m.thread === 'maya' && m.stage === 'invited');
    return `<div class="lpane brand brandpane">
      <div class="mark"><img src="assets/brand/kanah-mark.svg" alt="Kanah"><span>Kanah<i>.</i></span></div>
      <h1>Your next home starts here.</h1>
      <p>One place for your next steps, your conversations and your documents, with the people who help you buy. Nothing here reaches a seller unless you send it.</p>
      <div class="invite"><img src="${maya.img}" alt="${esc(WORLD.images[maya.img] || '')}"><div><b>${esc(maya.name)} invited you</b><span>${esc(maya.org)} · Ann Arbor</span></div>${first ? `<q>${esc(first.text)}</q>` : ''}</div>
    </div>`;
  }
  function render(cur) {
    const s = Engine.stage(cur), o = s.onboarding || {}, i = Engine.idx(cur);
    const maya = Engine.byId(WORLD.people, 'maya');
    let body = '';
    if (o.person) body += `<div class="card" style="display:grid;grid-template-columns:auto 1fr;gap:12px;align-items:center;padding:14px 16px"><img class="avatar md" src="${maya.img}" alt="${esc(WORLD.images[maya.img] || '')}"><div><b>${esc(maya.name)}</b><div class="muted small">${esc(maya.role)} · ${esc(maya.org)}</div></div></div>`;
    if (o.field) body += `<div class="kit-line" style="max-width:320px"><input type="text" class="code" id="ob-code" value="${esc(o.field.value)}" required aria-label="${esc(o.field.label)}"><label class="lbl" for="ob-code">${esc(o.field.label)}</label><span class="ul"></span></div>`;
    if (o.options) body += `<div class="opts" role="radiogroup">${o.options.map((x, k) => `<label class="kit-radio" aria-checked="${k === o.selected}" data-toast="In the real app this changes the branch. The mock follows “${esc(o.options[o.selected])}”."><input type="radio" name="ob-opt" ${k === o.selected ? 'checked' : ''}><span class="rmark"></span><span><b>${esc(x)}</b></span></label>`).join('')}</div>`;
    if (o.providers) body += `<div class="opts">${o.providers.map(p => `<label class="kit-radio" aria-checked="${!!p.selected}" data-toast="${p.own ? 'A scoped invitation would go to your lender; no access until they verify.' : 'The mock introduces you to Jordan Whitfield.'}"><input type="radio" name="ob-prov" ${p.selected ? 'checked' : ''}>${p.img ? `<img src="${p.img}" alt="${esc(WORLD.images[p.img] || p.name)}">` : '<span class="rmark"></span>'}<span><b>${esc(p.name)}</b><small>${esc(p.org)}${p.area ? ' · ' + esc(p.area) : ''}${p.avail ? ' · ' + esc(p.avail) : ''}</small><span class="disc">${esc(p.disclosure)}</span></span></label>`).join('')}</div>`;
    if (o.shares) body += `<div class="share"><div><b>Jordan receives</b><ul>${o.shares.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div><div><b>Jordan does not receive</b><ul>${o.withholds.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div></div>`;
    const secondary = o.secondary ? `<button type="button" class="textbtn" data-toast="${esc(o.note || 'This path is not part of the mock.')}">${esc(o.secondary)}</button>` : '';
    const note = (o.note && !o.secondary) ? `<p class="onote">${esc(o.note)}</p>` : '';
    const dots = Engine.keys.slice(0, 7).map((k, n) => `<i class="${n <= i ? 'on' : ''}"></i>`).join('');
    return brand() + `<div class="lpane form formpane">
      <div class="steps">${dots}<span style="margin-left:6px">Step ${i + 1} of 7</span></div>
      <div class="eyebrow">${esc(o.eyebrow || '')}</div>
      <h2>${esc(o.title)}</h2>
      <p class="sub">${esc(o.copy)}</p>
      ${body}
      <div class="actions">${cta(s.cta)}${secondary}</div>
      ${note}
      <p class="small muted">${s.b.join(', ')} · ${esc(maya.name)}, ${esc(maya.org)}</p>
    </div>`;
  }
  return { render };
})();
