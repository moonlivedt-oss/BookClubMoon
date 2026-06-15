<template>
  <section class="hero" id="home">

    <!-- ── BACKGROUND ─────────────────────────────────────── -->
    <div class="hero-bg">
      <!--
        Для GIF   → <img src="/bg.gif" alt="">
        Для видео → <video autoplay muted loop playsinline src="/bg.mp4"></video>
        Файл положите в папку public/
      -->
      <div class="hero-bg-fallback"></div>
    </div>

    <!-- Многослойное затемнение поверх GIF -->
    <div class="hero-vignette"></div>
    <div class="hero-grad"></div>

    <!-- ── CONTENT ─────────────────────────────────────────── -->
    <div class="hero-inner">
      <div class="hero-left">
        <div class="hero-eye">Книжный клуб · с 2012 года</div>
        <h1>
          <span class="ln"><span class="wd" style="animation-delay:.1s">Место,</span> <span class="wd" style="animation-delay:.2s">где</span></span>
          <span class="ln"><span class="wd acc" style="animation-delay:.35s">книги</span> <span class="wd" style="animation-delay:.45s">оживают</span></span>
        </h1>
        <p class="hero-sub">Уютное пространство для любителей чтения. Тысячи книг, онлайн-читалка, карта библиотек и встречи клуба — всё в одном месте.</p>
        <div class="hero-btns">
          <button class="btn-gold" @click="goTo('#catalog')">Открыть каталог</button>
          <button class="btn-ghost" @click="goTo('#genres')">Выбрать жанр</button>
        </div>
      </div>

      <!-- ── КНИГА ───────────────────────────────────────── -->
      <div class="hero-book-w">
        <!-- Ореол за книгой -->
        <div class="book-halo"></div>

        <div class="h3book" @click="$emit('open-reader', 'Мастер и Маргарита', 'Михаил Булгаков', 0)">
          <!-- Тень на «полу» -->
          <div class="book-shadow"></div>

          <!-- Корешок -->
          <div class="bface bspine">
            <span class="spine-title">Мастер и Маргарита</span>
          </div>
          <!-- Верхний срез -->
          <div class="bface btop"></div>
          <!-- Правый срез (страницы) -->
          <div class="bface bpages"></div>

          <!-- Обложка -->
          <div class="bface bfront">
            <!-- Тиснёная рамка -->
            <div class="bframe"></div>
            <!-- Угловые орнаменты -->
            <span class="bcorner tl">❧</span>
            <span class="bcorner tr">❧</span>
            <span class="bcorner bl">❧</span>
            <span class="bcorner br">❧</span>

            <div class="binner">
              <div class="bornament">✦</div>
              <div class="bline"></div>
              <div class="btitle">Мастер и Маргарита</div>
              <div class="bline"></div>
              <div class="bauth">Михаил Булгаков</div>
              <div class="bline thin"></div>
              <div class="bhint">ЧИТАТЬ ОНЛАЙН ↓</div>
            </div>

            <!-- Блик -->
            <div class="bshine"></div>
          </div>
        </div>

        <!-- Парящие искры вокруг книги -->
        <div class="spark s1"></div>
        <div class="spark s2"></div>
        <div class="spark s3"></div>
        <div class="spark s4"></div>
        <div class="spark s5"></div>
      </div>
    </div>

    <div class="hero-scroll"><div class="hero-scroll-ln"></div>Scroll</div>
  </section>
</template>

<script setup>
defineEmits(['open-reader'])
function goTo(sel) { document.querySelector(sel)?.scrollIntoView({ behavior: 'smooth' }) }
</script>

<style scoped>
/* ── SECTION ───────────────────────────────────────────────────────────── */
.hero { min-height:100vh; position:relative; display:flex; align-items:center; overflow:hidden; }

