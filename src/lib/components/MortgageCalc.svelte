<script>
  import { onMount, afterUpdate } from 'svelte';
  import { showToast } from '$lib/stores/app.js';

  let price = 750000;
  let downPercent = 20;
  let rate = 5.5;
  let years = 25;
  let frequency = 'monthly';
  let loading = false;
  let result = null;
  let chartCanvas;
  let chartInstance = null;
  let Chart;

  onMount(async () => {
    const mod = await import('chart.js/auto');
    Chart = mod.default;
  });

  $: downAmount = Math.round(price * downPercent / 100);
  $: isInsured = downPercent < 20;
  $: cmhcRate = downPercent < 10 ? 4.0 : downPercent < 15 ? 3.1 : downPercent < 20 ? 2.8 : 0;
  $: stressTest = Math.max(rate + 2, 5.25).toFixed(2);

  function calcPayment(principal, annualRate, totalPayments) {
    const r = annualRate / 100 / 12;
    if (r === 0) return principal / totalPayments;
    return principal * r * Math.pow(1+r, totalPayments) / (Math.pow(1+r, totalPayments) - 1);
  }

  function calculate() {
    const principal = price - downAmount;
    const insuredPrincipal = isInsured ? principal * (1 + cmhcRate/100) : principal;
    const effectiveYears = isInsured ? Math.min(years, 25) : years;
    const totalMonths = effectiveYears * 12;
    const monthlyPayment = calcPayment(insuredPrincipal, rate, totalMonths);
    
    const freqMap = { monthly: 1, 'bi-weekly': 26/12, weekly: 52/12 };
    const paymentsPerMonth = freqMap[frequency];
    const adjustedPayment = monthlyPayment / paymentsPerMonth;
    const totalPaid = monthlyPayment * totalMonths;
    const totalInterest = totalPaid - insuredPrincipal;

    // Build yearly chart data
    const chartData = [];
    let balance = insuredPrincipal;
    for (let y = 1; y <= effectiveYears; y++) {
      let yearInterest = 0, yearPrincipal = 0;
      for (let m = 0; m < 12; m++) {
        const interest = balance * (rate/100/12);
        const princ = monthlyPayment - interest;
        yearInterest += interest;
        yearPrincipal += princ;
        balance = Math.max(0, balance - princ);
      }
      chartData.push({ year: y, principal: Math.round(yearPrincipal), interest: Math.round(yearInterest), balance: Math.round(balance) });
    }

    result = {
      monthlyPayment: Math.round(monthlyPayment),
      adjustedPayment: Math.round(adjustedPayment),
      totalInterest: Math.round(totalInterest),
      totalPaid: Math.round(totalPaid),
      insuredPrincipal: Math.round(insuredPrincipal),
      cmhcAmount: Math.round(insuredPrincipal - principal),
      effectiveYears,
      chartData
    };
  }

  afterUpdate(() => {
    if (!result || !chartCanvas || !Chart) return;
    if (chartInstance) chartInstance.destroy();
    chartInstance = new Chart(chartCanvas, {
      type: 'bar',
      data: {
        labels: result.chartData.map(d => `Yr ${d.year}`),
        datasets: [
          {
            label: 'Principal',
            data: result.chartData.map(d => d.principal),
            backgroundColor: '#c9a84c',
            borderRadius: 3,
            stack: 'a'
          },
          {
            label: 'Interest',
            data: result.chartData.map(d => d.interest),
            backgroundColor: '#2a2010',
            borderRadius: 3,
            stack: 'a'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#888', font: { family: 'DM Sans', size: 11 } }
          },
          tooltip: {
            callbacks: {
              label: ctx => ` $${ctx.raw.toLocaleString()}`
            },
            backgroundColor: '#111',
            borderColor: '#1e1c12',
            borderWidth: 1,
            titleColor: '#c9a84c',
            bodyColor: '#e8d5a0'
          }
        },
        scales: {
          x: { ticks: { color: '#555', font: { size: 10 } }, grid: { color: '#1a1a1a' } },
          y: {
            ticks: { color: '#555', font: { size: 10 }, callback: v => `$${(v/1000).toFixed(0)}K` },
            grid: { color: '#1a1a1a' }
          }
        }
      }
    });
  });

  function fmt(n) { return `$${Math.round(n).toLocaleString()}`; }
  function fmtFreq() {
    return frequency === 'monthly' ? 'month' : frequency === 'bi-weekly' ? '2 weeks' : 'week';
  }
