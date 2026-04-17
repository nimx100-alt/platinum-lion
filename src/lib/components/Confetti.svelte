<script>
  import { onMount } from 'svelte';
  export let active = false;

  let particles = [];

  $: if (active) {
    particles = Array.from({ length: 90 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: ['#c9a84c', '#f0d080', '#ffffff', '#b8962e', '#fffbe6', '#e8c96a'][i % 6],
      size: Math.random() * 10 + 4,
      duration: (Math.random() * 2 + 2).toFixed(2),
      delay: (Math.random() * 0.6).toFixed(2),
      rotate: Math.random() * 360,
      shape: Math.random() > 0.5 ? '50%' : '2px'
    }));
  } else {
    particles = [];
  }
</script>

{#if particles.length}
  <div class="confetti-wrap" aria-hidden="true">
    {#each particles as p (p.id)}
      <div
        class="particle"
        style="
          left:{p.x}%;
          width:{p.size}px;
          height:{p.size}px;
          background:{p.color};
          border-radius:{p.shape};
          animation-duration:{p.duration}s;
          animation-delay:{p.delay}s;
          transform:rotate({p.rotate}deg);
        "
      />
    {/each}
  </div>
{/if}

<style>
  .confetti-wrap {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 9999;
    overflow: hidden;
  }
  .particle {
    position: absolute;
    top: -20px;
    animation: fall linear forwards;
  }
  @keyframes fall {
    to {
      transform: translateY(110vh) rotate(720deg);
      opacity: 0;
    }
  }
</style>
