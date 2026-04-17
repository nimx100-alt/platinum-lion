<script>
  export let message = null;
</script>

{#if message}
  <div class="toast" role="status">
    {message}
  </div>
{/if}

<style>
  .toast {
    position: fixed;
    bottom: 28px;
    right: 28px;
    background: #141408;
    border: 1px solid #c9a84c;
    border-radius: 10px;
    padding: 13px 22px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: #e8d5a0;
    z-index: 10000;
    box-shadow: 0 8px 32px rgba(0,0,0,0.7), 0 0 20px rgba(201,168,76,0.15);
    animation: slideUp 0.3s ease;
    max-width: 320px;
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: none; }
  }
</style>
