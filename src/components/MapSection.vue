<template>
  <section id="map-sec">
    <div class="sec-in">
      <div class="rev" style="margin-bottom:2.5rem">
        <span class="sec-lb">2ГИС · Карта</span>
        <h2 class="sec-h">Найдите <em>библиотеку</em></h2>
        <div class="sec-div"></div>
      </div>

      <div class="map-layout rev">
        <!-- Sidebar -->
        <div class="map-sb">
          <div class="map-tabs">
            <button class="mtab" :class="{ on: tab === 'libs' }"    @click="tab = 'libs'">📚 Библиотеки</button>
            <button class="mtab" :class="{ on: tab === 'museums' }" @click="tab = 'museums'">🏛️ Музеи</button>
          </div>

          <div class="sb-list">
            <template v-if="tab === 'libs'">
              <div class="lib-item" v-for="l in LIBRARIES" :key="l.n"
                :class="{ act: selected?.n === l.n }" @click="select(l, false)">
                <div class="lib-nm">{{ l.n }}</div>
                <div class="lib-ad">{{ l.a }}</div>
                <span class="lib-bg lib">{{ l.b }}</span>
              </div>
            </template>
            <template v-else>
              <div class="lib-item" v-for="m in MUSEUMS" :key="m.n"
                :class="{ act: selected?.n === m.n }" @click="select(m, true)">
                <div class="lib-nm">{{ m.n }}</div>
                <div class="lib-ad">{{ m.a }}</div>
                <span class="lib-bg mus">{{ m.b }}</span>
              </div>
            </template>
          </div>

          <!-- Info card -->
          <div class="map-info-card" v-if="selected">
            <button class="mic-close" @click="selected = null">✕</button>
            <span class="mic-badge" :class="isMuseum ? 'mic-mus' : 'mic-lib'">
              {{ isMuseum ? '🏛️ ' + selected.b : '📚 ' + selected.b }}
            </span>
            <div class="mic-name">{{ selected.n }}</div>
            <div class="mic-addr">📍 {{ selected.a }}</div>
            <div class="mic-desc" v-if="selected.desc">{{ selected.desc }}</div>
            <div class="mic-hours" v-if="selected.hours">⏰ {{ selected.hours }}</div>
          </div>
        </div>

        <!-- Map -->
        <div id="mapCont">
          <div class="map-nk" v-if="!mapReady">
            <strong>🗺️ Карта библиотек</strong>
            <p>Введите ключ 2ГИС API</p>
            <input class="map-ki" v-model="apiKey" placeholder="Ваш ключ 2ГИС API…" />
            <button class="map-kb" @click="initMap">Загрузить карту</button>
            <p style="font-size:12px;opacity:.5">Ключ на <span style="color:var(--gold)">dev.2gis.ru</span></p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { LIBRARIES, MUSEUMS } from '@/data/libraries.js'

const DGIS_KEY = '8d0eaa42-9e21-4986-8fba-b17d42cbde42'

const tab      = ref('libs')
const selected = ref(null)
const isMuseum = ref(false)
const mapReady = ref(false)
const apiKey   = ref(DGIS_KEY)
let   mapInst  = null

function select(obj, museum) {
  selected.value = obj
  isMuseum.value = museum
  if (mapInst) mapInst.setCenter(obj.c, { animate: true, duration: 700 })
}

function mkMarkerHtml(emoji, color) {
  return `<div style="width:36px;height:36px;background:${color};border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0,0,0,.7);cursor:pointer;border:2px solid rgba(255,255,255,.5);"><span style="transform:rotate(45deg);font-size:16px;line-height:1">${emoji}</span></div>`
}

function addMarkers() {
  // Library markers — gold
  LIBRARIES.forEach(lib => {
    try {
      const m = new mapgl.HtmlMarker(mapInst, {
        coordinates: lib.c,
        html: mkMarkerHtml('📚', '#C9A84C'),
        anchor: 'center',
      })
      m.on('click', () => { tab.value = 'libs'; select(lib, false) })
    } catch (e) { console.warn('Lib marker error:', e) }
  })

  // Museum markers — purple
  MUSEUMS.forEach(mus => {
    try {
      const m = new mapgl.HtmlMarker(mapInst, {
        coordinates: mus.c,
        html: mkMarkerHtml('🏛️', '#9B6BCC'),
        anchor: 'center',
      })
      m.on('click', () => { tab.value = 'museums'; select(mus, true) })
    } catch (e) { console.warn('Museum marker error:', e) }
  })
}

