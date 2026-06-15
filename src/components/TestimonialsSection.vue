<template>
  <section id="testimonials">
    <div class="sec-in">
      <div class="rev" style="margin-bottom:2.5rem">
        <span class="sec-lb">Участники</span>
        <h2 class="sec-h">Что говорят <em>читатели</em></h2>
        <div class="sec-div"></div>
      </div>
      <div class="testi-grid">
        <div class="testi-card rev" v-for="(t, i) in testimonials" :key="t.name" :class="`d${i}`">
          <div class="testi-quote">"</div>
          <p class="testi-text">{{ t.text }}</p>
          <div class="testi-stars">★★★★★</div>
          <div class="testi-author">
            <div class="testi-avatar">{{ t.initials }}</div>
            <div class="testi-info">
              <div class="testi-name">{{ t.name }}</div>
              <div class="testi-since">{{ t.since }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const testimonials = [
  { text: 'Клуб изменил моё отношение к чтению. Я стала читать вдумчивее — и открыла для себя столько книг, до которых сама бы никогда не дошла.', name: 'Анна Кириллова',  initials: 'АК', since: 'Участник с 2019' },
  { text: 'Встречи по Достоевскому — это нечто. Мы спорили три часа, выпили пять чашек чая и разошлись с совершенно новым пониманием романа.',    name: 'Максим Соколов', initials: 'МС', since: 'Участник с 2021' },
  { text: 'Здесь нашла подруг и любимые книги. Читательский марафон — отличная мотивация: за год осилила 34 книги. Личный рекорд!',                 name: 'Елена Волкова',  initials: 'ЕВ', since: 'Участник с 2016' },
]
</script>

<style scoped>
section { padding:5rem 2.5rem; background:var(--bg0); }
.testi-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.5rem; }
.testi-card { background:var(--bg2); border:1px solid var(--bord); border-radius:6px; padding:1.75rem; transition:border-color .3s; }
.testi-card:hover { border-color:var(--gb); }
.testi-quote { font-size:3rem; color:var(--gold); opacity:.3; font-family:var(--fh); line-height:1; margin-bottom:.5rem; }
.testi-text  { font-family:var(--fb); font-style:italic; font-size:16px; color:var(--cream); line-height:1.8; margin-bottom:1.5rem; }
.testi-stars { color:var(--gold); font-size:13px; margin-bottom:1rem; }
.testi-author { display:flex; align-items:center; gap:12px; }
.testi-avatar { width:44px; height:44px; border-radius:50%; background:var(--gp); border:1px solid var(--gb); display:flex; align-items:center; justify-content:center; font-family:var(--fh); font-size:15px; color:var(--gold); }
.testi-name  { font-family:var(--fh); font-size:13px; color:var(--cream); }
.testi-since { font-family:var(--fs); font-size:12px; color:var(--cream2); margin-top:2px; }
</style>
