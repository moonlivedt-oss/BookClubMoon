<template>
  <footer>
    <span class="ft-orn">· · · ✦ · · ·</span>
    <div class="ft-logo">Страница</div>
    <div class="ft-tag">Книжный клуб для душевных читателей</div>
    <div class="ft-links">
      <a href="https://smotrim.ru/brand/39522" target="_blank" rel="noopener">MAX</a>
      <a href="https://www.cultura.ru"          target="_blank" rel="noopener">Культура</a>
      <a @click="goTo('#meetings')">Контакты</a>
      <a @click="goTo('#testimonials')">О нас</a>
    </div>
    <div class="ft-copy">© 2012–{{ year }} Книжный клуб «Страница»</div>
  </footer>
</template>

<script setup>
const year = new Date().getFullYear()
function goTo(sel) { document.querySelector(sel)?.scrollIntoView({ behavior: 'smooth' }) }
</script>

<style scoped>
footer { background:var(--bg1); border-top:1px solid var(--gb); padding:4rem 2.5rem 2rem; text-align:center; }
.ft-orn  { color:var(--gold); opacity:.3; letter-spacing:1.5rem; font-size:1rem; margin-bottom:2rem; display:block; }
.ft-logo { font-family:var(--fa); font-size:2rem; color:var(--gold); letter-spacing:.15em; margin-bottom:.5rem; }
.ft-tag  { font-family:var(--fb); font-style:italic; color:var(--cream2); font-size:15px; margin-bottom:2rem; }
.ft-links { display:flex; gap:2rem; justify-content:center; flex-wrap:wrap; margin-bottom:2rem; }
.ft-links a { font-family:var(--fs); font-size:13px; color:rgba(242,232,212,.4); text-decoration:none; letter-spacing:.05em; cursor:pointer; transition:color .2s; }
.ft-links a:hover { color:var(--gold); }
.ft-copy { font-size:12px; color:rgba(242,232,212,.2); letter-spacing:.05em; }
</style>
