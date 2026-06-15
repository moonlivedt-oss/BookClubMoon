<template>
  <Teleport to="body">
    <TransitionGroup name="toast" tag="div" class="toast-wrap">
      <div
        v-for="t in toasts"
        :key="t.id"
        class="toast"
        :class="`toast-${t.type}`"
        @click="remove(t.id)"
      >
        <span class="toast-ico">{{ t.icon }}</span>
        <span class="toast-msg">{{ t.msg }}</span>
        <button class="toast-x" @click.stop="remove(t.id)" aria-label="Закрыть">×</button>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup>
import { useToast } from '../composables/useToast.js'
const { toasts, remove } = useToast()
</script>

<style scoped>
.toast-wrap {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 999999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  pointer-events: none;
  width: max-content;
  max-width: calc(100vw - 2rem);
}

.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  background: var(--bg-float);
  border: 1px solid var(--gb);
  border-radius: 30px;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 8px 32px rgba(0,0,0,.25);
  font-family: var(--fs);
  font-size: 14px;
  color: var(--cream);
  cursor: pointer;
  pointer-events: auto;
  white-space: nowrap;
  max-width: 400px;
}
.toast-success { border-color: rgba(100, 180, 100, .4); }
.toast-error   { border-color: rgba(200, 80, 80, .4);  }

.toast-ico {
  font-size: 16px;
  flex-shrink: 0;
}
.toast-msg {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.toast-x {
  background: transparent;
  border: none;
  color: var(--cream2);
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  padding: 0 0 0 4px;
  flex-shrink: 0;
  transition: color .2s;
}
.toast-x:hover { color: var(--gold); }

/* Animations */
.toast-enter-active { animation: toast-in .35s cubic-bezier(.215,.61,.355,1); }
.toast-leave-active { animation: toast-out .3s ease forwards; }
.toast-move         { transition: transform .35s ease; }

@keyframes toast-in  {
  from { opacity: 0; transform: translateY(16px) scale(.92); }
  to   { opacity: 1; transform: translateY(0)    scale(1);   }
}
@keyframes toast-out {
  from { opacity: 1; transform: scale(1); }
  to   { opacity: 0; transform: scale(.88); }
}
</style>
