export const LS_KEY = 'btrc-v2'

export const loadState = () => {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '{}')
  } catch {
    return {}
  }
}

export const saveState = (s) => {
  localStorage.setItem(LS_KEY, JSON.stringify(s))
}

export const clearState = () => {
  localStorage.removeItem(LS_KEY)
}