/* ── BACKGROUND ────────────────────────────────────────────────────────── */
.hero-bg { position:absolute; inset:0; overflow:hidden; z-index:0; }
.hero-bg img,
.hero-bg video {
  position:absolute; inset:0; width:100%; height:100%;
  object-fit:cover;
  opacity:.22;          /* немного ярче чем было — GIF виден */
  filter:saturate(.7);  /* немного десатурируем для тёмной темы */
}
.hero-bg-fallback {
  position:absolute; inset:0;
  background:url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1920&q=80') center/cover no-repeat;
  opacity:.12;
}

/* Виньетка — тёмные края поверх GIF */
.hero-vignette {
  position:absolute; inset:0; z-index:1;
  background:
    radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(4,3,2,.85) 100%);
  pointer-events:none;
  transition: background .4s ease;
}
:global(html[data-theme="light"]) .hero-vignette {
  background: radial-gradient(ellipse 80% 80% at 50% 50%, transparent 45%, rgba(240,232,210,.65) 100%);
}

/* Цветной градиент поверх всего */
.hero-grad {
  position:absolute; inset:0; z-index:2;
  background:
    radial-gradient(ellipse at 70% 50%, rgba(100,12,22,.45), transparent 55%),
    radial-gradient(ellipse at 15% 85%, rgba(201,168,76,.1), transparent 45%),
    linear-gradient(to bottom, rgba(8,6,3,.3) 0%, transparent 40%, rgba(8,6,3,.5) 100%);
  pointer-events:none;
  transition: background .4s ease;
}
:global(html[data-theme="light"]) .hero-grad {
  background:
    radial-gradient(ellipse at 70% 50%, rgba(100,12,22,.1), transparent 55%),
    linear-gradient(to bottom, rgba(240,232,210,.12) 0%, transparent 40%, rgba(240,232,210,.3) 100%);
}

/* ── LAYOUT ────────────────────────────────────────────────────────────── */
.hero-inner {
  max-width:1200px; margin:0 auto;
  padding:8rem 2.5rem 4rem;
  display:grid; grid-template-columns:1fr 420px;
  gap:4rem; align-items:center;
  position:relative; z-index:3; width:100%;
}
.hero-left { }

/* ── EYEBROW ───────────────────────────────────────────────────────────── */
.hero-eye {
  font-family:var(--fa); display:inline-flex; align-items:center; gap:10px;
  margin-bottom:2rem; font-size:12px; letter-spacing:.25em; text-transform:uppercase;
  color:var(--gold); opacity:.8;
}
.hero-eye::before,.hero-eye::after {
  content:''; display:block; width:28px; height:1px; background:var(--gold); opacity:.5;
}

/* ── HEADLINE ──────────────────────────────────────────────────────────── */
h1 { font-family:var(--fh); font-size:clamp(2.8rem,5.5vw,4.2rem); font-weight:700; line-height:1.1; margin-bottom:1.75rem; }
.ln { display:block; overflow:hidden; }
.wd { display:inline-block; transform:translateY(110%); animation:wrise .8s cubic-bezier(.215,.61,.355,1) forwards; }
.acc { color:var(--gold); font-style:italic; }
@keyframes wrise { to { transform:translateY(0); } }

.hero-sub { font-size:17px; color:var(--cream2); line-height:1.9; margin-bottom:2.5rem; max-width:480px; opacity:0; animation:fin .8s .9s forwards; }
.hero-btns { display:flex; gap:1rem; flex-wrap:wrap; opacity:0; animation:fin .8s 1.1s forwards; }
@keyframes fin { to { opacity:1; } }

/* ── SCROLL ────────────────────────────────────────────────────────────── */
.hero-scroll {
  position:absolute; bottom:2.5rem; left:50%; transform:translateX(-50%);
  display:flex; flex-direction:column; align-items:center; gap:8px;
  font-family:var(--fs); font-size:11px; letter-spacing:.2em; text-transform:uppercase;
  color:var(--cream2); opacity:.45; animation:bob 2s ease-in-out infinite; z-index:3;
}
.hero-scroll-ln { width:1px; height:50px; background:linear-gradient(to bottom,var(--gold),transparent); }
@keyframes bob {
  0%,100%{transform:translateX(-50%) translateY(0);}
  50%{transform:translateX(-50%) translateY(5px);}
}

