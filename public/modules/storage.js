// External folders localStorage management

const EXTERNAL_FOLDERS_KEY = 'externalFolders';

export function getExternalFolders() {
  try {
    return JSON.parse(localStorage.getItem(EXTERNAL_FOLDERS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveExternalFolders(folders) {
  localStorage.setItem(EXTERNAL_FOLDERS_KEY, JSON.stringify(folders));
}

export function addExternalFolder(path) {
  const folders = getExternalFolders();
  if (!folders.includes(path)) {
    folders.push(path);
    saveExternalFolders(folders);
  }
}

export function removeExternalFolder(path) {
  const folders = getExternalFolders();
  const index = folders.indexOf(path);
  if (index > -1) {
    folders.splice(index, 1);
    saveExternalFolders(folders);
  }
}