</script>

<div class="calc fade-up">
  <div class="two-col">
    <!-- Inputs -->
    <div class="card inputs">
      <div class="section-label">🧮 Mortgage Calculator</div>

      <div class="field">
        <label>Purchase Price</label>
        <div class="input-row">
          <input type="number" bind:value={price} min="100000" step="5000" />
          <span class="input-suffix">{fmt(price)}</span>
        </div>
        <input type="range" class="slider" bind:value={price} min="100000" max="3000000" step="5000" />
      </div>

      <div class="field">
        <label>Down Payment — {downPercent}% ({fmt(downAmount)})</label>
        <input type="range" class="slider" bind:value={downPercent} min="5" max="50" step="1" />
        <div class="row-split">
          <input type="number" bind:value={downPercent} min="5" max="50" step="1" style="width:80px;" />
          <span class="tag" class:warn={isInsured}>{ isInsured ? `CMHC +${cmhcRate}%` : '✓ Conventional' }</span>
        </div>
      </div>

      <div class="field">
        <label>Interest Rate — {rate}%</label>
        <input type="range" class="slider" bind:value={rate} min="1" max="12" step="0.05" />
        <div class="hint">Stress test: {stressTest}%</div>
      </div>

      <div class="field">
        <label>Amortization — {years} years {isInsured && years > 25 ? '(capped at 25 — insured)' : ''}</label>
        <input type="range" class="slider" bind:value={years} min="5" max="30" step="1" />
      </div>

      <div class="field">
        <label>Payment Frequency</label>
        <select bind:value={frequency}>
          <option value="monthly">Monthly</option>
          <option value="bi-weekly">Bi-Weekly</option>
          <option value="weekly">Weekly</option>
        </select>
      </div>

      <button class="btn-gold" on:click={calculate}>Calculate →</button>
    </div>

    <!-- Results -->
    <div class="results-col">
      {#if result}
        <div class="results fade-up">
          <div class="big-payment card">
            <div class="pay-label">Payment per {fmtFreq()}</div>
            <div class="pay-amount">{fmt(result.adjustedPayment)}</div>
            {#if frequency !== 'monthly'}
              <div class="pay-sub">({fmt(result.monthlyPayment)} / month equivalent)</div>
            {/if}
          </div>

          <div class="summary-grid">
            {#each [
              { label:'Purchase Price', value: fmt(price) },
              { label:'Down Payment', value: fmt(downAmount) },
              { label:'Mortgage Principal', value: fmt(result.insuredPrincipal) },
              ...(isInsured ? [{ label:`CMHC Insurance (${cmhcRate}%)`, value: fmt(result.cmhcAmount) }] : []),
              { label:'Total Interest', value: fmt(result.totalInterest) },
              { label:'Total Cost', value: fmt(result.totalPaid + downAmount) }
            ] as row}
              <div class="sum-row">
                <span class="sum-label">{row.label}</span>
                <span class="sum-val" class:gold={row.label.includes('Total')}>{row.value}</span>
              </div>
            {/each}
          </div>
        </div>

        <!-- Chart -->
        <div class="card chart-card">
          <div class="section-label">Principal vs Interest per Year</div>
          <div class="chart-wrap">
            <canvas bind:this={chartCanvas}></canvas>
          </div>
        </div>
      {:else}
        <div class="card placeholder">
          <div class="placeholder-text">
            <div style="font-size:48px;margin-bottom:16px;">🏠</div>
            <div>Adjust the sliders and hit <strong>Calculate</strong> to see your mortgage breakdown.</div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
.calc { display:flex; flex-direction:column; gap:20px; }
.two-col { display:grid; grid-template-columns:360px 1fr; gap:20px; align-items:start; }
@media(max-width:900px){ .two-col { grid-template-columns:1fr; } }
.card { background:#111010; border:1px solid #1e1c12; border-radius:13px; padding:22px; }
.section-label { font-family:'DM Sans',sans-serif; font-size:10px; letter-spacing:2px; color:#c9a84c; text-transform:uppercase; margin-bottom:18px; }
.inputs { display:flex; flex-direction:column; gap:18px; }
.field { display:flex; flex-direction:column; gap:6px; }
label { font-family:'DM Sans',sans-serif; font-size:10px; color:#555; letter-spacing:1.5px; text-transform:uppercase; }
.hint { font-family:'DM Sans',sans-serif; font-size:11px; color:#444; }
.input-row { display:flex; align-items:center; gap:10px; }
.input-suffix { font-family:'DM Sans',sans-serif; font-size:12px; color:#888; white-space:nowrap; }
.row-split { display:flex; align-items:center; gap:10px; margin-top:4px; }
.tag { font-family:'DM Sans',sans-serif; font-size:11px; padding:3px 10px; border-radius:20px; background:#1a2a1a; color:#4ade80; border:1px solid #1a3a1a; }
.tag.warn { background:#2a1a08; color:#f59e0b; border-color:#3a2a08; }
.slider { -webkit-appearance:none; appearance:none; width:100%; height:3px; background:linear-gradient(90deg,#c9a84c,#2a2010); border-radius:2px; outline:none; border:none!important; padding:0!important; }
.slider::-webkit-slider-thumb { -webkit-appearance:none; width:16px; height:16px; border-radius:50%; background:#c9a84c; cursor:pointer; box-shadow:0 0 8px rgba(201,168,76,.5); }
.btn-gold { background:linear-gradient(135deg,#c9a84c,#e8c96a); color:#0a0a0a; border:none; border-radius:8px; padding:13px; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600; cursor:pointer; width:100%; margin-top:4px; transition:opacity .2s; }
.btn-gold:hover { opacity:.88; }
.results-col { display:flex; flex-direction:column; gap:16px; }
.results { display:flex; flex-direction:column; gap:16px; }
.big-payment { text-align:center; background:linear-gradient(135deg,#141008 0%,#0f0d04 100%); border-color:#2a2210; }
.pay-label { font-family:'DM Sans',sans-serif; font-size:11px; letter-spacing:2px; color:#888; text-transform:uppercase; margin-bottom:8px; }
.pay-amount { font-family:'Playfair Display',serif; font-size:48px; font-weight:900; background:linear-gradient(90deg,#c9a84c,#f0d080,#c9a84c); background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; animation:shimmer 4s linear infinite; }
.pay-sub { font-family:'DM Sans',sans-serif; font-size:12px; color:#555; margin-top:6px; }
.summary-grid { display:flex; flex-direction:column; gap:2px; }
.sum-row { display:flex; justify-content:space-between; align-items:center; padding:9px 0; border-bottom:1px solid #141414; font-family:'DM Sans',sans-serif; }
.sum-row:last-child { border-bottom:none; }
.sum-label { font-size:12px; color:#666; }
.sum-val { font-size:13px; color:#e8d5a0; font-weight:500; }
.sum-val.gold { color:#c9a84c; font-weight:600; }
.chart-card { }
.chart-wrap { height:220px; margin-top:8px; }
.placeholder { display:flex; align-items:center; justify-content:center; min-height:300px; }
.placeholder-text { text-align:center; color:#444; font-family:'DM Sans',sans-serif; font-size:14px; line-height:1.6; max-width:240px; }
@keyframes shimmer { 0%{background-position:-200% center;} 100%{background-position:200% center;} }
</style>
