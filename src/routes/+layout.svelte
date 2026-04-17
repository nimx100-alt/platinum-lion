<script>
  import { toast, confettiActive, activeTab } from '$lib/stores/app.js';
  import Confetti from '$lib/components/Confetti.svelte';
  import Toast from '$lib/components/Toast.svelte';
</script>

<svelte:head>
  <title>Platinum Lion | Deal Intelligence</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
</svelte:head>

<Confetti active={$confettiActive} />
<Toast message={$toast} />

<slot />

<style>
  :global(*) { box-sizing: border-box; margin: 0; padding: 0; }
  :global(body) {
    background: #090909;
    color: #e8d5a0;
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
  }
  :global(::-webkit-scrollbar) { width: 3px; }
  :global(::-webkit-scrollbar-track) { background: #0d0d0d; }
  :global(::-webkit-scrollbar-thumb) { background: #8a6a1e; border-radius: 2px; }
  :global(input), :global(select), :global(textarea) {
    background: #0d0d0d !important;
    color: #e8d5a0 !important;
    border: 1px solid #222 !important;
    border-radius: 7px !important;
    padding: 10px 14px !important;
    font-family: 'DM Sans', sans-serif !important;
    font-size: 13px !important;
    width: 100%;
    outline: none !important;
    transition: border-color .2s, box-shadow .2s;
  }
  :global(input:focus), :global(select:focus), :global(textarea:focus) {
    border-color: #c9a84c !important;
    box-shadow: 0 0 0 3px rgba(201,168,76,.12) !important;
  }
  :global(input::placeholder), :global(textarea::placeholder) { color: #333 !important; }
  :global(select option) { background: #0d0d0d; }
  :global(.fade-up) { animation: fadeUp .4s ease both; }
  :global(@keyframes fadeUp) {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: none; }
  }
</style>
