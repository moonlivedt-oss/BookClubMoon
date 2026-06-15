import { onMounted, onUnmounted } from 'vue'

let observer = null

export function useReveal() {
  onMounted(() => {
    observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('show') }),
      { threshold: 0.08 }
    )
    document.querySelectorAll('.rev').forEach(el => observer.observe(el))
  })
  onUnmounted(() => observer?.disconnect())
}

export function useCountUp() {
  onMounted(() => {
    const so = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return
        const el = e.target
        const target = +el.dataset.target
        let cur = 0
        const inc = setInterval(() => {
          cur = Math.min(cur + target / 90, target)
          el.textContent = Math.floor(cur) + (target > 10 ? '+' : '')
          if (cur >= target) clearInterval(inc)
        }, 16)
        so.unobserve(el)
      })
    }, { threshold: 0.5 })
    document.querySelectorAll('[data-target]').forEach(el => so.observe(el))
  })
}
