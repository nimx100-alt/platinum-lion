<script>
  import { activeTab } from '$lib/stores/app.js';
  import DealTracker from '$lib/components/DealTracker.svelte';
  import MortgageCalc from '$lib/components/MortgageCalc.svelte';
  import AIBot from '$lib/components/AIBot.svelte';

  const tabs = [
    { id: 'tracker',  label: '📊 Deal Tracker',  desc: 'Pipeline & Leaderboard' },
    { id: 'mortgage', label: '🧮 Calculator',     desc: 'Mortgage Scenarios' },
    { id: 'ai',       label: '🤖 AI Assistant',   desc: 'Real Estate Q&A' }
  ];
</script>

<div class="app">
  <!-- Header -->
  <header>
    <div class="header-inner">
      <div class="brand">
        <div class="lion-badge">🦁</div>
        <div>
          <div class="brand-name">PLATINUM LION</div>
          <div class="brand-sub">Deal Intelligence · Dundas, ON</div>
        </div>
      </div>
      <nav>
        {#each tabs as tab}
          <button
            class="nav-btn"
            class:active={$activeTab === tab.id}
            on:click={() => activeTab.set(tab.id)}
          >
            <span class="nav-label">{tab.label}</span>
            <span class="nav-desc">{tab.desc}</span>
          </button>
        {/each}
      </nav>
    </div>
  </header>

  <!-- Main Content -->
  <main>
    {#if $activeTab === 'tracker'}
      <DealTracker />
    {:else if $activeTab === 'mortgage'}
      <MortgageCalc />
    {:else if $activeTab === 'ai'}
      <AIBot />
    {/if}
  </main>

  <!-- Footer -->
  <footer>
    <span>Built by <a href="tel:+19055704880">Nim Yanay · 905-570-4880</a></span>
    <span>Platinum Lion Realty · Dundas, ON</span>
  </footer>
</div>

<style>
  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  header {
    background: linear-gradient(180deg, #0d0d0d 0%, #0a0a0a 100%);
    border-bottom: 1px solid #1e1c0f;
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(12px);
  }

  .header-inner {
    max-width: 1180px;
    margin: 0 auto;
    padding: 16px 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    flex-wrap: wrap;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .lion-badge {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #c9a84c, #8a6a1e);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    box-shadow: 0 0 24px rgba(201,168,76,.3);
    flex-shrink: 0;
  }

  .brand-name {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    font-weight: 900;
    letter-spacing: 3px;
    background: linear-gradient(90deg, #c9a84c, #f0d080, #c9a84c);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: shimmer 4s linear infinite;
  }

  .brand-sub {
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    letter-spacing: 2.5px;
    color: #444;
    text-transform: uppercase;
    margin-top: 2px;
  }

  nav {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .nav-btn {
    cursor: pointer;
    padding: 10px 18px;
    border: 1px solid #1e1e1e;
    border-radius: 9px;
    background: transparent;
    color: #666;
    transition: all .2s;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    min-width: 120px;
  }

  .nav-btn:hover {
    border-color: #c9a84c;
    color: #c9a84c;
    background: #111008;
  }

  .nav-btn.active {
    background: linear-gradient(135deg, #c9a84c, #e8c96a);
    color: #0a0a0a;
    border-color: transparent;
  }

  .nav-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: .5px;
  }

  .nav-desc {
    font-family: 'DM Sans', sans-serif;
    font-size: 9px;
    opacity: .7;
    letter-spacing: .5px;
  }

  .nav-btn.active .nav-desc { opacity: .6; }

  main {
    flex: 1;
    max-width: 1180px;
    margin: 0 auto;
    width: 100%;
    padding: 28px 28px 40px;
  }

  footer {
    border-top: 1px solid #141414;
    padding: 16px 28px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    color: #333;
    flex-wrap: wrap;
    gap: 8px;
    max-width: 1180px;
    margin: 0 auto;
    width: 100%;
  }

  footer a {
    color: #c9a84c;
    text-decoration: none;
  }

  footer a:hover { text-decoration: underline; }

  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }

  @media (max-width: 700px) {
    .header-inner { padding: 14px 16px; }
    main { padding: 18px 16px 32px; }
    .nav-btn { min-width: unset; padding: 8px 12px; }
    .nav-desc { display: none; }
  }
</style>
