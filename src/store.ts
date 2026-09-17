import { create } from 'zustand'

export type CameraMode = 'orbit' | 'cinematic'
export type ZoneId = 'landing' | 'skills' | 'projects' | 'career' | 'hubs'

export interface ActiveInteraction {
  type: 'skill' | 'project' | 'career' | 'terminal'
  id: string
}

// Look-tour waypoints through the constellations (dome view).
export const TOUR: ZoneId[] = ['landing', 'skills', 'projects', 'career', 'hubs']

export interface BurstFx {
  at: [number, number, number]
  color: string
  time: number
}

interface GameState {
  phase: 'intro' | 'playing'
  started: boolean // has user engaged controls
  mode: '3d' | '2d'
  cameraMode: CameraMode
  currentZone: ZoneId | null
  facingZone: ZoneId | null
  activeInteraction: ActiveInteraction | null
  tourSheetOpen: boolean // right-side sheet showing the current section's content
  projectDetail: string | null
  careerDetail: string | null
  contactOpen: boolean
  controlsEnabled: boolean
  loading: boolean // 3D scene is loading
  tourIndex: number // -1 = manual/free roam, else waypoint index
  burst: BurstFx | null // one-shot particle burst trigger

  setPhase: (p: GameState['phase']) => void
  setStarted: (s: boolean) => void
  setMode: (m: '3d' | '2d') => void
  setCameraMode: (m: CameraMode) => void
  setZone: (z: ZoneId | null) => void
  setFacingZone: (z: ZoneId | null) => void
  setInteraction: (i: ActiveInteraction | null) => void
  setTourSheetOpen: (b: boolean) => void
  setProjectDetail: (p: string | null) => void
  setCareerDetail: (c: string | null) => void
  setContactOpen: (b: boolean) => void
  setControlsEnabled: (b: boolean) => void
  setLoading: (b: boolean) => void
  setTourIndex: (i: number) => void
  triggerBurst: (at: [number, number, number], color: string) => void
  clearBurst: () => void
}

export const useGame = create<GameState>((set) => ({
  phase: 'intro',
  started: false,
  mode: '3d',
  cameraMode: 'orbit',
  currentZone: null,
  facingZone: null,
  activeInteraction: null,
  tourSheetOpen: false,
  projectDetail: null,
  careerDetail: null,
  contactOpen: false,
  controlsEnabled: false,
  loading: false,
  tourIndex: -1,
  burst: null,

  setPhase: (phase) => set({ phase }),
  setStarted: (started) => set({ started }),
  setMode: (mode) => set({ mode }),
  setCameraMode: (cameraMode) => set({ cameraMode }),
  setZone: (currentZone) => set({ currentZone }),
  setFacingZone: (facingZone) => set({ facingZone }),
  setInteraction: (activeInteraction) => set({ activeInteraction }),
  setTourSheetOpen: (tourSheetOpen) => set({ tourSheetOpen }),
  setProjectDetail: (projectDetail) => set({ projectDetail }),
  setCareerDetail: (careerDetail) => set({ careerDetail }),
  setContactOpen: (contactOpen) => set({ contactOpen }),
  setControlsEnabled: (controlsEnabled) => set({ controlsEnabled }),
  setLoading: (loading) => set({ loading }),
  setTourIndex: (tourIndex) => set({ tourIndex }),
  triggerBurst: (at, color) => set({ burst: { at, color, time: Date.now() } }),
  clearBurst: () => set({ burst: null }),
}))
