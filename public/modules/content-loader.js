// Content loading: Markdown, DrawIO, Mermaid

import { generateOutline, renderOutline } from './outline.js';
import { setupScrollSpy } from './scroll-spy.js';
import { getState } from './state.js';
import { apiFetch } from './api.js';

// Scope every <style> tag inside container so its rules only apply
// inside .markdown-body. Markdown content sometimes ships its own <style>
// block which would otherwise leak and override chrome UI (tabs, sidebar).
function scopeStyleTags(container) {
  const styles = container.querySelectorAll('style');
  for (const styleEl of styles) {
    const raw = styleEl.textContent || '';
    try {
      styleEl.textContent = scopeCss(raw);
    } catch {
      styleEl.remove();
    }
  }
}

function scopeCss(css) {
  const SCOPE = '.markdown-body';
  // Strip /* comments */
  let src = css.replace(/\/\*[\s\S]*?\*\//g, '');
  let out = '';
  let i = 0;
  while (i < src.length) {
    // Skip whitespace
    while (i < src.length && /\s/.test(src[i])) { out += src[i]; i++; }
    if (i >= src.length) break;

    if (src[i] === '@') {
      // @-rule: read identifier
      const start = i;
      while (i < src.length && src[i] !== '{' && src[i] !== ';') i++;
      if (i >= src.length) { out += src.slice(start); break; }
      if (src[i] === ';') { out += src.slice(start, i + 1); i++; continue; }
      const prelude = src.slice(start, i);
      const ident = (prelude.match(/^@([\w-]+)/) || [])[1] || '';
      if (/^(media|supports|container|layer|scope)$/i.test(ident)) {
        // Recursively scope inner block
        const { body, end } = readBlock(src, i);
        out += `${prelude}{${scopeCss(body)}}`;
        i = end;
      } else {
        // keyframes, font-face, import, charset, page — keep as-is
        const { body, end } = readBlock(src, i);
        out += `${prelude}{${body}}`;
        i = end;
      }
      continue;
    }

    // Regular rule: read selector list until '{'
    const selStart = i;
    while (i < src.length && src[i] !== '{') i++;
    if (i >= src.length) { out += src.slice(selStart); break; }
    const selectorPart = src.slice(selStart, i);
    const { body, end } = readBlock(src, i);
    const scoped = selectorPart
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .map(s => `${SCOPE} ${s}`)
      .join(', ');
    out += `${scoped}{${body}}`;
    i = end;
  }
  return out;
}

function readBlock(src, openBraceIdx) {
  let depth = 0;
  let i = openBraceIdx;
  if (src[i] !== '{') return { body: '', end: i };
  depth = 1;
  i++;
  const start = i;
  while (i < src.length && depth > 0) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') depth--;
    if (depth === 0) break;
    i++;
  }
  return { body: src.slice(start, i), end: i + 1 };
}

export async function loadMarkdown() {
  const state = getState();
  const currentFilePath = state.currentFilePath;
  const isExternalFile = state.isExternalFile;

  try {
    const externalParam = isExternalFile ? '&external=true' : '';
    const data = await apiFetch(`/api/content?path=${encodeURIComponent(currentFilePath)}${externalParam}`);

    const fileName = currentFilePath.split('/').pop();
    document.getElementById('file-title').textContent = fileName;
    document.title = fileName;

    const { outline, html } = generateOutline(data.html);

    const contentDiv = document.getElementById('markdown-content');
    const loadingDiv = document.getElementById('loading');

    loadingDiv.style.display = 'none';
    contentDiv.innerHTML = html;
    scopeStyleTags(contentDiv);

    renderOutline(outline);
    setupScrollSpy(outline);

  } catch (error) {
    console.error('Error loading markdown:', error);
    document.getElementById('loading').innerHTML = `Error: ${error.message}`;
  }
}

