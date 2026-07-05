// ── Logistic regression ──
function logit(z) { return 1 / (1 + Math.exp(-z)); }

function computeProb(cs, income, loan, dti, emp, delinq, purpose) {
  const z = COEFFICIENTS.intercept
    + COEFFICIENTS.creditScore * (cs - 580)
    + COEFFICIENTS.income      * (income / 1000)
    + COEFFICIENTS.loanAmt     * (loan   / 1000)
    + COEFFICIENTS.dti         * dti
    + COEFFICIENTS.empLen      * emp
    + COEFFICIENTS.delinq      * delinq
    + PURPOSE_RISK[purpose]    * 2;
  return logit(z);
}

// ── SHAP-style attribution ──
// Approximates marginal contribution of each feature vs. baseline (average applicant)
function computeShap(cs, income, loan, dti, emp, delinq, purpose) {
  const baseProb = computeProb(680, 65000, 18000, 28, 5, 0, 0);

  return [
    {
      name: 'Credit score',
      raw: cs,
      display: cs,
      shap: computeProb(cs, 65000, 18000, 28, 5, 0, 0) - baseProb,
      impact: cs >= 720 ? 'positive' : cs >= 640 ? 'neutral' : 'negative',
    },
    {
      name: 'Annual income',
      raw: income,
      display: '$' + (income / 1000).toFixed(0) + 'K',
      shap: computeProb(680, income, 18000, 28, 5, 0, 0) - baseProb,
      impact: income >= 80000 ? 'positive' : income >= 45000 ? 'neutral' : 'negative',
    },
    {
      name: 'Loan amount',
      raw: loan,
      display: '$' + (loan / 1000).toFixed(0) + 'K',
      shap: computeProb(680, 65000, loan, 28, 5, 0, 0) - baseProb,
      impact: loan <= 12000 ? 'positive' : loan <= 25000 ? 'neutral' : 'negative',
    },
    {
      name: 'Debt-to-income',
      raw: dti,
      display: dti + '%',
      shap: computeProb(680, 65000, 18000, dti, 5, 0, 0) - baseProb,
      impact: dti <= 20 ? 'positive' : dti <= 35 ? 'neutral' : 'negative',
    },
    {
      name: 'Employment length',
      raw: emp,
      display: emp + ' yrs',
      shap: computeProb(680, 65000, 18000, 28, emp, 0, 0) - baseProb,
      impact: emp >= 7 ? 'positive' : emp >= 3 ? 'neutral' : 'negative',
    },
    {
      name: 'Delinquencies',
      raw: delinq,
      display: delinq,
      shap: computeProb(680, 65000, 18000, 28, 5, delinq, 0) - baseProb,
      impact: delinq === 0 ? 'positive' : delinq <= 1 ? 'neutral' : 'negative',
    },
    {
      name: 'Loan purpose',
      raw: purpose,
      display: PURPOSE_NAMES[purpose].split(' ')[0],
      shap: computeProb(680, 65000, 18000, 28, 5, 0, purpose) - baseProb,
      impact: PURPOSE_RISK[purpose] < 0 ? 'positive' : PURPOSE_RISK[purpose] > 0.05 ? 'negative' : 'neutral',
    },
  ];
}

// ── Predict ──
function predict() {
  const cs     = +document.getElementById('creditScore').value;
  const income = +document.getElementById('income').value || 0;
  const loan   = +document.getElementById('loanAmt').value || 0;
  const dti    = +document.getElementById('dti').value;
  const emp    = +document.getElementById('empLen').value;
  const delinq = +document.getElementById('delinq').value;
  const purpose= +document.getElementById('purpose').value;

  const prob = computeProb(cs, income, loan, dti, emp, delinq, purpose);
  const pct  = Math.round(prob * 100);

  let cls, icon, label, sub;
  if (prob < 0.25)      { cls = 'approve'; icon = '✓'; label = 'Approved';       sub = 'Low default risk — meets lending criteria'; }
  else if (prob < 0.50) { cls = 'review';  icon = '⚠'; label = 'Manual review';  sub = 'Moderate risk — requires underwriter review'; }
  else                  { cls = 'decline'; icon = '✕'; label = 'Declined';       sub = 'High default risk — does not meet criteria'; }

  const probColor = prob >= 0.5 ? '#b31d1d' : prob >= 0.25 ? '#92490e' : '#0a7c4a';
  const fillColor = prob >= 0.5 ? '#e34948' : prob >= 0.25 ? '#eda100' : '#0a7c4a';

  document.getElementById('resultBox').outerHTML = `
    <div id="resultBox">
      <div class="result-box ${cls}">
        <div class="result-icon">${icon}</div>
        <div>
          <div class="result-decision">Decision</div>
          <div class="result-title">${label}</div>
          <div class="result-sub">${sub}</div>
        </div>
      </div>
      <div class="prob-wrap">
        <div class="prob-header">
          <span style="color:var(--text-secondary);font-size:13px">Default probability</span>
          <span class="prob-pct" style="color:${probColor}">${pct}%</span>
        </div>
        <div class="prob-track">
          <div class="prob-fill" style="width:${pct}%; background:${fillColor}"></div>
        </div>
        <div class="prob-sublabels"><span>0% — no risk</span><span>25% threshold</span><span>50% threshold</span><span>100%</span></div>
      </div>
    </div>`;

  const shap = computeShap(cs, income, loan, dti, emp, delinq, purpose);
  document.getElementById('shapWrap').innerHTML = shap.map(f => `
    <div class="shap-row">
      <span class="shap-name">${f.name}</span>
      <div class="shap-right">
        <span class="shap-val">${f.display}</span>
        <span class="badge ${f.impact === 'positive' ? 'badge-pos' : f.impact === 'negative' ? 'badge-neg' : 'badge-neu'}">
          ${f.impact === 'positive' ? '↓ risk' : f.impact === 'negative' ? '↑ risk' : 'neutral'}
        </span>
      </div>
    </div>
  `).join('');
}

