export interface HeadingProvider {
  current: number // look yaw in world space (radians)
}

// Camera is the centre of a dome. heading = yaw, pitch = elevation.
export const heading: HeadingProvider = { current: Math.PI }
export const pitch: HeadingProvider = { current: 0.14 }

export function setHeading(h: number) {
  heading.current = h
}

export function setPitch(p: number) {
  pitch.current = p
}

// Camera tuning.
export const PITCH_MIN = -1.05 // -60deg
export const PITCH_MAX = 1.05 // +60deg
export const SHELL_RADIUS = 58 // content is printed on the dome at this radius

// 3D view direction from yaw + pitch. Forward world vector = (-sin y, 0, -cos y)
// at pitch 0, tilted upward by pitch.
export function viewDir(out: { x: number; y: number; z: number }, yaw: number, pit: number) {
  const cp = Math.cos(pit)
  out.x = -Math.sin(yaw) * cp
  out.y = Math.sin(pit)
  out.z = -Math.cos(yaw) * cp
  return out
}

// Latest smoothed look speeds, shared with CameraRig / Particles.
export const lookMotion = { yawSpeed: 0, pitchSpeed: 0 }

// Scroll section flow: wheel advances one CV section at a time. `locked` is
// true while the head is still easing to the current section (buffers at most
// one extra step in `pending`). Set from the frame loop.
export const flow = { locked: false, pending: 0 as 0 | 1 | -1 }
export const FLOW_SETTLE = 0.06 // rad; under this a section swing is "landed"

// Resting camera FOV in degrees (higher = zoom out, lower = zoom in).
// The camera stays at the centre of the dome, so zoom narrows/widens the FOV.
// Scroll no longer re-maps the wheel to FOV — sections own the wheel, and the
// FOV is a fixed comfortable reading value (aim-pull still applies in free roam).
export const zoom = { current: 52 }
export const ZOOM_MIN = 28
export const ZOOM_MAX = 95
export function setZoom(z: number) {
  zoom.current = z
}