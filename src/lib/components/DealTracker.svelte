<script>
  import { deals, showToast, fireConfetti, questionsUsed } from '$lib/stores/app.js';

  const STATUS_COLORS = { Active: '#4ade80', Pending: '#f59e0b', Closed: '#c9a84c' };
  const STATUS_ORDER = ['Active', 'Pending', 'Closed'];

  let tab = 'pipeline'; // pipeline | add
  let editId = null;

  const EMPTY = {
    agentName: '', clientType: 'Buyer', city: '',
    listPrice: '', status: 'Active', closedPrice: '', closingDate: ''
  };
  let form = { ...EMPTY };

  $: totalVolume    = $deals.filter(d => d.status === 'Closed').reduce((s,d) => s+(d.closedPrice||d.listPrice), 0);
  $: totalPending   = $deals.filter(d => d.status === 'Pending').reduce((s,d) => s+d.listPrice, 0);
  $: closedCount    = $deals.filter(d => d.status === 'Closed').length;
  $: activeCount    = $deals.filter(d => d.status === 'Active').length;
  $: pendingCount   = $deals.filter(d => d.status === 'Pending').length;

  const now30 = Date.now() - 30*24*60*60*1000;
  $: leaderboard = (() => {
    const map = {};
    $deals.forEach(d => {
      if (!map[d.agentName]) map[d.agentName] = { volume:0, units:0, recent:0 };
      if (d.status === 'Closed') {
        map[d.agentName].volume += d.closedPrice || d.listPrice;
        map[d.agentName].units++;
        if (d.timestamp > now30) map[d.agentName].recent++;
      }
    });
    return Object.entries(map).sort((a,b) => b[1].volume - a[1].volume).slice(0,8);
  })();

  function fmt(n) {
    return n >= 1e6 ? `$${(n/1e6).toFixed(2)}M` : `$${Math.round(n).toLocaleString()}`;
  }

  function submit() {
    if (!form.agentName.trim() || !form.city.trim() || !form.listPrice) {
      showToast('⚠️ Agent name, city, and list price are required.');
      return;
    }
    const deal = {
      id: editId || Date.now(),
      agentName: form.agentName.trim(),
      clientType: form.clientType,
      city: form.city.trim(),
      listPrice: parseFloat(String(form.listPrice).replace(/,/g,'')),
      status: form.status,
      closedPrice: form.status === 'Closed' ? parseFloat(String(form.closedPrice||form.listPrice).replace(/,/g,'')) : null,
      closingDate: form.closingDate,
      timestamp: editId ? ($deals.find(d=>d.id===editId)?.timestamp||Date.now()) : Date.now()
    };
    if (editId) {
      deals.update(ds => ds.map(d => d.id===editId ? deal : d));
      showToast('✅ Deal updated!');
      editId = null;
    } else {
      deals.update(ds => [deal, ...ds]);
      if (deal.status === 'Closed') { fireConfetti(); showToast('🏆 Deal closed! Congrats!'); }
      else showToast('✅ Deal added to pipeline!');
    }
    form = { ...EMPTY };
    tab = 'pipeline';
  }

  function updateStatus(id, newStatus) {
    deals.update(ds => ds.map(d => {
      if (d.id !== id) return d;
      const updated = { ...d, status: newStatus };
      if (newStatus === 'Closed' && !d.closedPrice) updated.closedPrice = d.listPrice;
      return updated;
    }));
    if (newStatus === 'Closed') { fireConfetti(); showToast('🎉 Closed! Let\'s go!'); }
  }

  function startEdit(deal) {
    form = {
      agentName: deal.agentName, clientType: deal.clientType, city: deal.city,
      listPrice: deal.listPrice, status: deal.status,
      closedPrice: deal.closedPrice||'', closingDate: deal.closingDate||''
    };
    editId = deal.id;
    tab = 'add';
  }

  function deleteDeal(id) {
    deals.update(ds => ds.filter(d => d.id !== id));
    showToast('🗑️ Deal removed.');
  }

  function medal(i) {
    return i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`;
  }
  function streak(recent) {
    return recent >= 3 ? '🔥🔥' : recent >= 2 ? '🔥' : '';
  }
</script>

<div class="tracker fade-up">
  <!-- Stats Row -->
  <div class="stats-row">
    {#each [
      { label:'Closed Volume', value: fmt(totalVolume), icon:'💰' },
      { label:'Pending Volume', value: fmt(totalPending), icon:'⏳' },
      { label:'Closed Deals', value: closedCount, icon:'✅' },
      { label:'Active', value: activeCount, icon:'🏠' },
      { label:'Pending', value: pendingCount, icon:'🤝' }
    ] as s}
      <div class="stat-card">
        <span class="stat-icon">{s.icon}</span>
        <div class="stat-value">{s.value}</div>
        <div class="stat-label">{s.label}</div>
      </div>
    {/each}
  </div>

  <!-- Tabs -->
  <div class="inner-tabs">
    <button class="itab" class:active={tab==='pipeline'} on:click={() => { tab='pipeline'; editId=null; form={...EMPTY}; }}>📊 Pipeline</button>
    <button class="itab" class:active={tab==='add'} on:click={() => { tab='add'; }}>{ editId ? '✏️ Edit' : '➕ Add Deal' }</button>
    <button class="itab" class:active={tab==='board'} on:click={() => tab='board'}>🏆 Leaderboard</button>
  </div>

  <!-- Pipeline -->
  {#if tab === 'pipeline'}
    <div class="card">
      {#if $deals.length === 0}
        <div class="empty">No deals yet — add your first one above ↑</div>
      {:else}
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                {#each ['Agent','Type','City','List Price','Status','Closed $','Closing',''] as h}
                  <th>{h}</th>
                {/each}
              </tr>
            </thead>
            <tbody>
              {#each $deals as d (d.id)}
                <tr class="deal-row">
                  <td class="bold">{d.agentName}</td>
                  <td class="muted">{d.clientType}</td>
                  <td class="muted">{d.city}</td>
                  <td>{fmt(d.listPrice)}</td>
                  <td>
                    <select
                      value={d.status}
                      style="border-color:{STATUS_COLORS[d.status]}44;color:{STATUS_COLORS[d.status]};width:auto;"
                      on:change={e => updateStatus(d.id, e.target.value)}
                    >
                      {#each STATUS_ORDER as s}<option>{s}</option>{/each}
                    </select>
                  </td>
                  <td class="gold">{d.closedPrice ? fmt(d.closedPrice) : '—'}</td>
                  <td class="muted">{d.closingDate || '—'}</td>
                  <td>
                    <div class="actions">
                      <button class="act-btn" on:click={() => startEdit(d)}>✏️</button>
                      <button class="act-btn del" on:click={() => deleteDeal(d.id)}>✕</button>
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Add / Edit -->
  {#if tab === 'add'}
    <div class="form-wrap card">
      <div class="section-label">{editId ? '✏️ Edit Deal' : '➕ New Deal'}</div>
      <div class="form-grid">
        <div class="field full">
          <label>Agent Name</label>
          <input bind:value={form.agentName} placeholder="e.g. Sarah Johnson" />
        </div>
        <div class="field">
          <label>Client Type</label>
          <select bind:value={form.clientType}>
            <option>Buyer</option><option>Seller</option><option>Both</option>
          </select>
        </div>
        <div class="field">
          <label>City</label>
          <input bind:value={form.city} placeholder="e.g. Dundas" />
        </div>
        <div class="field">
          <label>List Price ($)</label>
          <input bind:value={form.listPrice} placeholder="850000" type="number" />
        </div>
        <div class="field">
          <label>Status</label>
          <select bind:value={form.status}>
            {#each STATUS_ORDER as s}<option>{s}</option>{/each}
          </select>
        </div>
        {#if form.status === 'Closed'}
          <div class="field">
            <label>Closed Price ($)</label>
            <input bind:value={form.closedPrice} placeholder="860000" type="number" />
          </div>
        {/if}
        <div class="field">
          <label>Closing Date</label>
          <input bind:value={form.closingDate} type="date" />
        </div>
      </div>
      <div class="form-actions">
        <button class="btn-gold" on:click={submit}>
          {editId ? 'Update Deal' : form.status === 'Closed' ? '🎉 Close Deal' : 'Add to Pipeline'}
        </button>
        {#if editId}
          <button class="btn-ghost" on:click={() => { editId=null; form={...EMPTY}; tab='pipeline'; }}>Cancel</button>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Leaderboard -->
  {#if tab === 'board'}
    <div class="card">
      <div class="section-label">🏆 Team Leaderboard</div>
      {#if leaderboard.length === 0}
        <div class="empty">No closed deals yet — who will be first? 👀</div>
      {:else}
        {#each leaderboard as [name, stats], i}
          <div class="board-row">
            <div class="medal">{medal(i)}</div>
            <div class="board-name">
              {name}
              {#if streak(stats.recent)}<span class="badge">{streak(stats.recent)}</span>{/if}
            </div>
            <div class="board-right">
              <div class="board-vol">{fmt(stats.volume)}</div>
              <div class="board-units">{stats.units} {stats.units===1?'deal':'deals'}</div>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  {/if}
</div>

<style>
.tracker { display:flex; flex-direction:column; gap:20px; }
.stats-row { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:14px; }
.stat-card { background:linear-gradient(135deg,#111 0%,#0f0d04 100%); border:1px solid #1e1c0a; border-radius:13px; padding:18px 20px; transition:transform .2s,border-color .2s; }
.stat-card:hover { transform:translateY(-2px); border-color:#8a6a1e; }
.stat-icon { font-size:20px; }
.stat-value { font-family:'Playfair Display',serif; font-size:24px; font-weight:700; color:#c9a84c; margin-top:6px; }
.stat-label { font-size:10px; letter-spacing:1.5px; text-transform:uppercase; color:#555; margin-top:4px; font-family:'DM Sans',sans-serif; }
.inner-tabs { display:flex; gap:8px; flex-wrap:wrap; }
.itab { cursor:pointer; padding:9px 20px; border:1px solid #222; border-radius:7px; font-family:'DM Sans',sans-serif; font-size:12px; font-weight:600; letter-spacing:.8px; text-transform:uppercase; background:transparent; color:#666; transition:all .2s; }
.itab:hover { border-color:#c9a84c; color:#c9a84c; }
.itab.active { background:linear-gradient(135deg,#c9a84c,#e8c96a); color:#0a0a0a; border-color:transparent; }
.card { background:#111010; border:1px solid #1e1c12; border-radius:13px; padding:22px; }
.section-label { font-family:'DM Sans',sans-serif; font-size:10px; letter-spacing:2px; color:#c9a84c; text-transform:uppercase; margin-bottom:18px; }
.empty { text-align:center; padding:40px 0; color:#333; font-family:'DM Sans',sans-serif; font-size:13px; }
.table-wrap { overflow-x:auto; }
table { width:100%; border-collapse:collapse; }
thead tr { font-family:'DM Sans',sans-serif; font-size:10px; letter-spacing:1.5px; color:#444; text-transform:uppercase; }
th { text-align:left; padding:8px 12px; border-bottom:1px solid #1a1a1a; }
.deal-row { border-bottom:1px solid #141414; transition:background .15s; }
.deal-row:hover { background:#0f0f0f; }
td { padding:12px 12px; font-family:'DM Sans',sans-serif; font-size:13px; color:#e8d5a0; }
td.bold { font-weight:600; }
td.muted { color:#666; }
td.gold { color:#c9a84c; }
.actions { display:flex; gap:6px; }
.act-btn { background:none; border:1px solid #222; border-radius:5px; padding:4px 8px; cursor:pointer; color:#888; font-size:11px; transition:all .15s; }
.act-btn:hover { border-color:#c9a84c; color:#c9a84c; }
.act-btn.del:hover { border-color:#663333; color:#cc4444; }
.form-wrap { max-width:580px; margin:0 auto; }
.form-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
.field { display:flex; flex-direction:column; gap:6px; }
.field.full { grid-column:1/-1; }
label { font-family:'DM Sans',sans-serif; font-size:10px; color:#555; letter-spacing:1.5px; text-transform:uppercase; }
.form-actions { display:flex; gap:10px; margin-top:20px; }
.btn-gold { background:linear-gradient(135deg,#c9a84c,#e8c96a); color:#0a0a0a; border:none; border-radius:8px; padding:12px 24px; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600; cursor:pointer; flex:1; transition:opacity .2s; }
.btn-gold:hover { opacity:.88; }
.btn-ghost { background:transparent; color:#888; border:1px solid #222; border-radius:8px; padding:12px 20px; font-family:'DM Sans',sans-serif; font-size:13px; cursor:pointer; transition:all .2s; }
.btn-ghost:hover { border-color:#c9a84c; color:#c9a84c; }
.board-row { display:flex; align-items:center; gap:14px; padding:14px 0; border-bottom:1px solid #141414; }
.board-row:last-child { border-bottom:none; }
.medal { font-size:20px; width:36px; text-align:center; flex-shrink:0; }
.board-name { flex:1; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600; color:#e8d5a0; }
.badge { margin-left:6px; font-size:14px; }
.board-right { text-align:right; }
.board-vol { font-family:'Playfair Display',serif; font-size:20px; color:#c9a84c; font-weight:700; }
.board-units { font-family:'DM Sans',sans-serif; font-size:11px; color:#555; margin-top:2px; }
</style>
