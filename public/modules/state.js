// Shared application state

const urlParams = new URLSearchParams(window.location.search);

const state = {
  currentFilePath: urlParams.get('path'),
  isExternalFile: urlParams.get('external') === 'true'
};

export function getState() {
  return state;
}

export function updateState(updates) {
  Object.assign(state, updates);
}

export function getCurrentFilePath() {
  return state.currentFilePath;
}

export function isExternalFile() {
  return state.isExternalFile;
}