/* ══════════════════════════════════════════════════════════════════════
   BOOK CARD
══════════════════════════════════════════════════════════════════════ */
.hero-book-w {
  display:flex; align-items:center; justify-content:center;
  position:relative;
  opacity:0; animation:fin .8s .5s forwards;
}

/* Светящийся ореол за книгой */
.book-halo {
  position:absolute;
  width:260px; height:360px;
  background:radial-gradient(ellipse at 50% 50%,
    rgba(180,20,20,.35) 0%,
    rgba(201,168,76,.15) 40%,
    transparent 70%
  );
  filter:blur(28px);
  animation:haloBreath 4s ease-in-out infinite;
  pointer-events:none;
  z-index:0;
}
@keyframes haloBreath {
  0%,100%{ opacity:.7; transform:scale(1); }
  50%    { opacity:1;  transform:scale(1.08); }
}

/* Книга — 3D-контейнер */
.h3book {
  width:210px; height:290px;
  position:relative; z-index:1;
  transform-style:preserve-3d;
  animation:brot 7s ease-in-out infinite;
  cursor:pointer;
  filter:drop-shadow(0 30px 50px rgba(0,0,0,.7));
}
@keyframes brot {
  0%  { transform:rotateY(-22deg) rotateX(6deg) translateY(0px); }
  50% { transform:rotateY(18deg)  rotateX(-4deg) translateY(-12px); }
  100%{ transform:rotateY(-22deg) rotateX(6deg) translateY(0px); }
}
.h3book:hover { animation-play-state:paused; }

/* Тень книги на "полу" */
.book-shadow {
  position:absolute; bottom:-30px; left:50%;
  transform:translateX(-50%);
  width:180px; height:20px;
  background:radial-gradient(ellipse, rgba(0,0,0,.6) 0%, transparent 70%);
  filter:blur(8px);
  animation:shadowPulse 7s ease-in-out infinite;
  z-index:-1;
}
@keyframes shadowPulse {
  0%,100%{ transform:translateX(-50%) scaleX(1);   opacity:.6; }
  50%    { transform:translateX(-50%) scaleX(.75); opacity:.35; }
}

.bface { position:absolute; backface-visibility:hidden; overflow:hidden; }

