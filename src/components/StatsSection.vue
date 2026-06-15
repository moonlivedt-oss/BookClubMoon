<template>
  <section id="stats">
    <div class="sec-in">
      <div class="stats-g">
        <div class="stat rev" v-for="s in stats" :key="s.label">
          <span class="stat-n" :data-target="s.value">0</span>
          <div class="stat-l">{{ s.label }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted } from 'vue'

const stats = [
  { value: 2400, label: 'Книг в каталоге' },
  { value: 340,  label: 'Участников' },
  { value: 8,    label: 'Встреч в месяц' },
  { value: 12,   label: 'Лет истории' },
]

onMounted(() => {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return
      const el = e.target, tg = +el.dataset.target
      let cur = 0
      const inc = setInterval(() => {
        cur = Math.min(cur + tg / 90, tg)
        el.textContent = Math.floor(cur) + (tg > 10 ? '+' : '')
        if (cur >= tg) clearInterval(inc)
      }, 16)
      obs.unobserve(el)
    })
  }, { threshold: .5 })
  document.querySelectorAll('[data-target]').forEach(el => obs.observe(el))
})
</script>

<style scoped>
section { background:linear-gradient(135deg,var(--bg1),rgba(122,18,32,.2) 50%,var(--bg1)); border-top:1px solid var(--gb); border-bottom:1px solid var(--gb); }
.stats-g { display:grid; grid-template-columns:repeat(4,1fr); }
.stat { text-align:center; padding:3rem 2rem; border-right:1px solid var(--bord); }
.stat:last-child { border-right:none; }
.stat-n { font-family:var(--fh); font-size:3.5rem; color:var(--gold); display:block; line-height:1; }
.stat-l { font-family:var(--fs); font-size:12px; letter-spacing:.15em; text-transform:uppercase; color:var(--cream2); margin-top:.75rem; }
</style>
