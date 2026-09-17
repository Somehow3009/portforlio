// Tracks keyboard / virtual-joystick / pointer input in a shared mutable object.
//  - x = yaw input (-1..1), z = pitch input (-1..1)
//  - lookVel = yaw velocity from pointer drag look (rad/s)
//  - pitchVel = pitch velocity from pointer drag look (rad/s)

export interface InputState {
  x: number // -1 .. 1 (yaw steer)
  z: number // -1 .. 1 (pitch: look up / down)
  lookVel: number // rad/s from pointer-look drag (horizontal)
  pitchVel: number // rad/s from pointer-look drag (vertical)
  interact: boolean // E key or tap-action
}

export const inputState: InputState = { x: 0, z: 0, lookVel: 0, pitchVel: 0, interact: false }

// Touch joystick activity (used by TourController to let a firm drag break
// out of the guided section flow — the mobile equivalent of WASD).
export const joyState = { active: false, deflected: false }

const keys = new Set<string>()

export function bindInput() {
  const down = (e: KeyboardEvent) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault()
    }
    keys.add(e.key.toLowerCase())
    if (e.key.toLowerCase() === 'e') {
      inputState.interact = true
    }
  }
  const up = (e: KeyboardEvent) => {
    keys.delete(e.key.toLowerCase())
  }
  const blur = () => keys.clear()

  function updateFromKeys() {
    let x = 0
    let z = 0
    if (keys.has('w') || keys.has('arrowup')) z -= 1 // look up
    if (keys.has('s') || keys.has('arrowdown')) z += 1 // look down
    if (keys.has('a') || keys.has('arrowleft')) x -= 1
    if (keys.has('d') || keys.has('arrowright')) x += 1
    const len = Math.hypot(x, z)
    inputState.x = len > 0 ? x / len : 0
    inputState.z = len > 0 ? z / len : 0
  }

  // ---- virtual joystick (touch): horizontal = yaw, vertical = pitch ----
  let joyPointer: number | null = null
  const joyOrigin = { x: 0, y: 0 }

  function handleJoyMove(clientX: number, clientY: number) {
    let dx = clientX - joyOrigin.x
    let dy = clientY - joyOrigin.y
    const len = Math.hypot(dx, dy)
    const max = 60
    if (len > max) {
      dx = (dx / len) * max
      dy = (dy / len) * max
    }
    const mag = Math.min(len, max) / max
    if (mag > 0.4) joyState.deflected = true
    inputState.x = ((dx / max) * mag) || 0
    inputState.z = ((dy / max) * mag) || 0
  }

  const joyDown = (e: PointerEvent) => {
    if (joyPointer !== null) return
    if (!(e.target as HTMLElement | null)?.closest?.('#joyzone')) return
    joyPointer = e.pointerId
    joyOrigin.x = e.clientX
    joyOrigin.y = e.clientY
    joyState.active = true
    joyState.deflected = false
    e.preventDefault()
  }
  const joyMove = (e: PointerEvent) => {
    if (e.pointerId !== joyPointer) return
    handleJoyMove(e.clientX, e.clientY)
  }
  const joyUp = (e: PointerEvent) => {
    if (e.pointerId !== joyPointer) return
    joyPointer = null
    joyState.active = false
    joyState.deflected = false
    inputState.x = 0
    inputState.z = 0
  }

  // ---- pointer-look drag (desktop): drag empty space to look around ----
  // Guarded so dragging inside panels/inputs/browser UI doesn't spin the view.
  const LOOK_SENS = 0.0036 // radians per px
  const LOOK_SENS_Y = 0.0032
  let lookPointer: number | null = null
  let lookLast = { x: 0, y: 0 }

  function isUiTarget(e: EventTarget | null) {
    return (
      (e as HTMLElement | null)?.closest?.(
        'button, input, textarea, a, [data-ui], #joyzone, canvas-ui',
      ) != null
    )
  }

  const lookDown = (e: PointerEvent) => {
    if (lookPointer !== null) return
    if (e.button !== 0 && e.pointerType === 'mouse') return
    if (isUiTarget(e.target)) return
    lookPointer = e.pointerId
    lookLast.x = e.clientX
    lookLast.y = e.clientY
  }
  const lookMove = (e: PointerEvent) => {
    if (e.pointerId !== lookPointer) return
    const dx = e.clientX - lookLast.x
    const dy = e.clientY - lookLast.y
    lookLast.x = e.clientX
    lookLast.y = e.clientY
    // drag right -> look right; drag up -> look up
    inputState.lookVel = clamp(-dx * LOOK_SENS, -5, 5)
    inputState.pitchVel = clamp(dy * LOOK_SENS_Y, -3, 3)
  }
  const lookUp = (e: PointerEvent) => {
    if (e.pointerId === lookPointer) {
      lookPointer = null
      inputState.lookVel = 0
      inputState.pitchVel = 0
    }
  }

  // ---- scroll = CV sections (handled by TourController's wheel listener) ----

  window.addEventListener('keydown', down)
  window.addEventListener('keyup', up)
  window.addEventListener('blur', blur)

  // joystick listens at window level (delegated by #joyzone target) because
  // the touch layer mounts after input is bound (only in playing phase)
  window.addEventListener('pointerdown', joyDown)
  window.addEventListener('pointermove', joyMove)
  window.addEventListener('pointerup', joyUp)
  window.addEventListener('pointercancel', joyUp)

  // pointer-look listens on the scene layer (beneath UI); #joyzone on touch
  window.addEventListener('pointerdown', lookDown)
  window.addEventListener('pointermove', lookMove)
  window.addEventListener('pointerup', lookUp)
  window.addEventListener('pointercancel', lookUp)

  const interval = window.setInterval(updateFromKeys, 16)

  return () => {
    window.removeEventListener('keydown', down)
    window.removeEventListener('keyup', up)
    window.removeEventListener('blur', blur)
    window.removeEventListener('pointerdown', joyDown)
    window.removeEventListener('pointermove', joyMove)
    window.removeEventListener('pointerup', joyUp)
    window.removeEventListener('pointercancel', joyUp)
    window.removeEventListener('pointerdown', lookDown)
    window.removeEventListener('pointermove', lookMove)
    window.removeEventListener('pointerup', lookUp)
    window.removeEventListener('pointercancel', lookUp)
    clearInterval(interval)
  }
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}