/* ── ОБЛОЖКА (front) ──────────────────────────────────────────────────── */
.bfront {
  width:210px; height:290px;
  background:
    linear-gradient(160deg, #6A1515 0%, #3D0A0A 50%, #521010 100%);
  border-radius:2px 7px 7px 2px;
  box-shadow:
    inset -3px 0 12px rgba(0,0,0,.5),
    inset 0 0 30px rgba(0,0,0,.25),
    6px 0 25px rgba(0,0,0,.5);
  position:relative;
}

/* Тиснёная рамка */
.bframe {
  position:absolute;
  inset:10px;
  border:1px solid rgba(201,168,76,.25);
  border-radius:3px;
  pointer-events:none;
}
.bframe::before {
  content:'';
  position:absolute;
  inset:4px;
  border:1px solid rgba(201,168,76,.12);
  border-radius:2px;
}

/* Угловые орнаменты */
.bcorner {
  position:absolute;
  color:rgba(201,168,76,.4);
  font-size:13px;
  line-height:1;
}
.tl { top:14px;  left:14px; }
.tr { top:14px;  right:14px; transform:scaleX(-1); }
.bl { bottom:14px; left:14px; transform:scaleY(-1); }
.br { bottom:14px; right:14px; transform:scale(-1); }

/* Содержимое обложки */
.binner {
  position:absolute; inset:0;
  display:flex; flex-direction:column; align-items:center;
  justify-content:center; padding:2rem 1.5rem;
  text-align:center; z-index:1;
}
.bornament { font-size:24px; color:var(--gold); margin-bottom:.6rem; opacity:.9; animation:spin4 8s linear infinite; }
@keyframes spin4 { 0%,100%{ transform:rotate(0deg); } 50%{ transform:rotate(180deg); } }
.btitle { font-family:var(--fh); font-size:16px; color:var(--cream); letter-spacing:.06em; line-height:1.45; }
.bauth  { font-family:var(--fb); font-style:italic; font-size:12px; color:var(--gold); opacity:.85; }
.bline  { width:44px; height:1px; background:linear-gradient(to right, transparent, var(--gold), transparent); margin:10px auto; opacity:.7; }
.bline.thin { width:28px; opacity:.35; margin:6px auto; }
.bhint  { font-size:10px; color:var(--gold); opacity:.5; font-family:var(--fh); letter-spacing:.18em; }

/* Блик (скользит по обложке) */
.bshine {
  position:absolute; inset:0;
  background:linear-gradient(125deg, rgba(255,255,255,.12) 0%, transparent 45%, rgba(255,255,255,.04) 100%);
  pointer-events:none;
  border-radius:inherit;
}

/* ── КОРЕШОК ──────────────────────────────────────────────────────────── */
.bspine {
  width:32px; height:290px;
  background:linear-gradient(to right, #1E0303, #3D0A0A, #2A0606);
  position:absolute; left:-30px; top:0;
  border-radius:4px 0 0 4px;
  transform:rotateY(-90deg);
  transform-origin:right center;
  box-shadow:inset -4px 0 8px rgba(0,0,0,.4);
  display:flex; align-items:center; justify-content:center;
}
.spine-title {
  writing-mode:vertical-rl;
  transform:rotate(180deg);
  font-family:var(--fh); font-size:9px; letter-spacing:.12em;
  color:rgba(201,168,76,.4); white-space:nowrap;
  overflow:hidden; max-height:160px;
}

/* ── ВЕРХ книги ───────────────────────────────────────────────────────── */
.btop {
  width:210px; height:32px;
  background:linear-gradient(to bottom, #5C1010, #3A0808);
  position:absolute; top:-1px; left:0;
  transform:rotateX(90deg); transform-origin:bottom center;
  box-shadow:inset 0 -4px 8px rgba(0,0,0,.3);
}

/* ── СТРАНИЦЫ (правый срез) ───────────────────────────────────────────── */
.bpages {
  width:14px; height:290px;
  background:repeating-linear-gradient(
    to bottom,
    #E8DCC8 0px, #E8DCC8 1px,
    #D4C9B0 1px, #D4C9B0 2px
  );
  position:absolute; right:-13px; top:0;
  transform:rotateY(90deg); transform-origin:left center;
  border-radius:0 2px 2px 0;
  box-shadow:inset -3px 0 6px rgba(0,0,0,.3);
}

/* ── ИСКРЫ вокруг книги ───────────────────────────────────────────────── */
.spark {
  position:absolute;
  width:4px; height:4px;
  background:var(--gold);
  border-radius:50%;
  pointer-events:none;
  opacity:0;
}
.s1 { top:10%;  left:5%;  animation:sparkle 3.5s 0.2s ease-in-out infinite; }
.s2 { top:30%;  right:2%; animation:sparkle 4s   1.1s ease-in-out infinite; }
.s3 { top:70%;  left:8%;  animation:sparkle 3s   0.7s ease-in-out infinite; }
.s4 { top:80%;  right:5%; animation:sparkle 4.5s 1.8s ease-in-out infinite; }
.s5 { top:50%;  left:2%;  animation:sparkle 3.2s 2.4s ease-in-out infinite; width:3px; height:3px; }

@keyframes sparkle {
  0%   { opacity:0;   transform:translateY(0)   scale(.5); }
  30%  { opacity:.9;  transform:translateY(-8px) scale(1); }
  60%  { opacity:.4;  transform:translateY(-18px) scale(.7); }
  100% { opacity:0;   transform:translateY(-30px) scale(.3); }
}
</style>
