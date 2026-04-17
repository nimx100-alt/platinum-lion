<script>
  import { questionsUsed, showToast } from '$lib/stores/app.js';

  const AI_LIMIT = 3;
  const NIM_PHONE = '905-570-4880';
  const NIM_WA = 'https://wa.me/19055704880';

  let messages = [];
  let input = '';
  let loading = false;
  let chatEl;

  $: remaining = AI_LIMIT - $questionsUsed;
  $: isLocked = $questionsUsed >= AI_LIMIT;

  const SUGGESTIONS = [
    'What is land transfer tax in Ontario?',
    'Explain cap rate for investment properties',
    'What is CMHC mortgage insurance?',
    'How does the stress test work?',
    'What are closing costs in Ontario?',
    'Explain HST on new homes in Ontario',
    'What is the First Home Savings Account?',
    'How do I calculate cash flow on a rental?'
  ];

  async function send(text) {
    const q = (text || input).trim();
    if (!q || loading) return;
    if (isLocked) return;
    input = '';

    messages = [...messages, { role: 'user', content: q }];
    loading = true;
    scrollBottom();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `BOT_QUESTION: ${q}` }],
          questionsUsed: $questionsUsed
        })
      });
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      messages = [...messages, { role: 'assistant', content: data.answer, locked: data.locked }];

      if (!data.locked) {
        questionsUsed.update(n => n + 1);
      } else {
        questionsUsed.set(AI_LIMIT);
      }

      if (data.toast) showToast(data.toast);
    } catch (err) {
      messages = [...messages, { role: 'assistant', content: 'Something went wrong. Please try again.', error: true }];
    } finally {
      loading = false;
      scrollBottom();
    }
  }

  function scrollBottom() {
    setTimeout(() => { if (chatEl) chatEl.scrollTop = chatEl.scrollHeight; }, 80);
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }
</script>

