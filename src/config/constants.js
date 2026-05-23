export const EXCLUDED_DIRS = ['.git', 'node_modules', 'public', '.ipam'];
export const ALLOWED_HIDDEN_DIRS = ['.claude'];
export const SUPPORTED_EXTENSIONS = ['.md', '.drawio', '.mermaid', '.mmd'];

export const FILE_TYPES = {
  MARKDOWN: 'markdown',
  DRAWIO: 'drawio',
  MERMAID: 'mermaid',
};

export function getFileType(ext) {
  const lower = ext.toLowerCase();
  if (lower === '.drawio') return FILE_TYPES.DRAWIO;
  if (lower === '.mermaid' || lower === '.mmd') return FILE_TYPES.MERMAID;
  return FILE_TYPES.MARKDOWN;
}
