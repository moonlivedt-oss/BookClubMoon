<template>
  <section id="challenge">
    <div class="sec-in">
      <div class="rev" style="margin-bottom:2.5rem">
        <span class="sec-lb">Ваш прогресс</span>
        <h2 class="sec-h">Читательский <em>марафон</em></h2>
        <div class="sec-div"></div>
      </div>

      <div class="challenge-w">
        <div class="ch-setup rev">
          <span class="ch-label">Цель на год</span>
          <input class="ch-input" type="number" min="1" max="365" v-model.number="goalInput" />
          <p class="ch-note">Поставьте цель — сколько книг хотите прочитать за год. Прогресс сохраняется автоматически.</p>
          <button class="ch-btn" @click="saveGoal">Сохранить цель</button>
        </div>

        <div class="ch-progress rev d1">
          <div class="ch-ring-w">
            <div class="ch-ring">
              <svg viewBox="0 0 160 160" width="160" height="160">
                <circle class="ch-ring-track" cx="80" cy="80" r="70" />
                <circle class="ch-ring-fill" cx="80" cy="80" r="70"
                  :style="{ strokeDashoffset: ringOffset, transition: 'stroke-dashoffset 1s ease' }" />
              </svg>
              <div class="ch-ring-text">
                <span class="ch-pct">{{ pct }}%</span>
                <span class="ch-pct-l">выполнено</span>
              </div>
            </div>
          </div>

          <div class="ch-stats">
            <div class="ch-stat"><div class="ch-stat-n">{{ read }}</div><div class="ch-stat-l">прочитано</div></div>
            <div class="ch-stat"><div class="ch-stat-n">{{ left }}</div><div class="ch-stat-l">осталось</div></div>
          </div>

          <button class="ch-add-btn" @click="addBook" :style="btnStyle">{{ btnText }}</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'

const goal      = ref(parseInt(localStorage.getItem('ch_goal') || '20'))
const read      = ref(parseInt(localStorage.getItem('ch_read') || '0'))
const goalInput = ref(goal.value)
const btnText   = ref('+ Отметить книгу прочитанной')
const btnStyle  = ref({})

const pct        = computed(() => Math.min(100, Math.round(read.value / goal.value * 100)))
const left       = computed(() => Math.max(0, goal.value - read.value))
const ringOffset = computed(() => { const c = 440; return c - c * (pct.value / 100) })

function saveGoal() {
  goal.value = Math.max(1, goalInput.value || 20)
  localStorage.setItem('ch_goal', goal.value)
}

function addBook() {
  if (read.value >= goal.value) return
  read.value = Math.min(read.value + 1, goal.value)
  localStorage.setItem('ch_read', read.value)
  btnText.value  = '✓ Отмечено!'
  btnStyle.value = { background: 'rgba(201,168,76,.4)' }
  setTimeout(() => { btnText.value = '+ Отметить книгу прочитанной'; btnStyle.value = {} }, 1500)
}
</script>

<style scoped>
section { padding:5rem 2.5rem; background:var(--bg1); }
.challenge-w { display:grid; grid-template-columns:1fr 1fr; gap:3rem; align-items:start; }
.ch-setup { background:var(--bg2); border:1px solid var(--gb); border-radius:6px; padding:2rem; }
.ch-label { font-family:var(--fh); font-size:13px; letter-spacing:.1em; color:var(--cream); margin-bottom:.75rem; display:block; }
.ch-input { width:100%; background:rgba(255,255,255,.05); border:1px solid var(--gb); border-radius:3px; padding:10px 14px; font-family:var(--fh); font-size:24px; color:var(--gold); outline:none; text-align:center; margin-bottom:1rem; }
.ch-note { font-family:var(--fs); font-size:13px; color:var(--cream2); margin-bottom:1.5rem; line-height:1.6; }
.ch-btn { width:100%; padding:12px; background:var(--gp); border:1px solid var(--gb); border-radius:3px; font-family:var(--fh); font-size:13px; letter-spacing:.1em; color:var(--gold); cursor:pointer; transition:all .2s; }
.ch-btn:hover { background:rgba(201,168,76,.25); }
.ch-progress { background:var(--bg2); border:1px solid var(--gb); border-radius:6px; padding:2rem; }
.ch-ring-w { display:flex; align-items:center; justify-content:center; margin-bottom:1.5rem; }
.ch-ring { position:relative; width:160px; height:160px; }
.ch-ring svg { transform:rotate(-90deg); }
.ch-ring-track { fill:none; stroke:var(--bord); stroke-width:8; }
.ch-ring-fill  { fill:none; stroke:var(--gold); stroke-width:8; stroke-linecap:round; stroke-dasharray:440; }
.ch-ring-text { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; }
.ch-pct   { font-family:var(--fh); font-size:2rem; color:var(--gold); }
.ch-pct-l { font-family:var(--fs); font-size:11px; color:var(--cream2); letter-spacing:.1em; }
.ch-stats { display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1.5rem; }
.ch-stat  { text-align:center; padding:1rem; background:var(--bg1); border-radius:4px; }
.ch-stat-n { font-family:var(--fh); font-size:1.5rem; color:var(--gold); }
.ch-stat-l { font-size:12px; color:var(--cream2); font-family:var(--fs); }
.ch-add-btn { width:100%; padding:10px; background:var(--gold); border:none; border-radius:3px; font-family:var(--fh); font-size:13px; letter-spacing:.1em; color:var(--bg0); cursor:pointer; transition:background .2s; }
.ch-add-btn:hover { background:var(--gold2); }
</style>