<div class="bot fade-up">
  <div class="two-col">
    <!-- Chat Panel -->
    <div class="chat-panel card">
      <div class="chat-header">
        <div class="header-left">
          <div class="avatar">🦁</div>
          <div>
            <div class="bot-name">Platinum Lion AI</div>
            <div class="bot-sub">Real Estate Assistant</div>
          </div>
        </div>
        <div class="counter" class:warn={remaining <= 1} class:locked={isLocked}>
          {#if isLocked}
            🔒 Limit reached
          {:else}
            {remaining} question{remaining !== 1 ? 's' : ''} left
          {/if}
        </div>
      </div>

      <div class="messages" bind:this={chatEl}>
        {#if messages.length === 0}
          <div class="welcome">
            <div class="welcome-icon">🏠</div>
            <div class="welcome-title">Ask me anything about real estate</div>
            <div class="welcome-sub">Ontario regulations · Canadian law · Investing · Mortgages</div>
          </div>
        {/if}

        {#each messages as msg}
          <div class="msg" class:user={msg.role==='user'} class:assistant={msg.role==='assistant'}>
            {#if msg.role === 'assistant'}
              <div class="msg-avatar">🦁</div>
            {/if}
            <div class="bubble" class:locked={msg.locked} class:error={msg.error}>
              {msg.content}
              {#if msg.locked}
                <div class="nim-card">
                  <div class="nim-label">Contact for Private Solutions</div>
                  <div class="nim-name">Nim Yanay</div>
                  <div class="nim-actions">
                    <a href="tel:{NIM_PHONE}" class="nim-btn phone">📱 {NIM_PHONE}</a>
                    <a href={NIM_WA} target="_blank" rel="noopener" class="nim-btn wa">💬 WhatsApp</a>
                  </div>
                </div>
              {/if}
            </div>
          </div>
        {/each}

        {#if loading}
          <div class="msg assistant">
            <div class="msg-avatar">🦁</div>
            <div class="bubble typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        {/if}
      </div>

      <!-- Input -->
      {#if !isLocked}
        <div class="input-bar">
          <textarea
            bind:value={input}
            on:keydown={handleKey}
            placeholder="Ask about Ontario real estate, mortgages, investing..."
            rows="2"
            disabled={loading}
          ></textarea>
          <button class="send-btn" on:click={() => send()} disabled={loading || !input.trim()}>
            {loading ? '...' : '→'}
          </button>
        </div>
      {:else}
        <div class="locked-bar">
          <div class="locked-msg">🔒 Free limit reached — contact Nim for full access</div>
          <a href={NIM_WA} target="_blank" rel="noopener" class="btn-gold">💬 WhatsApp Nim →</a>
        </div>
      {/if}
    </div>

    <!-- Suggestions + Info -->
    <div class="sidebar">
      <div class="card suggest-card">
        <div class="section-label">💡 Try asking</div>
        <div class="suggestions">
          {#each SUGGESTIONS as s}
            <button
              class="suggestion"
              on:click={() => send(s)}
              disabled={isLocked || loading}
            >{s}</button>
          {/each}
        </div>
      </div>

      <div class="card nim-promo">
        <div class="nim-promo-label">🔑 Need Custom Solutions?</div>
        <div class="nim-promo-name">Nim Yanay</div>
        <div class="nim-promo-desc">Automation tools, private real estate insights, and custom workflows for your business.</div>
        <div class="nim-promo-actions">
          <a href="tel:+19055704880" class="btn-gold small">📱 Call</a>
          <a href={NIM_WA} target="_blank" rel="noopener" class="btn-ghost small">💬 WhatsApp</a>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
.bot { display:flex; flex-direction:column; }
.two-col { display:grid; grid-template-columns:1fr 320px; gap:20px; align-items:start; }
@media(max-width:860px){ .two-col { grid-template-columns:1fr; } }
.card { background:#111010; border:1px solid #1e1c12; border-radius:13px; padding:22px; }
.section-label { font-family:'DM Sans',sans-serif; font-size:10px; letter-spacing:2px; color:#c9a84c; text-transform:uppercase; margin-bottom:14px; }
.chat-panel { display:flex; flex-direction:column; gap:0; padding:0; overflow:hidden; }
.chat-header { display:flex; justify-content:space-between; align-items:center; padding:18px 22px; border-bottom:1px solid #1e1c12; }
.header-left { display:flex; align-items:center; gap:12px; }
.avatar { width:40px; height:40px; background:linear-gradient(135deg,#c9a84c,#8a6a1e); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:20px; box-shadow:0 0 16px rgba(201,168,76,.3); }
.bot-name { font-family:'Playfair Display',serif; font-size:15px; font-weight:700; color:#e8d5a0; }
.bot-sub { font-family:'DM Sans',sans-serif; font-size:10px; color:#555; letter-spacing:1px; margin-top:1px; }
.counter { font-family:'DM Sans',sans-serif; font-size:11px; padding:5px 12px; border-radius:20px; background:#1a1a0a; border:1px solid #2a2210; color:#888; }
.counter.warn { color:#f59e0b; border-color:#3a2a08; background:#1e1800; }
.counter.locked { color:#c9a84c; border-color:#c9a84c44; }
.messages { flex:1; min-height:360px; max-height:420px; overflow-y:auto; padding:20px 22px; display:flex; flex-direction:column; gap:16px; }
.welcome { display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; text-align:center; padding:40px 0; color:#333; }
.welcome-icon { font-size:40px; margin-bottom:12px; }
.welcome-title { font-family:'Playfair Display',serif; font-size:18px; color:#555; margin-bottom:6px; }
.welcome-sub { font-family:'DM Sans',sans-serif; font-size:12px; color:#333; }
.msg { display:flex; align-items:flex-start; gap:10px; animation:fadeUp .3s ease; }
.msg.user { flex-direction:row-reverse; }
.msg-avatar { width:32px; height:32px; background:linear-gradient(135deg,#c9a84c,#8a6a1e); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0; }
.bubble { font-family:'DM Sans',sans-serif; font-size:13px; line-height:1.65; padding:12px 16px; border-radius:12px; max-width:80%; white-space:pre-wrap; }
.msg.assistant .bubble { background:#161510; border:1px solid #222; color:#e8d5a0; border-top-left-radius:4px; }
.msg.user .bubble { background:linear-gradient(135deg,#c9a84c,#a88030); color:#0a0a0a; font-weight:500; border-top-right-radius:4px; }
.bubble.locked { border-color:#c9a84c44; }
.bubble.error { border-color:#cc444444; color:#cc6666; }
.typing { display:flex; gap:5px; align-items:center; padding:14px 18px; }
.typing span { width:6px; height:6px; background:#c9a84c; border-radius:50%; animation:blink 1.2s infinite; }
.typing span:nth-child(2) { animation-delay:.2s; }
.typing span:nth-child(3) { animation-delay:.4s; }
@keyframes blink { 0%,100%{opacity:.2;} 50%{opacity:1;} }
.nim-card { margin-top:14px; padding:14px; background:#0f0d04; border:1px solid #c9a84c44; border-radius:10px; }
.nim-label { font-family:'DM Sans',sans-serif; font-size:9px; letter-spacing:2px; text-transform:uppercase; color:#c9a84c; margin-bottom:4px; }
.nim-name { font-family:'Playfair Display',serif; font-size:18px; color:#e8d5a0; font-weight:700; margin-bottom:10px; }
.nim-actions { display:flex; gap:8px; flex-wrap:wrap; }
.nim-btn { font-family:'DM Sans',sans-serif; font-size:12px; padding:7px 14px; border-radius:7px; text-decoration:none; font-weight:600; transition:opacity .2s; }
.nim-btn.phone { background:linear-gradient(135deg,#c9a84c,#e8c96a); color:#0a0a0a; }
.nim-btn.wa { background:#1a2e1a; color:#4ade80; border:1px solid #1e4020; }
.nim-btn:hover { opacity:.85; }
.input-bar { display:flex; gap:10px; padding:16px 22px; border-top:1px solid #1e1c12; background:#0d0d0d; align-items:flex-end; }
.input-bar textarea { flex:1; background:#111!important; border:1px solid #222!important; border-radius:8px!important; padding:10px 14px!important; font-family:'DM Sans',sans-serif!important; font-size:13px!important; color:#e8d5a0!important; resize:none; min-height:44px; }
.send-btn { background:linear-gradient(135deg,#c9a84c,#e8c96a); color:#0a0a0a; border:none; border-radius:8px; width:44px; height:44px; font-size:18px; font-weight:700; cursor:pointer; flex-shrink:0; transition:opacity .2s; }
.send-btn:disabled { opacity:.4; cursor:not-allowed; }
.locked-bar { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:16px 22px; border-top:1px solid #1e1c12; background:#0d0d0d; flex-wrap:wrap; }
.locked-msg { font-family:'DM Sans',sans-serif; font-size:12px; color:#888; }
.sidebar { display:flex; flex-direction:column; gap:16px; }
.suggest-card { }
.suggestions { display:flex; flex-direction:column; gap:6px; }
.suggestion { background:#0d0d0d; border:1px solid #1e1c12; border-radius:7px; padding:9px 12px; text-align:left; font-family:'DM Sans',sans-serif; font-size:12px; color:#888; cursor:pointer; transition:all .15s; line-height:1.4; }
.suggestion:hover:not(:disabled) { border-color:#c9a84c; color:#c9a84c; background:#111008; }
.suggestion:disabled { opacity:.4; cursor:not-allowed; }
.nim-promo { background:linear-gradient(135deg,#111 0%,#0f0d04 100%); border-color:#2a2210; }
.nim-promo-label { font-family:'DM Sans',sans-serif; font-size:9px; letter-spacing:2px; text-transform:uppercase; color:#c9a84c; margin-bottom:6px; }
.nim-promo-name { font-family:'Playfair Display',serif; font-size:22px; color:#e8d5a0; font-weight:700; margin-bottom:8px; }
.nim-promo-desc { font-family:'DM Sans',sans-serif; font-size:12px; color:#666; line-height:1.6; margin-bottom:14px; }
.nim-promo-actions { display:flex; gap:8px; }
.btn-gold { background:linear-gradient(135deg,#c9a84c,#e8c96a); color:#0a0a0a; border:none; border-radius:8px; padding:11px 22px; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600; cursor:pointer; text-decoration:none; display:inline-block; transition:opacity .2s; }
.btn-gold.small { padding:8px 16px; font-size:12px; }
.btn-gold:hover { opacity:.88; }
.btn-ghost { background:transparent; color:#888; border:1px solid #222; border-radius:8px; padding:11px 18px; font-family:'DM Sans',sans-serif; font-size:13px; cursor:pointer; text-decoration:none; display:inline-block; transition:all .2s; }
.btn-ghost.small { padding:8px 14px; font-size:12px; }
.btn-ghost:hover { border-color:#c9a84c; color:#c9a84c; }
@keyframes fadeUp { from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:none;} }
</style>
