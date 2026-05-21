// Content loading: Markdown, DrawIO, Mermaid

import { generateOutline, renderOutline } from './outline.js';
import { setupScrollSpy } from './scroll-spy.js';
import { getState } from './state.js';
import { apiFetch } from './api.js';

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
    diagramContainer.style.background = '#fff';

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
    diagramContainer.style.background = '#fff';
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