// ── Load sample ──
function loadSample(type) {
  const s = SAMPLES[type];
  document.getElementById('creditScore').value = s.cs;
  document.getElementById('csVal').textContent = s.cs;
  document.getElementById('income').value = s.income;
  document.getElementById('loanAmt').value = s.loan;
  document.getElementById('dti').value = s.dti;
  document.getElementById('dtiVal').textContent = s.dti + '%';
  document.getElementById('empLen').value = s.emp;
  document.getElementById('empVal').textContent = s.emp + ' years';
  document.getElementById('delinq').value = s.delinq;
  document.getElementById('delinqVal').textContent = s.delinq;
  document.getElementById('purpose').value = s.purpose;
  predict();
}

// ── Portfolio tab ──
function initPortfolio() {
  const rows = PORTFOLIO.map(p => ({
    ...p,
    prob: computeProb(p.cs, p.income, p.loan, p.dti, p.emp, p.delinq, p.purpose),
  }));

  const approved = rows.filter(r => r.prob < 0.25).length;
  const review   = rows.filter(r => r.prob >= 0.25 && r.prob < 0.5).length;
  const declined = rows.filter(r => r.prob >= 0.5).length;
  const avgProb  = Math.round(rows.reduce((a, r) => a + r.prob, 0) / rows.length * 100);

  document.getElementById('portfolioKPIs').innerHTML = [
    { label: 'Total applicants', val: rows.length, cls: '' },
    { label: 'Approved',         val: approved,    cls: 'green' },
    { label: 'Manual review',    val: review,      cls: 'orange' },
    { label: 'Avg default prob', val: avgProb + '%', cls: '' },
  ].map(k => `
    <div class="kpi">
      <div class="kpi-label">${k.label}</div>
      <div class="kpi-value ${k.cls}">${k.val}</div>
    </div>`).join('');

  document.getElementById('portfolioTable').innerHTML = `
    <table class="loan-table">
      <thead>
        <tr>
          <th>ID</th><th>Applicant</th><th>Credit score</th>
          <th>Income</th><th>Loan amt</th><th>Default prob</th><th>Decision</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map(r => {
          const pct = Math.round(r.prob * 100);
          const fillColor = r.prob >= 0.5 ? '#e34948' : r.prob >= 0.25 ? '#eda100' : '#0a7c4a';
          const dec = r.prob < 0.25 ? 'approve' : r.prob < 0.5 ? 'review' : 'decline';
          const decLabel = r.prob < 0.25 ? 'Approved' : r.prob < 0.5 ? 'Review' : 'Declined';
          return `<tr>
            <td class="mono" style="font-size:12px;color:var(--text-muted)">${r.id}</td>
            <td style="font-weight:500;font-size:13px">${r.name}</td>
            <td class="mono">${r.cs}</td>
            <td class="mono">$${(r.income / 1000).toFixed(0)}K</td>
            <td class="mono">$${(r.loan / 1000).toFixed(0)}K</td>
            <td>
              <div style="display:flex;align-items:center;gap:0">
                <span class="mini-bar-track"><span class="mini-bar-fill" style="width:${pct}%;background:${fillColor}"></span></span>
                <span class="mono" style="font-size:12px;font-weight:500">${pct}%</span>
              </div>
            </td>
            <td><span class="badge badge-${dec}">${decLabel}</span></td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>`;
}

// ── Model performance tab ──
let charts = {};

function initModelPerf() {
  document.getElementById('modelKPIs').innerHTML = [
    { label: 'AUC-ROC',   val: MODEL_METRICS.auc.toFixed(2) },
    { label: 'Accuracy',  val: (MODEL_METRICS.accuracy * 100).toFixed(1) + '%' },
    { label: 'Precision', val: (MODEL_METRICS.precision * 100).toFixed(1) + '%' },
    { label: 'Recall',    val: (MODEL_METRICS.recall * 100).toFixed(1) + '%' },
  ].map(k => `
    <div class="kpi">
      <div class="kpi-label">${k.label}</div>
      <div class="kpi-value">${k.val}</div>
    </div>`).join('');

  if (charts.feature) charts.feature.destroy();
  charts.feature = new Chart(document.getElementById('featureChart'), {
    type: 'bar',
    data: {
      labels: FEATURE_IMPORTANCE.map(f => f.name),
      datasets: [{
        data: FEATURE_IMPORTANCE.map(f => f.importance),
        backgroundColor: '#2a78d6',
        borderRadius: 4,
        borderSkipped: 'left',
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: c => ` ${(c.raw * 100).toFixed(0)}% importance` } }
      },
      scales: {
        x: { grid: { color: '#e1e0d9' }, border: { display: false }, ticks: { color: '#898781', font: { size: 11 }, callback: v => (v * 100).toFixed(0) + '%' } },
        y: { grid: { display: false }, ticks: { color: '#898781', font: { size: 11 } }, border: { color: '#e1e0d9' } }
      }
    }
  });

  if (charts.roc) charts.roc.destroy();
  charts.roc = new Chart(document.getElementById('rocChart'), {
    type: 'line',
    data: {
      labels: ROC_CURVE.fpr.map(v => v.toFixed(2)),
      datasets: [
        {
          label: 'Model (AUC=0.87)',
          data: ROC_CURVE.tpr,
          borderColor: '#2a78d6',
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
          tension: 0.35,
        },
        {
          label: 'Random baseline',
          data: ROC_CURVE.fpr,
          borderColor: '#c3c2b7',
          borderWidth: 1.5,
          borderDash: [5, 4],
          pointRadius: 0,
          fill: false,
        },
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: c => `${c.dataset.label}: ${c.raw.toFixed(2)}` } }
      },
      scales: {
        x: { grid: { color: '#e1e0d9' }, border: { color: '#c3c2b7' }, ticks: { color: '#898781', font: { size: 10 }, maxTicksLimit: 6 }, title: { display: true, text: 'False positive rate', color: '#898781', font: { size: 11 } } },
        y: { grid: { color: '#e1e0d9' }, border: { display: false }, ticks: { color: '#898781', font: { size: 10 } }, title: { display: true, text: 'True positive rate', color: '#898781', font: { size: 11 } } }
      }
    }
  });

  const cm = MODEL_METRICS.confusionMatrix;
  document.getElementById('confMatrix').innerHTML = `
    <div class="conf-grid">
      <div></div>
      <div class="conf-label">Predicted: no default</div>
      <div class="conf-label">Predicted: default</div>
      <div class="conf-label" style="writing-mode:vertical-rl;transform:rotate(180deg)">Actual: no default</div>
      <div class="conf-cell conf-tn"><div class="num">${cm.tn.toLocaleString()}</div><div class="lbl">True negatives</div></div>
      <div class="conf-cell conf-fp"><div class="num">${cm.fp.toLocaleString()}</div><div class="lbl">False positives</div></div>
      <div class="conf-label" style="writing-mode:vertical-rl;transform:rotate(180deg)">Actual: default</div>
      <div class="conf-cell conf-fn"><div class="num">${cm.fn.toLocaleString()}</div><div class="lbl">False negatives</div></div>
      <div class="conf-cell conf-tp"><div class="num">${cm.tp.toLocaleString()}</div><div class="lbl">True positives</div></div>
    </div>`;
}

// ── Tab switching ──
function switchTab(id) {
  document.querySelectorAll('.tab').forEach((t, i) =>
    t.classList.toggle('active', ['predict', 'portfolio', 'model'][i] === id));
  document.querySelectorAll('.panel').forEach((p, i) =>
    p.classList.toggle('active', ['panel-predict', 'panel-portfolio', 'panel-model'][i] === 'panel-' + id));

  if (id === 'portfolio') initPortfolio();
  if (id === 'model') initModelPerf();
  setTimeout(() => Object.values(charts).forEach(c => { try { c.resize(); } catch(e) {} }), 10);
}
