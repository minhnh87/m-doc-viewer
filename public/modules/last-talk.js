// L hotkey: cycle last_talk.md → last_talk_1.md → … → last_talk_4.md → last_talk.md,
// skipping files that don't exist.
//   - no ?f= active: files in the project root
//   - ?f={folder} active: files in {folder}/.clsessions/

import { apiFetch } from './api.js';
import { navigateToFile } from './navigation.js';
import { getState } from './state.js';

const LAST_TALK_FILES = ['last_talk.md', 'last_talk_1.md', 'last_talk_2.md', 'last_talk_3.md', 'last_talk_4.md'];

/**
 * Paths to try, in order, for the next L press: the files after `currentPath`
 * (wrapping around), ending with `currentPath` itself. When `currentPath` is
 * not one of the last_talk files in `dir`, starts at last_talk.md.
 */
export function nextLastTalkPaths(dir, currentPath) {
  const paths = LAST_TALK_FILES.map(name => (dir ? `${dir}/${name}` : name));
  const index = paths.indexOf(currentPath);
  return [...paths.slice(index + 1), ...paths.slice(0, index + 1)];
}

function lastTalkDir(folderFilter) {
  if (!folderFilter) return '';
  const sessionsDir = (window.APP_CONFIG || {}).SESSIONS_DIR_NAME || '.clsessions';
  return `${folderFilter.replace(/\/+$/, '')}/${sessionsDir}`;
}

async function fileExists(path, isExternal) {
  try {
    await apiFetch(`/api/content?path=${encodeURIComponent(path)}&external=${isExternal}`);
    return true;
  } catch {
    return false;
  }
}

export async function openNextLastTalk() {
  const { folderFilter, currentFilePath } = getState();
  const isExternal = Boolean(folderFilter);

  for (const path of nextLastTalkPaths(lastTalkDir(folderFilter), currentFilePath)) {
    if (await fileExists(path, isExternal)) {
      navigateToFile(path, isExternal);
      return;
    }
  }
  console.error('No last_talk file found');
  alert('Khong co file last_talk trong thu muc nay');
}
