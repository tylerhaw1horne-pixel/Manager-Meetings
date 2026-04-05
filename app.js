// ═══════════════════════════════════════════════
//  Huey Luey's Acworth — Weekly Ops Dashboard
// ═══════════════════════════════════════════════

const TAX = 0.1453;

const SALE_C = [
  { id: 's',        l: 'Total Sales' },
  { id: 'cat',      l: 'Catering Sales' },
  { id: 'rft',      l: 'RFT (Rooftop) Sales' },
  { id: 'togo',     l: 'ToGo Sales' },
  { id: 'patio',    l: 'Patio Sales' },
  { id: 'bhb_sale', l: 'Beach House Bar' },
];

const COST_C = [
  { id: 'food', l: 'Food Cost' },
  { id: 'lbw',  l: 'LBW (Liquor / Beer / Wine)' },
  { id: 'pcc',  l: 'Paper / Catering / Cleaning' },
  { id: 'nab',  l: 'N/A Bev Cost' },
];

const MEET_C = [
  { id: 'ms',    l: 'Total Sales' },
  { id: 'mcat',  l: 'Catering Sales' },
  { id: 'mrft',  l: 'Rooftop Sales' },
  { id: 'mtogo', l: 'ToGo Sales' },
  { id: 'mpat',  l: 'Patio Sales' },
  { id: 'mbhb',  l: 'Beach House Bar' },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const ICONS = {
  'sunny': '☀️', 'partly cloudy': '⛅', 'cloudy': '☁️',
  'rain': '🌧️', 'stormy': '⛈️', 'small rain': '🌦️',
  'partly rain': '🌦️', 'party cloudy': '⛅', 'closed': '🚫',
};

// ── Sync map: ops field id → meeting field id ──────────────
const SMAP = {
  s_actual: 'ms_act', s_ly: 'ms_ly',
  cat_actual: 'mcat_act', cat_ly: 'mcat_ly',
  rft_actual: 'mrft_act', rft_ly: 'mrft_ly',
  togo_actual: 'mtogo_act', togo_ly: 'mtogo_ly',
  patio_actual: 'mpat_act', patio_ly: 'mpat_ly',
  bhb_sale_actual: 'mbhb_act', bhb_sale_ly: 'mbhb_ly',
  lab_sales: 'm_lab_s', lab_dollars: 'm_lab_d',
  lab_actual: 'm_labor', lab_proj: 'm_labor_p',
  food_sales: 'm_food_sales', food_spent: 'm_food_spent', food_proj: 'm_food_proj',
  lbw_sales: 'm_lbw_sales', lbw_spent: 'm_lbw_spent', lbw_proj: 'm_lbw_proj',
  pcc_sales: 'm_pcc_sales', pcc_spent: 'm_pcc_spent', pcc_proj: 'm_pcc_proj',
  nab_sales: 'm_nab_sales', nab_spent: 'm_nab_spent', nab_proj: 'm_nab_proj',
  ppa_actual: 'm_ppa', ppa_ly: 'm_ppa_ly',
  disc_r: 'm_disc_r', disc_e: 'm_disc_e', disc_o: 'm_disc_o',
  loyalty: 'm_loyalty', rev5: 'm_rev5', rev4: 'm_rev4',
  rev_win: 'm_emp', rev_wct: 'm_emp_q',
  mom_name: 'm_mom', mom_wk: 'm_mom_wk', mom_total: 'm_mom_t',
  mom_emp: 'm_mom_win', mom_ewk: 'm_mwwk', mom_etot: 'm_mwtot',
  float_wk: 'm_flt_wk', float_total: 'm_flt_t',
  togo_margs: 'm_togo_m', desserts: 'm_desserts',
  sl_wk: 'm_sl_wk', sl_tot: 'm_sl_t',
  bhb_s: 'm_bhb_s', bhb_ly: 'm_bhb_ly', bhb_proj: 'm_bhb_proj',
  bhb_mt: 'm_bhb_mt', bhb_pc: 'm_bhb_pc', bhb_ld: 'm_bhb_ld',
  bhb_br: 'm_bhb_br', bhb_fp: 'm_bhb_fp',
};

// ── Helpers ─────────────────────────────────────────────────
const gi = id => document.getElementById(id);
const gv = id => gi(id)?.value || '';
const fD = n => (!n && n !== 0) ? '—' : '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 });
const fP = (a, b) => {
  if (!a || !b || +b === 0) return null;
  const p = ((+a - +b) / +b * 100);
  return (p >= 0 ? '+' : '') + p.toFixed(1) + '%';
};
const pC = s => s ? (s.startsWith('+') ? 'pos' : 'neg') : '';
const gIcon = c => {
  if (!c) return '🌤️';
  const k = c.toLowerCase();
  for (const [n, v] of Object.entries(ICONS)) if (k.includes(n)) return v;
  return '🌤️';
};

// ── Build sale rows ─────────────────────────────────────────
function buildSaleRows() {
  const c = gi('saleRows'); if (!c) return;
  c.innerHTML = SALE_C.map(({ id, l }) => {
    const isBHB = id === 'bhb_sale';
    const style = isBHB ? 'style="background:linear-gradient(90deg,#fff8f0,transparent);border-radius:5px;padding:2px 4px"' : '';
    const labelStyle = isBHB ? 'style="font-size:11px;color:#7a3e00;font-weight:600"' : 'style="font-size:11px"';
    const inputStyle = isBHB ? 'style="border-color:#e8c49a"' : '';
    return `<div ${style} style="display:grid;grid-template-columns:136px 1fr 1fr 1fr 78px 8px 1fr 1fr 78px;gap:4px;align-items:center;margin-bottom:4px">
      <div ${labelStyle}>${isBHB ? '🌴 ' : ''}${l}</div>
      <input type="number" id="${id}_proj" ${inputStyle} oninput="calcSales()"/>
      <input type="number" id="${id}_ly" ${inputStyle} oninput="calcSales()"/>
      <input type="number" id="${id}_actual" ${inputStyle} oninput="calcSales();${isBHB ? 'syncBHBSales()' : 'syncLabSales()'}"/>
      <div id="${id}_pct" class="chip">—</div>
      <div class="vsep"></div>
      <input type="number" id="${id}_cproj" ${inputStyle}/>
      <input type="number" id="${id}_cly" ${inputStyle}/>
      <div id="${id}_cpct" class="chip">—</div>
    </div>`;
  }).join('');
}

// ── Build cost boxes ────────────────────────────────────────
function buildCostBoxes(cid, pfx) {
  const c = gi(cid); if (!c) return;
  c.innerHTML = COST_C.map(({ id, l }) => `
    <div class="ccb">
      <div style="font-size:10px;font-weight:600;margin-bottom:.4rem;color:var(--text)">${l} <span class="ab">$ ÷ sales = %</span>${pfx ? '<span class="sb">← synced</span>' : ''}</div>
      <div class="ccr">
        <div class="fg" style="margin-bottom:0"><label>Total Sales ($)</label><input type="number" id="${pfx}${id}_sales" oninput="calcCost('${pfx}${id}')"/><div style="font-size:9px;color:var(--text3);margin-top:1px">Auto-fills from sales</div></div>
        <div class="fg" style="margin-bottom:0"><label>$ Purchased / Spent</label><input type="number" id="${pfx}${id}_spent" step="0.01" oninput="calcCost('${pfx}${id}')"/></div>
        <div class="fg" style="margin-bottom:0"><label>% Proj</label><input type="number" id="${pfx}${id}_proj" step="0.1" oninput="calcCost('${pfx}${id}')"/></div>
        <div class="crp"><div class="cl">Actual %</div><div class="cv" id="${pfx}${id}_po">—</div></div>
        <div class="crp"><div class="cl">vs Proj</div><div class="cv" id="${pfx}${id}_do" style="font-size:12px">—</div></div>
      </div>
    </div>`).join('');
}

// ── Build meeting metric rows ────────────────────────────────
function buildMeetRows() {
  const c = gi('mMetRows'); if (!c) return;
  c.innerHTML = MEET_C.map(({ id, l }) => {
    const isBHB = id === 'mbhb';
    const s = isBHB ? 'style="background:linear-gradient(90deg,#fff8f0,transparent);border-radius:4px;padding:2px 4px"' : '';
    const ls = isBHB ? 'style="font-size:11px;color:#7a3e00;font-weight:600"' : 'style="font-size:11px"';
    return `<div ${s} style="display:grid;grid-template-columns:130px 1fr 1fr 78px;gap:5px;align-items:center;margin-bottom:4px">
      <div ${ls}>${isBHB ? '🌴 ' : ''}${l}</div>
      <input type="number" id="${id}_act" oninput="calcMPcts()"/>
      <input type="number" id="${id}_ly" oninput="calcMPcts()"/>
      <div id="${id}_pct" class="chip">—</div>
    </div>`;
  }).join('');
}

// ── Build weather inputs ─────────────────────────────────────
function buildWeather() {
  const g = gi('wInputs'); if (!g) return;
  g.innerHTML = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:7px">' +
    DAYS.map(d => `
      <div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius-sm);padding:8px">
        <div style="font-size:10px;font-weight:700;margin-bottom:4px;color:var(--text)">${d}</div>
        <input type="text" id="w_c_${d}" placeholder="Condition" style="margin-bottom:3px"/>
        <div style="display:flex;gap:3px;margin-bottom:3px">
          <input type="number" id="w_h_${d}" placeholder="H°F" style="width:50%"/>
          <input type="number" id="w_l_${d}" placeholder="L°F" style="width:50%"/>
        </div>
        <textarea id="w_i_${d}" placeholder="Itinerary..." style="min-height:42px;font-size:10px"></textarea>
      </div>`).join('') + '</div>';
}

// ── Calculations ─────────────────────────────────────────────
function calcCost(fid) {
  const s = +gi(fid + '_sales')?.value || 0;
  const sp = +gi(fid + '_spent')?.value || 0;
  const pr = +gi(fid + '_proj')?.value || 0;
  const po = gi(fid + '_po'), dout = gi(fid + '_do');
  if (!s || !sp) { if (po) po.textContent = '—'; if (dout) { dout.textContent = '—'; dout.style.color = ''; } return; }
  const pct = (sp / s) * 100;
  if (po) po.textContent = pct.toFixed(2) + '%';
  if (pr && dout) {
    const d = pct - pr;
    dout.textContent = (d > 0 ? '+' : '') + d.toFixed(2) + 'pp';
    dout.style.color = d > 0 ? '#c0392b' : 'var(--green)';
  } else if (dout) { dout.textContent = '—'; dout.style.color = ''; }
}

function syncLabSales() {
  const v = gv('s_actual');
  const e = gi('lab_sales'); if (e && v) { e.value = v; calcLabor(); }
  COST_C.forEach(({ id }) => { const el = gi(id + '_sales'); if (el && !el.dataset.m) el.value = v || ''; calcCost(id); });
}

function syncBHBSales() {
  const v = gv('bhb_sale_actual');
  const bs = gi('bhb_s'); if (bs && v && !bs.value) { bs.value = v; calcBHB(); }
}

function calcLabor() {
  const s = +gv('lab_sales'), d = +gv('lab_dollars'), p = +gv('lab_actual'), pr = +gv('lab_proj');
  let base = 0, src = '';
  if (d && s) { base = (d / s) * 100; src = fD(d) + ' ÷ ' + fD(s); }
  else if (p) { base = p; src = 'from % entered'; }
  const res = gi('laborRes'); if (!base) { if (res) res.style.display = 'none'; return; }
  if (res) res.style.display = 'grid';
  if (d && s && !p) { const el = gi('lab_actual'); if (el) el.value = base.toFixed(2); }
  const wt = base * (1 + TAX);
  gi('lr_base').textContent = base.toFixed(2) + '%'; gi('lr_bs').textContent = src;
  gi('lr_tax').textContent = wt.toFixed(2) + '%';
  const e3 = gi('lr_proj');
  if (pr && e3) { const dv = wt - pr; e3.textContent = (dv > 0 ? '+' : '') + dv.toFixed(2) + 'pp'; e3.className = 'lv ' + (dv > 0 ? 'neg' : 'pos'); gi('lr_ps').textContent = 'vs proj ' + pr + '%'; }
  else if (e3) { e3.textContent = '—'; e3.className = 'lv'; }
}

function calcMLab() {
  const s = +gv('m_lab_s'), d = +gv('m_lab_d'), p = +gv('m_labor'), pr = +gv('m_labor_p');
  let base = 0, src = '';
  if (d && s) { base = (d / s) * 100; src = fD(d) + ' ÷ ' + fD(s); }
  else if (p) { base = p; src = 'from % entered'; }
  const res = gi('mLaborRes'); if (!base) { if (res) res.style.display = 'none'; return; }
  if (res) res.style.display = 'grid';
  const wt = base * (1 + TAX);
  gi('ml_base').textContent = base.toFixed(2) + '%'; gi('ml_bs').textContent = src;
  gi('ml_tax').textContent = wt.toFixed(2) + '%';
  const e3 = gi('ml_proj');
  if (pr && e3) { const dv = wt - pr; e3.textContent = (dv > 0 ? '+' : '') + dv.toFixed(2) + 'pp'; e3.className = 'lv ' + (dv > 0 ? 'neg' : 'pos'); gi('ml_ps').textContent = 'vs proj ' + pr + '%'; }
  else if (e3) { e3.textContent = '—'; e3.className = 'lv'; }
}

function calcSales() {
  SALE_C.forEach(({ id }) => {
    const p = fP(gv(id + '_actual'), gv(id + '_ly'));
    const e = gi(id + '_pct'); if (e) { e.textContent = p || '—'; e.className = 'chip ' + (p ? pC(p) : ''); }
  });
  const gcp = fP(gv('gc_actual'), gv('gc_ly')); const gce = gi('gc_pct'); if (gce) { gce.textContent = gcp || '—'; gce.className = 'chip ' + (gcp ? pC(gcp) : ''); }
  const pp = fP(gv('ppa_actual'), gv('ppa_ly')); const ppe = gi('ppa_pct'); if (ppe) { ppe.textContent = pp || '—'; ppe.className = 'chip ' + (pp ? pC(pp) : ''); }
}

function calcMPcts() {
  MEET_C.forEach(({ id }) => {
    const p = fP(gv(id + '_act'), gv(id + '_ly')); const e = gi(id + '_pct');
    if (e) { e.textContent = p || '—'; e.className = 'chip ' + (p ? pC(p) : ''); }
  });
  const pp = fP(gv('m_ppa'), gv('m_ppa_ly')); const e = gi('m_ppa_pct');
  if (e) { e.textContent = pp || '—'; e.className = 'chip ' + (pp ? pC(pp) : ''); }
  const r = +gv('m_disc_r'), ez = +gv('m_disc_e'), o = +gv('m_disc_o'), t = r + ez + o;
  const dt = gi('m_disc_t'); if (dt) dt.textContent = t > 0 ? fD(t) : '—';
}

function calcDisc() {
  const t = (+gv('disc_r')) + (+gv('disc_e')) + (+gv('disc_o'));
  const e = gi('disc_t'); if (e) e.textContent = t > 0 ? fD(t) : '—';
}

function calcBHB() {
  const ids = ['bhb_mt', 'bhb_pc', 'bhb_ld', 'bhb_br', 'bhb_fp'];
  const tot = ids.reduce((s, id) => s + (+gv(id) || 0), 0);
  const tc = gi('bhb_tot'); if (tc) { tc.style.display = tot > 0 ? 'inline-block' : 'none'; tc.textContent = tot + ' items sold'; }
  const p = fP(gv('bhb_s'), gv('bhb_ly')); const vc = gi('bhb_vsly');
  if (vc) { vc.style.display = p ? 'inline-block' : 'none'; vc.textContent = p || ''; vc.className = 'chip ' + (p ? pC(p) : ''); }
  // mirror to sales table
  const sa = gi('bhb_sale_actual'); if (sa && gv('bhb_s') && !sa.value) { sa.value = gv('bhb_s'); calcSales(); }
  const sl = gi('bhb_sale_ly'); if (sl && gv('bhb_ly') && !sl.value) { sl.value = gv('bhb_ly'); calcSales(); }
}

function calcMBHB() {
  const p = fP(gv('m_bhb_s'), gv('m_bhb_ly')); const e = gi('m_bhb_vsly');
  if (e) { e.textContent = p || '—'; e.className = 'chip ' + (p ? pC(p) : ''); }
  const ma = gi('mbhb_act'); if (ma && gv('m_bhb_s') && !ma.value) { ma.value = gv('m_bhb_s'); calcMPcts(); }
  const ml = gi('mbhb_ly'); if (ml && gv('m_bhb_ly') && !ml.value) { ml.value = gv('m_bhb_ly'); calcMPcts(); }
}

// ── SYNC ops → meeting ───────────────────────────────────────
function syncToMeet() {
  if (gi('meeting-form-view').style.display === 'none') showNewMeet();
  document.querySelectorAll('input.synced').forEach(e => e.classList.remove('synced'));
  let n = 0;
  Object.entries(SMAP).forEach(([s, d]) => {
    const se = gi(s), de = gi(d);
    if (se && de && se.value) { de.value = se.value; de.classList.add('synced'); n++; }
  });
  calcMPcts(); calcMLab(); calcMBHB();
  COST_C.forEach(({ id }) => calcCost('m_' + id));
  const b = gi('m_sync_banner'); if (b) b.style.display = 'block';
  const sn = gi('syncNote'); if (sn) { sn.style.display = 'block'; sn.textContent = `✓ ${n} fields synced to Manager Meeting.`; }
  showTab('meet', null);
  gi('meeting-list-view').style.display = 'none';
  gi('meeting-detail-view').style.display = 'none';
  gi('meeting-form-view').style.display = 'block';
}

// ── DATA PERSISTENCE ─────────────────────────────────────────
const KEY = 'hl_ops_v1';
function getData() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; } }
function setData(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function getWeeks() { return getData().weeks || []; }
function getMeets() { return getData().meets || []; }
function saveWks(w) { const d = getData(); d.weeks = w; setData(d); }
function saveMts(m) { const d = getData(); d.meets = m; setData(d); }

const ONUMS = ['s_proj','s_ly','s_actual','s_cproj','s_cly','cat_proj','cat_ly','cat_actual','cat_cproj','cat_cly','rft_proj','rft_ly','rft_actual','rft_cproj','rft_cly','togo_proj','togo_ly','togo_actual','togo_cproj','togo_cly','patio_proj','patio_ly','patio_actual','patio_cproj','patio_cly','bhb_sale_proj','bhb_sale_ly','bhb_sale_actual','bhb_sale_cproj','bhb_sale_cly','gc_proj','gc_ly','gc_actual','gc_cproj','gc_cly','ppa_proj','ppa_ly','ppa_actual','ppa_cproj','ppa_cly','lab_sales','lab_dollars','lab_actual','lab_proj','food_sales','food_spent','food_proj','lbw_sales','lbw_spent','lbw_proj','pcc_sales','pcc_spent','pcc_proj','nab_sales','nab_spent','nab_proj','splh_proj','splh_actual','splh_cproj','ot_sched','ot_actual','ot_curr','disc_r','disc_e','disc_o','marg_house','marg16','marg22','marg32','pitchers','togo_margs','float_wk','float_total','mom_wk','mom_total','mom_ewk','mom_etot','bhb_s','bhb_ly','bhb_proj','bhb_mt','bhb_pc','bhb_ld','bhb_br','bhb_fp','mimosas','mim_fl','brunch','tacos','fajitas','faj_dur','faj_hue','faj_bac','bighuey','sl_wk','sl_tot','desserts','kids','rev5','rev4','rev_wct','loyalty','emp_wk','emp_tot'];
const OTXTS = ['gm_hrs','walkthroughs','marketing','training','projects','mom_name','mom_emp','rev_win','emp_name'];

function getOpsData() {
  const d = {};
  ONUMS.forEach(f => { const e = gi(f); if (e) d[f] = e.value; });
  OTXTS.forEach(f => { const e = gi(f); if (e) d[f] = e.value; });
  const b = +gv('lab_actual'); if (b) d.lab_wtax = (b * (1 + TAX)).toFixed(2);
  COST_C.forEach(({ id }) => { const sp = +gv(id + '_spent'), sa = +gv(id + '_sales'); if (sp && sa) d[id + '_pct'] = ((sp / sa) * 100).toFixed(2); });
  return d;
}
function setOpsData(data) {
  ONUMS.forEach(f => { const e = gi(f); if (e) e.value = data[f] || ''; });
  OTXTS.forEach(f => { const e = gi(f); if (e) e.value = data[f] || ''; });
  calcSales(); calcDisc(); calcLabor(); calcBHB(); COST_C.forEach(({ id }) => calcCost(id));
}

function saveWeek() {
  const date = gv('weekDate'); if (!date) { alert('Select a week date.'); return; }
  const wks = getWeeks(); const idx = wks.findIndex(w => w.date === date);
  const entry = { date, ...getOpsData(), savedAt: new Date().toISOString() };
  if (idx >= 0) wks[idx] = entry; else wks.push(entry);
  wks.sort((a, b) => new Date(b.date) - new Date(a.date));
  saveWks(wks); renderHist();
  const sl = gi('weekLabel'); if (sl) sl.textContent = '✓ Saved';
  setTimeout(() => { if (sl) sl.textContent = ''; }, 2000);
}

function loadWeek() {
  const date = gv('weekDate'); if (!date) { alert('Select a date.'); return; }
  const w = getWeeks().find(w => w.date === date);
  if (w) setOpsData(w); else alert('No data saved for that week.');
}

function checkCarry() {
  const date = gv('weekDate'); if (!date) return;
  const wks = getWeeks(); if (!wks.length) return;
  const prev = wks[0];
  const map = { s_actual: 's_ly', cat_actual: 'cat_ly', rft_actual: 'rft_ly', togo_actual: 'togo_ly', patio_actual: 'patio_ly', bhb_sale_actual: 'bhb_sale_ly' };
  let carried = false;
  Object.entries(map).forEach(([a, l]) => { const le = gi(l); if (prev[a] && le && !le.value) { le.value = prev[a]; carried = true; } });
  const n = gi('carryNote'); if (n) n.style.display = carried ? 'block' : 'none';
  if (carried) calcSales();
}

function clearOps() {
  ONUMS.concat(OTXTS).forEach(f => { const e = gi(f); if (e) e.value = ''; });
  calcSales(); calcDisc();
  const r = gi('laborRes'); if (r) r.style.display = 'none';
  gi('carryNote').style.display = 'none'; gi('syncNote').style.display = 'none';
}

function showTab(t, btn) {
  document.querySelectorAll('.sec').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
  gi('sec-' + t).classList.add('active');
  if (btn) btn.classList.add('active');
  else { const m = { ops: 0, meet: 1, hist: 2 }; document.querySelectorAll('.tab')[m[t]]?.classList.add('active'); }
  if (t === 'hist') renderHist();
  if (t === 'meet') renderMeetList();
}

// ── MEETING FORM ─────────────────────────────────────────────
const MNUMS = ['ms_act','ms_ly','mcat_act','mcat_ly','mrft_act','mrft_ly','mtogo_act','mtogo_ly','mpat_act','mpat_ly','mbhb_act','mbhb_ly','m_lab_s','m_lab_d','m_labor','m_labor_p','m_ppa','m_ppa_ly','m_rev5','m_rev4','m_loyalty','m_emp_q','m_mom_wk','m_mom_t','m_mwwk','m_mwtot','m_flt_wk','m_flt_t','m_cat_rev','m_togo_m','m_desserts','m_sl_wk','m_sl_t','m_disc_r','m_disc_e','m_disc_o','m_bhb_s','m_bhb_ly','m_bhb_proj','m_bhb_mt','m_bhb_pc','m_bhb_ld','m_bhb_br','m_bhb_fp'];
COST_C.forEach(({ id }) => MNUMS.push('m_' + id + '_sales', 'm_' + id + '_spent', 'm_' + id + '_proj'));
const MTXTS = ['m_week','m_date','m_boh','m_foh','m_mgr','m_emp','m_mom','m_cat_notes','m_mom_win'];

function getMeetData() {
  const d = {};
  MNUMS.forEach(f => { const e = gi(f); if (e) d[f] = e.value; });
  MTXTS.forEach(f => { const e = gi(f); if (e) d[f] = e.value; });
  const b = +gv('m_labor'); if (b) d.m_wtax = (b * (1 + TAX)).toFixed(2);
  COST_C.forEach(({ id }) => { const sp = +gv('m_' + id + '_spent'), sa = +gv('m_' + id + '_sales'); if (sp && sa) d['m_' + id + '_pct'] = ((sp / sa) * 100).toFixed(2); });
  const weather = {};
  DAYS.forEach(day => { weather[day] = { cond: gv('w_c_' + day), hi: gv('w_h_' + day), lo: gv('w_l_' + day), itin: gv('w_i_' + day) }; });
  d.weather = weather;
  return d;
}

function showNewMeet() {
  gi('meeting-list-view').style.display = 'none';
  gi('meeting-detail-view').style.display = 'none';
  gi('meeting-form-view').style.display = 'block';
  buildWeather(); buildMeetRows(); buildCostBoxes('mCostBoxes', 'm_');
  gi('m_date').value = new Date().toISOString().split('T')[0];
}
function closeMeetForm() { gi('meeting-form-view').style.display = 'none'; gi('meeting-list-view').style.display = 'block'; }
function closeDetail() { gi('meeting-detail-view').style.display = 'none'; gi('meeting-list-view').style.display = 'block'; }

function saveMeet() {
  const data = getMeetData(); if (!data.m_date) { alert('Set a meeting date.'); return; }
  const mts = getMeets(); mts.push({ ...data, savedAt: new Date().toISOString() });
  mts.sort((a, b) => new Date(b.m_date) - new Date(a.m_date));
  saveMts(mts); closeMeetForm(); renderMeetList(); alert('Meeting saved!');
}

function renderMeetList() {
  const mts = getMeets(); const le = gi('meetList'); const ne = gi('noMeet'); if (!le) return;
  if (!mts.length) { le.innerHTML = ''; ne.style.display = 'block'; return; } ne.style.display = 'none';
  le.innerHTML = mts.map((m, i) => {
    const p = fP(m.ms_act, m.ms_ly);
    return `<div class="mi" onclick="viewMeet(${i})">
      <div style="font-size:13px;font-weight:600">${m.m_week || m.m_date}</div>
      <div style="font-size:11px;color:var(--text2);margin-top:2px">Sales: ${fD(m.ms_act)}${p ? ` <span class="${pC(p)}">${p} vs LY</span>` : ''} &nbsp;|&nbsp; Meeting: ${m.m_date}</div>
    </div>`;
  }).join('');
}

function viewMeet(idx) {
  const m = getMeets()[idx]; if (!m) return;
  gi('meeting-list-view').style.display = 'none';
  gi('meeting-detail-view').style.display = 'block';

  gi('meetHdr').innerHTML = `<div style="font-size:18px;font-weight:700;margin-bottom:3px">${m.m_week || m.m_date}</div><div style="font-size:12px;color:var(--text2)">Meeting: ${m.m_date}</div>`;

  let wHtml = '<div class="ct">Weather + Itinerary</div>';
  if (m.weather && DAYS.some(d => m.weather[d] && (m.weather[d].cond || m.weather[d].hi))) {
    wHtml += '<div class="wgrid">';
    DAYS.forEach(day => { const w = m.weather[day] || {}; wHtml += `<div class="wd"><div class="wdn">${day.substring(0, 3)}</div><div class="wdi">${gIcon(w.cond)}</div><div class="wdt">H${w.hi || '—'}/L${w.lo || '—'}</div><div class="wdc">${w.cond || ''}</div>${w.itin ? `<div class="wdit">${w.itin}</div>` : ''}</div>`; });
    wHtml += '</div>';
    if (m.m_cat_rev) wHtml += `<div style="margin-top:.4rem;font-size:12px;font-weight:600">Total Catering: ${fD(m.m_cat_rev)}</div>`;
    if (m.m_cat_notes) wHtml += `<div style="font-size:11px;color:var(--text2)">${m.m_cat_notes}</div>`;
  }
  gi('meetWeather').innerHTML = wHtml;

  const metR = MEET_C.map(({ id, l }) => {
    const p = fP(m[id + '_act'], m[id + '_ly']); const isBHB = id === 'mbhb';
    return `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border)${isBHB ? ';background:linear-gradient(90deg,#fff8f0,transparent);border-radius:3px;padding:4px 5px' : ''}">
      <span style="font-size:11px;color:${isBHB ? '#7a3e00' : 'var(--text2)'}">${isBHB ? '🌴 ' : ''}${l}</span>
      <div><span style="font-size:12px;font-weight:600">${fD(m[id + '_act'])}</span>${p ? `<span style="font-size:10px;margin-left:5px" class="${pC(p)}">${p} vs LY</span>` : ''}</div>
    </div>`;
  }).join('');

  const costR = COST_C.map(({ id, l }) => {
    const pct = m['m_' + id + '_pct'], proj = m['m_' + id + '_proj']; if (!pct) return '';
    const d2 = pct && proj ? (+pct - +proj).toFixed(2) : null;
    return `<div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid var(--border)">
      <span style="font-size:10px;color:var(--text2)">${l}</span>
      <div><span style="font-size:11px;font-weight:600">${pct}%</span>${d2 !== null ? `<span style="font-size:10px;margin-left:4px;color:${+d2 > 0 ? '#c0392b' : 'var(--green)}'>${+d2 > 0 ? '+' : ''}${d2}pp</span>` : ''}</div>
    </div>`;
  }).join('');

  const bhbItems = [['m_bhb_mt','Mai Tai'],['m_bhb_pc','Piña Colada'],['m_bhb_ld','Lemon Drop'],['m_bhb_br','Blueberry'],['m_bhb_fp','Front Porch']];
  const bhbTot = bhbItems.reduce((s, [id]) => s + (+m[id] || 0), 0);
  const bhbPct = fP(m.m_bhb_s, m.m_bhb_ly);
  const bhbHtml = `<div class="bhb-sm"><div class="bhb-sm-title">🌴 Beach House Bar</div>
    <div class="g3" style="gap:5px;margin-bottom:.4rem">
      <div class="met"><label>BHB Sales</label><div class="mv" style="font-size:14px">${fD(m.m_bhb_s)}</div>${bhbPct ? `<div class="ms ${pC(bhbPct)}">${bhbPct} vs LY</div>` : ''}</div>
      <div class="met"><label>BHB Proj</label><div class="mv" style="font-size:14px">${fD(m.m_bhb_proj)}</div></div>
      <div class="met"><label>Total Items</label><div class="mv" style="font-size:14px">${bhbTot}</div></div>
    </div>
    <div class="bhb-sm-items">${bhbItems.map(([id, name]) => `<div class="bhb-sm-item"><span class="bl">${name}</span><span class="bv">${m[id] || '0'}</span></div>`).join('')}</div>
  </div>`;

  const ppaPct = fP(m.m_ppa, m.m_ppa_ly);
  gi('meet-p1-left').innerHTML = `<div class="card">
    <div class="ct">Sales Metrics</div>${metR}
    <div class="div"></div>
    <div class="ct">Labor</div>
    <div class="g2" style="gap:5px">
      <div class="met"><label>Labor % (no tax)</label><div class="mv">${m.m_labor || '—'}%</div></div>
      <div class="met"><label>Labor % WITH Tax (14.53%)</label><div class="mv" style="color:var(--accent)">${m.m_wtax ? m.m_wtax + '%' : '—'}</div></div>
    </div>
    <div class="div"></div>
    <div class="ct">Cost %s</div>${costR || '<div style="font-size:11px;color:var(--text3)">No cost data entered</div>'}
    <div class="div"></div>
    <div class="ct">Discounts</div>
    <div style="font-size:11px">Rewards: ${fD(m.m_disc_r)} &nbsp;|&nbsp; EzCater: ${fD(m.m_disc_e)} &nbsp;|&nbsp; <strong>Total: ${fD((+m.m_disc_r || 0) + (+m.m_disc_e || 0) + (+m.m_disc_o || 0))}</strong></div>
  </div>`;

  gi('meet-p1-right').innerHTML = `<div class="card">
    <div class="ct">Guest Metrics</div>
    <div class="g2" style="gap:5px">
      <div class="met"><label>PPA</label><div class="mv">${m.m_ppa ? fD(m.m_ppa) : '—'}</div><div class="ms ${pC(ppaPct)}">${ppaPct || ''} vs LY</div></div>
      <div class="met"><label>Loyalty Signups</label><div class="mv">${m.m_loyalty || '—'}</div></div>
      <div class="met"><label>Google Reviews</label><div class="mv">5★ ${m.m_rev5 || 0} &nbsp; 4★ ${m.m_rev4 || 0}</div></div>
      <div class="met"><label>Employee Winner</label><div class="mv">${m.m_emp || '—'} (${m.m_emp_q || '—'})</div></div>
    </div>
    <div class="div"></div>
    <div class="ct">Product Mix</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:11px;line-height:1.8">
      ${m.m_mom ? `<div style="color:var(--text2)">MoM Marg:</div><div><strong>${m.m_mom}</strong> — Wk ${m.m_mom_wk || '—'} / Tot ${m.m_mom_t || '—'}</div>` : ''}
      ${m.m_mom_win ? `<div style="color:var(--text2)">MoM Winner:</div><div>${m.m_mom_win} — Wk ${m.m_mwwk || '—'} / Tot ${m.m_mwtot || '—'}</div>` : ''}
      ${m.m_flt_wk ? `<div style="color:var(--text2)">Floaters:</div><div>Wk ${m.m_flt_wk} / Tot ${m.m_flt_t || '—'}</div>` : ''}
      ${m.m_togo_m ? `<div style="color:var(--text2)">ToGo Margs:</div><div>${m.m_togo_m}</div>` : ''}
      ${m.m_desserts ? `<div style="color:var(--text2)">Desserts:</div><div>${m.m_desserts}</div>` : ''}
      ${m.m_sl_wk ? `<div style="color:var(--text2)">Fajita Sliders:</div><div>Wk ${m.m_sl_wk} / Tot ${m.m_sl_t || '—'}</div>` : ''}
    </div>
    ${bhbHtml}
  </div>`;

  const lines = n => Array(n).fill('<span class="note-line"></span>').join('');
  gi('meetNotes').innerHTML = `<div class="card">
    <div class="ct">BOH Focus</div>
    ${m.m_boh ? `<div class="nb"><p>${m.m_boh}</p></div>` : lines(7)}
    <div class="ct" style="margin-top:.6rem">FOH Focus</div>
    ${m.m_foh ? `<div class="nb"><p>${m.m_foh}</p></div>` : lines(7)}
    <div class="ct" style="margin-top:.6rem">Manager Notes / Shoutouts</div>
    ${m.m_mgr ? `<div class="nb"><p>${m.m_mgr}</p></div>` : lines(9)}
    <div style="margin-top:1rem;border-top:1px solid var(--border);padding-top:.5rem;font-size:10px;color:var(--text3);text-align:center">Thoughts and comments? — Huey Luey's Acworth — Confidential</div>
  </div>`;
}

function renderHist() {
  const wks = getWeeks(); const tb = gi('histBody'); const ne = gi('noHist'); if (!tb) return;
  if (!wks.length) { tb.innerHTML = ''; ne.style.display = 'block'; return; } ne.style.display = 'none';
  tb.innerHTML = wks.map(w => {
    const p = fP(w.s_actual, w.s_ly);
    return `<tr>
      <td>${w.date}</td><td>${fD(w.s_actual)}</td><td class="${pC(p)}">${p || '—'}</td>
      <td>${fD(w.cat_actual)}</td><td>${fD(w.rft_actual)}</td><td>${fD(w.togo_actual)}</td><td>${fD(w.patio_actual)}</td>
      <td>${fD(w.bhb_sale_actual)}</td>
      <td>${w.lab_actual ? w.lab_actual + '%' : '—'}</td>
      <td>${w.lab_wtax ? w.lab_wtax + '%' : '—'}</td>
      <td>${w.food_pct ? w.food_pct + '%' : '—'}</td>
      <td>${w.lbw_pct ? w.lbw_pct + '%' : '—'}</td>
      <td>${w.gc_actual ? Number(w.gc_actual).toLocaleString() : '—'}</td>
      <td>${w.ppa_actual ? fD(w.ppa_actual) : '—'}</td>
      <td>${w.loyalty || '—'}</td>
    </tr>`;
  }).join('');
}

function doPrint(type) {
  const orig = document.title;
  document.title = type === 'ops' ? "Huey Luey's Acworth — Operations" : "Huey Luey's Acworth — Manager Meeting";
  document.body.className = type === 'ops' ? 'print-ops' : 'print-meet';
  window.print();
  document.body.className = ''; document.title = orig;
}

// ── Init ─────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  buildSaleRows();
  buildCostBoxes('costBoxes', '');
  const today = new Date(), mon = new Date(today);
  mon.setDate(today.getDate() - today.getDay() + 1);
  gi('weekDate').value = mon.toISOString().split('T')[0];
  renderMeetList();
  renderHist();
});
