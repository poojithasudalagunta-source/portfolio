import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import {
  MotionConfig,
  motion,
  useMotionValue,
  useReducedMotion,
  useInView,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'

export const spring = { stiffness: 120, damping: 20, mass: 0.8 }
export const easeOut = [0.22, 1, 0.36, 1]

export const reveal = {
  hidden: { opacity: 1, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
}

export const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14, delayChildren: 0.1 } },
}

const SceneProgressContext = createContext(null)

export function MotionSystem({ children }) {
  return <MotionConfig reducedMotion="user" transition={{ type: 'spring', ...spring }}>{children}</MotionConfig>
}

export function Scene({ children, className = '' }) {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  const [compact, setCompact] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches)
  const active = useInView(ref, { amount: 0.12 })
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.97, 1, 1, 0.985])
  const y = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [18, 0, 0, -8])
  const flowing = reduced || compact

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)')
    const update = () => setCompact(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  const style = !flowing
    ? { scale, y, willChange: active ? 'transform, opacity' : 'auto' }
    : undefined

  return (
    <SceneProgressContext.Provider value={!flowing ? scrollYProgress : null}>
      <section ref={ref} className={`scroll-scene${flowing ? ' scene-flowing' : ''}${className ? ` ${className}` : ''}`}>
        <motion.div className="scene-sticky" initial={flowing ? { opacity: 0.96 } : false} animate={flowing ? { opacity: 1 } : undefined} transition={{ duration: reduced ? 0.2 : 0.3, ease: easeOut }} style={style}>
          {children}
        </motion.div>
      </section>
    </SceneProgressContext.Provider>
  )
}

export function SceneItem({ children, index = 0, total = 1, as = 'div', className = '' }) {
  const sceneProgress = useContext(SceneProgressContext)
  const fallback = useMotionValue(1)
  const progress = sceneProgress || fallback
  const reduced = useReducedMotion()
  const denominator = Math.max(total - 1, 1)
  const start = 0.04 + (Math.min(index, total - 1) / denominator) * 0.1
  const y = useTransform(progress, [0, start, Math.min(start + 0.06, 0.2), 0.2, 0.8, 1], [12, 12, 0, 0, 0, -4])
  const style = sceneProgress && !reduced ? { y } : undefined
  const Component = as === 'span' ? motion.span : motion.div
  return <Component className={`scene-item${as === 'span' ? ' scene-item-inline' : ''}${className ? ` ${className}` : ''}`} style={style}>{children}</Component>
}

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 150, damping: 28, mass: 0.4 })
  return <motion.div className="scroll-progress" style={{ scaleX }} aria-hidden="true" />
}

export function useRevealProps(delay = 0) {
  const reduced = useReducedMotion()
  return reduced
    ? { initial: false, animate: 'visible' }
    : { initial: 'hidden', whileInView: 'visible', viewport: { once: true, amount: 0.2 }, transition: { delay } }
}

export function MagneticLink({ children, className = '', ...props }) {
  const reduced = useReducedMotion()
  const x = useSpring(0, spring)
  const y = useSpring(0, spring)

  const moveToPointer = (event) => {
    if (reduced || event.pointerType !== 'mouse') return
    const rect = event.currentTarget.getBoundingClientRect()
    x.set((event.clientX - rect.left - rect.width / 2) * 0.12)
    y.set((event.clientY - rect.top - rect.height / 2) * 0.12)
  }

  const reset = () => { x.set(0); y.set(0) }

  return (
    <motion.a
      {...props}
      className={className}
      style={{ x, y }}
      onPointerMove={moveToPointer}
      onPointerLeave={reset}
      whileHover={reduced ? undefined : { y: -2 }}
      whileTap={reduced ? undefined : { scale: 0.98 }}
    >
      {children}
    </motion.a>
  )
}

export function CustomCursor() {
  const reduced = useReducedMotion()
  const pointerX = useMotionValue(-100)
  const pointerY = useMotionValue(-100)
  const x = useSpring(pointerX, { stiffness: 420, damping: 36, mass: 0.35 })
  const y = useSpring(pointerY, { stiffness: 420, damping: 36, mass: 0.35 })
  const [state, setState] = useState({ visible: false, label: '' })
  const stateRef = useRef(state)

  useEffect(() => {
    if (reduced || !window.matchMedia('(pointer: fine)').matches) return undefined
    document.body.classList.add('custom-cursor-enabled')

    const onMove = (event) => {
      pointerX.set(event.clientX)
      pointerY.set(event.clientY)
      const target = event.target.closest?.('[data-cursor]')
      const next = { visible: true, label: target?.getAttribute('data-cursor') || '' }
      if (stateRef.current.visible !== next.visible || stateRef.current.label !== next.label) {
        stateRef.current = next
        setState(next)
      }
    }
    const onLeave = () => {
      stateRef.current = { visible: false, label: '' }
      setState(stateRef.current)
    }
    const onRouteChange = () => {
      const next = { visible: stateRef.current.visible, label: '' }
      stateRef.current = next
      setState(next)
    }
    const onPointerOut = (event) => { if (!event.relatedTarget) onLeave() }
    document.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerout', onPointerOut)
    window.addEventListener('blur', onLeave)
    window.addEventListener('hashchange', onRouteChange)
    return () => {
      document.body.classList.remove('custom-cursor-enabled')
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerout', onPointerOut)
      window.removeEventListener('blur', onLeave)
      window.removeEventListener('hashchange', onRouteChange)
    }
  }, [pointerX, pointerY, reduced])

  if (reduced) return null
  return (
    <motion.div
      className={`custom-cursor${state.label ? ' has-label' : ''}`}
      style={{ x, y }}
      animate={{ opacity: state.visible ? 1 : 0, scale: state.label ? 1 : 0.42 }}
      transition={{ type: 'spring', ...spring }}
      aria-hidden="true"
    >
      {state.label && <span>{state.label}</span>}
    </motion.div>
  )
}

