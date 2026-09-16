/* Pure state functions. No DOM. Depends on STAGE (config.js), STAGES (stages.js) and SPINE (spine.js). */
const Engine = (() => {
  const keys = STAGES.map(s => s.key);
  const PHASES = ['search', 'contract', 'closing', 'keys'];

  function idx(key) {
    const i = keys.indexOf(key);
    if (i < 0) throw new Error('Unknown stage: ' + key);
    return i;
  }
  function stage(key) { return STAGES[idx(key)]; }
  function next(key) { const i = idx(key); return i + 1 < keys.length ? keys[i + 1] : null; }
  function prev(key) { const i = idx(key); return i > 0 ? keys[i - 1] : null; }
  function phaseIndex(key) { return PHASES.indexOf(stage(key).phase); }

  function parseHash(hash) {
    const out = {};
    String(hash || '').replace(/^#/, '').split('&').forEach(pair => {
      if (!pair) return;
      const [k, ...rest] = pair.split('=');
      out[decodeURIComponent(k)] = decodeURIComponent(rest.join('='));
    });
    return out;
  }
  function buildHash(obj) {
    return '#' + Object.entries(obj).filter(([, v]) => v).map(([k, v]) => k + '=' + encodeURIComponent(v)).join('&');
  }
  function current(hash) {
    const s = parseHash(hash).stage;
    return s && keys.includes(s) ? s : STAGE;
  }

  function visible(item, cur) {
    if (!item || !item.from) return true;
    const c = idx(cur);
    return idx(item.from) <= c && (!item.until || c < idx(item.until));
  }
  function statusAt(item, cur) {
    if (!item || !item.status) return '';
    const c = idx(cur);
    let best = item.status.default || '', bi = -1;
    for (const k of Object.keys(item.status)) {
      if (k === 'default') continue;
      const i = idx(k);
      if (i <= c && i > bi) { bi = i; best = item.status[k]; }
    }
    return best;
  }
  function byId(list, id) { return (list || []).find(x => x.id === id) || null; }

  /* ---------- the transaction spine ---------- */
  const OPEN = ['you', 'team', 'attention'];
  function pick(v, cur) {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      const c = idx(cur); let best, bi = -1;
      for (const k of Object.keys(v)) { const i = idx(k); if (i <= c && i > bi) { bi = i; best = v[k]; } }
      return best;
    }
    return v;
  }
  function cpStatus(cp, cur) {
    const c = idx(cur); let best = null, bi = -1;
    for (const k of Object.keys(cp.status || {})) { const i = idx(k); if (i <= c && i > bi) { bi = i; best = cp.status[k]; } }
    return best ? { bucket: best[0], text: best[1] } : { bucket: 'todo', text: '' };
  }
  function stepStatus(step, cur) {
    const b = step.checkpoints.map(cp => cpStatus(cp, cur).bucket);
    if (b.every(x => x === 'confirmed')) return 'confirmed';
    if (b.some(x => x === 'attention')) return 'attention';
    if (b.some(x => x === 'you')) return 'you';
    if (b.some(x => x === 'team')) return 'team';
    return 'todo';
  }
  function phaseOf(stepId) { const p = SPINE.phases.find(p => p.steps.includes(stepId)); return p ? p.id : null; }
  function spine(cur) {
    const steps = SPINE.steps.map(st => {
      const checkpoints = st.checkpoints.map(cp => Object.assign({}, cp, cpStatus(cp, cur), { step: st.id, action: pick(cp.action, cur), detail: pick(cp.detail, cur), opens: pick(cp.opens, cur), date: pick(cp.date, cur), source: pick(cp.source, cur) }));
      return Object.assign({}, st, { checkpoints, status: stepStatus(st, cur), phase: phaseOf(st.id), done: checkpoints.filter(c => c.bucket === 'confirmed').length, total: checkpoints.length });
    });
    const all = steps.flatMap(s => s.checkpoints);
    const next = all.find(c => c.bucket === 'attention') || all.find(c => c.bucket === 'you') || all.find(c => c.bucket === 'team') || null;
    const current = next ? steps.find(s => s.id === next.step) : null;
    const phases = SPINE.phases.map(p => {
      const ss = steps.filter(s => p.steps.includes(s.id));
      return { id: p.id, label: p.label, steps: p.steps, done: ss.filter(s => s.status === 'confirmed').length, total: ss.length, open: ss.filter(s => OPEN.includes(s.status)).length, now: !!current && p.steps.includes(current.id) };
    });
    return { phases, steps, next, current, terminal: !next, started: all.some(c => c.bucket !== 'todo') };
  }
  return { keys, PHASES, idx, stage, next, prev, phaseIndex, parseHash, buildHash, current, visible, statusAt, byId, spine, stepStatus, phaseOf };
})();