async function initMap() {
  const key = apiKey.value.trim()
  if (!key) { alert('Введите ключ 2ГИС API'); return }
  if (typeof mapgl === 'undefined') {
    console.error('2GIS SDK не загружен')
    return
  }

  // Wait for Vue to finish rendering before initialising the map
  await nextTick()

  // Remove the placeholder div so the map can take full height
  mapReady.value = true
  await nextTick()

  try {
    mapInst = new mapgl.Map('mapCont', {
      center: [135.0726, 48.4820],
      zoom: 13,
      key,
    })

    // 'load' fires when tiles are ready — safe to add markers here
    mapInst.on('load', () => {
      addMarkers()
    })
  } catch (e) {
    console.error('Map init error:', e)
    mapReady.value = false
  }
}

onMounted(() => {
  // Give the DOM one extra tick so #mapCont is fully sized before init
  nextTick(() => {
    if (DGIS_KEY) initMap()
  })
})
</script>

<style scoped>
section { padding:5rem 2.5rem; background:var(--bg0); }

.map-layout {
  display:grid; grid-template-columns:300px 1fr;
  border:1px solid var(--gb); border-radius:6px; overflow:hidden; min-height:500px;
}
.map-sb {
  background:var(--bg2); display:flex; flex-direction:column;
  border-right:1px solid var(--gb);
}
.map-tabs { display:flex; border-bottom:1px solid var(--bord); flex-shrink:0; }
.mtab {
  flex:1; padding:.75rem .5rem; background:transparent;
  border:none; border-bottom:2px solid transparent;
  font-family:var(--fs); font-size:12px; letter-spacing:.05em;
  color:var(--cream2); cursor:pointer; transition:all .2s;
}
.mtab.on { color:var(--gold); border-bottom-color:var(--gold); background:var(--gp); }

.sb-list { overflow-y:auto; flex:1; }

.lib-item {
  padding:.9rem 1.5rem; border-bottom:1px solid var(--bord);
  cursor:pointer; transition:background .2s;
}
.lib-item:hover, .lib-item.act { background:var(--gp); }
.lib-nm { font-family:var(--fs); font-size:13px; font-weight:500; color:var(--cream); margin-bottom:3px; }
.lib-ad { font-size:12px; color:var(--cream2); }
.lib-bg {
  display:inline-block; padding:2px 8px; border-radius:10px;
  font-size:10px; letter-spacing:.1em; margin-top:4px;
}
.lib-bg.lib { background:rgba(201,168,76,.15); border:1px solid var(--gb); color:var(--gold); }
.lib-bg.mus { background:rgba(155,107,204,.15); border:1px solid rgba(155,107,204,.4); color:#B088E0; }

.map-info-card {
  border-top:2px solid var(--gb); padding:1.25rem 1.5rem;
  background:var(--bg1); position:relative; flex-shrink:0;
}
.mic-close {
  position:absolute; top:.75rem; right:.75rem;
  background:transparent; border:none; color:var(--cream2); font-size:14px; cursor:pointer;
}
.mic-badge {
  display:inline-block; padding:3px 10px; border-radius:10px;
  font-size:11px; letter-spacing:.08em; margin-bottom:.75rem;
}
.mic-lib { background:rgba(201,168,76,.15); border:1px solid var(--gb); color:var(--gold); }
.mic-mus { background:rgba(155,107,204,.15); border:1px solid rgba(155,107,204,.4); color:#B088E0; }
.mic-name  { font-family:var(--fh); font-size:14px; color:var(--cream); margin-bottom:.5rem; }
.mic-addr  { font-size:12px; color:var(--cream2); margin-bottom:.5rem; }
.mic-desc  { font-size:13px; color:var(--cream2); line-height:1.6; margin-bottom:.5rem; }
.mic-hours { font-size:12px; color:var(--gold); }

#mapCont { height:100%; min-height:500px; }
.map-nk {
  height:500px; display:flex; flex-direction:column; align-items:center;
  justify-content:center; gap:1rem; background:var(--bg2);
  color:var(--cream2); font-family:var(--fs); font-size:15px; text-align:center; padding:2rem;
}
.map-nk strong { color:var(--gold); font-family:var(--fh); font-size:1.1rem; }
.map-ki {
  width:100%; max-width:380px; background:rgba(255,255,255,.05); border:1px solid var(--gb);
  border-radius:3px; padding:10px 14px; font-family:var(--fs); font-size:14px;
  color:var(--cream); outline:none; text-align:center;
}
.map-kb {
  padding:10px 24px; background:var(--gold); border:none; border-radius:2px;
  font-family:var(--fh); font-size:12px; letter-spacing:.1em; color:var(--bg0); cursor:pointer;
  transition:background .2s;
}
.map-kb:hover { background:var(--gold2); }
</style>