export async function loadDrawio() {
  const state = getState();
  const currentFilePath = state.currentFilePath;
  const isExternalFile = state.isExternalFile;

  try {
    const externalParam = isExternalFile ? '&external=true' : '';
    const data = await apiFetch(`/api/content?path=${encodeURIComponent(currentFilePath)}${externalParam}`);

    const fileName = currentFilePath.split('/').pop();
    document.getElementById('file-title').textContent = fileName;
    document.title = fileName;

    const contentDiv = document.getElementById('markdown-content');
    const loadingDiv = document.getElementById('loading');

    loadingDiv.style.display = 'none';

    const diagramContainer = document.createElement('div');
    diagramContainer.className = 'mxgraph';
    diagramContainer.style.maxWidth = '100%';
    diagramContainer.style.border = '1px solid var(--border-primary)';
    diagramContainer.style.borderRadius = '8px';
    diagramContainer.style.overflow = 'hidden';
    diagramContainer.style.background = 'var(--diagram-bg)';

    diagramContainer.setAttribute('data-mxgraph', JSON.stringify({
      highlight: '#0000ff',
      nav: true,
      resize: true,
      toolbar: 'zoom layers lightbox',
      xml: data.content
    }));

    contentDiv.innerHTML = '';
    contentDiv.appendChild(diagramContainer);

    renderOutline([]);

    if (window.GraphViewer) {
      GraphViewer.createViewerForElement(diagramContainer);
    } else {
      const checkViewer = setInterval(() => {
        if (window.GraphViewer) {
          clearInterval(checkViewer);
          GraphViewer.createViewerForElement(diagramContainer);
        }
      }, 100);

      setTimeout(() => clearInterval(checkViewer), 10000);
    }

  } catch (error) {
    console.error('Error loading drawio:', error);
    document.getElementById('loading').innerHTML = `Error: ${error.message}`;
  }
}

export async function loadMermaid() {
  const state = getState();
  const currentFilePath = state.currentFilePath;
  const isExternalFile = state.isExternalFile;

  try {
    const externalParam = isExternalFile ? '&external=true' : '';
    const data = await apiFetch(`/api/content?path=${encodeURIComponent(currentFilePath)}${externalParam}`);

    const fileName = currentFilePath.split('/').pop();
    document.getElementById('file-title').textContent = fileName;
    document.title = fileName;

    const contentDiv = document.getElementById('markdown-content');
    const loadingDiv = document.getElementById('loading');

    loadingDiv.style.display = 'none';

    const diagramContainer = document.createElement('div');
    diagramContainer.className = 'mermaid-container';
    diagramContainer.style.maxWidth = '100%';
    diagramContainer.style.padding = '20px';
    diagramContainer.style.background = 'var(--diagram-bg)';
    diagramContainer.style.borderRadius = '8px';
    diagramContainer.style.border = '1px solid var(--border-primary)';
    diagramContainer.style.overflow = 'auto';

    const mermaidDiv = document.createElement('div');
    mermaidDiv.className = 'mermaid';
    mermaidDiv.textContent = data.content;
    diagramContainer.appendChild(mermaidDiv);

    contentDiv.innerHTML = '';
    contentDiv.appendChild(diagramContainer);

    renderOutline([]);

    if (window.mermaid) {
      try {
        await mermaid.run({ nodes: [mermaidDiv] });
      } catch (mermaidError) {
        console.error('Mermaid render error:', mermaidError);
        mermaidDiv.innerHTML = `<pre style="color: red;">Mermaid syntax error:\n${mermaidError.message}</pre><pre>${data.content}</pre>`;
      }
    }

  } catch (error) {
    console.error('Error loading mermaid:', error);
    document.getElementById('loading').innerHTML = `Error: ${error.message}`;
  }
}

export function loadContent() {
  const state = getState();
  const currentFilePath = state.currentFilePath;

  if (!currentFilePath) return;

  if (currentFilePath.endsWith('.drawio')) {
    loadDrawio();
  } else if (currentFilePath.endsWith('.mermaid') || currentFilePath.endsWith('.mmd')) {
    loadMermaid();
  } else {
    loadMarkdown();
  }
}
