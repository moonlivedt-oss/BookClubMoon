<template>
  <div class="features">
    <div class="features-in">
      <div class="feat" v-for="f in feats" :key="f.label" @click="goTo(f.to)">
        <div class="feat-ic">{{ f.icon }}</div>
        <div class="feat-nm">{{ f.label }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
const feats = [
  { icon:'📚', label:'2400+ книг',  to:'#catalog'   },
  { icon:'📖', label:'Читать онлайн', to:'#catalog' },
  { icon:'🎭', label:'По жанрам',   to:'#genres'    },
  { icon:'🗺️', label:'Карта 2ГИС',  to:'#map-sec'   },
  { icon:'🏆', label:'Марафон',     to:'#challenge' },
]
function goTo(sel) { document.querySelector(sel)?.scrollIntoView({ behavior: 'smooth' }) }
</script>

<style scoped>
.features { background:var(--bg1); border-top:1px solid var(--bord); border-bottom:1px solid var(--bord); padding:1.5rem 2.5rem; }
.features-in { max-width:1200px; margin:0 auto; display:grid; grid-template-columns:repeat(5,1fr); gap:1rem; }
.feat { display:flex; flex-direction:column; align-items:center; gap:8px; padding:1rem; border-radius:4px; cursor:pointer; transition:background .2s; }
.feat:hover { background:var(--gp); }
.feat-ic { font-size:22px; }
.feat-nm { font-family:var(--fs); font-size:12px; letter-spacing:.06em; color:var(--cream2); text-align:center; }
</style>
