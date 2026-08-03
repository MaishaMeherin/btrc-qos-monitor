// Lightweight app-wide event bus.
//
// Domain code (missions, tests, …) *emits* events without knowing how they are
// presented. App.jsx subscribes and decides the reaction — celebration overlay,
// inbox notification, analytics, etc. This keeps "a mission completed" decoupled
// from "show a popup + notification".

const bus = new EventTarget()

export const AppEvents = {
  MISSION_COMPLETE: 'mission:complete',
}

// Subscribe to an event. Returns an unsubscribe function (handy in useEffect).
export function on(type, handler) {
  const wrapped = (e) => handler(e.detail)
  bus.addEventListener(type, wrapped)
  return () => bus.removeEventListener(type, wrapped)
}

// Emit an event with an arbitrary payload.
export function emit(type, detail) {
  bus.dispatchEvent(new CustomEvent(type, { detail }))
}

// Fired when a mission crosses from incomplete → complete.
export const emitMissionComplete = (mission) => emit(AppEvents.MISSION_COMPLETE, mission)
