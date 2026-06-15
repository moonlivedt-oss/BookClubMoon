<template>
  <section id="meetings">
    <div class="sec-in">
      <div class="rev" style="margin-bottom:2.5rem">
        <span class="sec-lb">Клуб</span>
        <h2 class="sec-h">Ближайшие <em>встречи</em></h2>
        <div class="sec-div"></div>
      </div>
      <div class="mtg-grid">
        <div class="mtg-card rev" v-for="(m, i) in meetings" :key="m.title" :class="`d${i}`">
          <img class="mtg-img" :src="m.img" :alt="m.title" loading="lazy" />
          <div class="mtg-body">
            <div class="mtg-date">{{ m.date }}</div>
            <div class="mtg-title">{{ m.title }}</div>
            <div class="mtg-desc">{{ m.desc }}</div>
            <div class="mtg-foot">
              <span class="mtg-seats">🪑 {{ m.seats }}</span>
              <button class="mtg-btn" :class="{ ok: m.joined }" @click="join(m)">
                {{ m.joined ? '✓ Записан' : 'Записаться' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { reactive } from 'vue'

const meetings = reactive([
  {
    title: '«Мастер и Маргарита» — Булгаков',
    date:  '📅 20 апреля · 18:00 · Зал Пушкина',
    desc:  'Символика, образы Воланда, Москва 30-х. Приносите любимые цитаты!',
    seats: '12/20 мест',
    img:   '/public/image/Мастер_и_Маргарита.jpg',
    joined: false,
  },
  {
    title: '«Преступление и наказание» — Достоевский',
    date:  '📅 27 апреля · 17:00 · Читальня',
    desc:  'Теория Раскольникова и современная психология.',
    seats: '7/20 мест',
    img:   '/public/image/Преступление_и_Наказание.jpg',
    joined: false,
  },
  {
    title: 'Поэзия Серебряного века',
    date:  '📅 4 мая · 15:00 · Каминный зал',
    desc:  'Ахматова, Цветаева, Блок. Читаем вслух при свечах.',
    seats: '3/15 мест',
    img:   '/public/image/Серебряный_век.jpg',
    joined: false,
  },
])

function join(m) { m.joined = true }
</script>

<style scoped>
section { padding:5rem 2.5rem; background:var(--bg1); }
.mtg-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(300px,1fr)); gap:1.5rem; }
.mtg-card { background:var(--bg2); border:1px solid var(--bord); border-radius:6px; overflow:hidden; transition:transform .25s,box-shadow .25s; }
.mtg-card:hover { transform:translateY(-4px); box-shadow:0 12px 30px rgba(0,0,0,.4); }
.mtg-img  { width:100%; height:500px; object-fit:cover; display:block; filter:brightness(.7); }
.mtg-body { padding:1.5rem; border-left:3px solid var(--gold); }
.mtg-date  { font-family:var(--fs); font-size:11px; letter-spacing:.2em; text-transform:uppercase; color:var(--gold); margin-bottom:.5rem; }
.mtg-title { font-family:var(--fh); font-size:.95rem; color:var(--cream); line-height:1.35; margin-bottom:.75rem; }
.mtg-desc  { font-size:14px; color:var(--cream2); line-height:1.7; margin-bottom:1.25rem; }
.mtg-foot  { display:flex; align-items:center; justify-content:space-between; }
.mtg-seats { font-size:13px; color:var(--cream2); }
.mtg-btn   { padding:7px 18px; background:transparent; border:1px solid var(--gb); border-radius:2px; font-family:var(--fh); font-size:11px; letter-spacing:.08em; color:var(--gold); cursor:pointer; transition:all .2s; }
.mtg-btn:hover, .mtg-btn.ok { background:var(--gp); border-color:var(--gold); }
</style>
