// Export to static HTML

// styles.css is inlined at build time (esbuild `--loader:.css=text`). This is
// the reliable way to obtain the CSS on file://, where fetch() is blocked and
// stylesheet.cssRules throws SecurityError for local sheets.
import STYLES_CSS from '../styles.css';

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function buildStaticHTML(title, markdownContent, outlineContent, cssContent, theme) {
  const layoutOverride = `
    /* Override for 2-column layout (no file tree) */
    .file-tree-sidebar,
    .toggle-file-tree,
    .close-sidebar {
      display: none !important;
    }

    .viewer-layout {
      grid-template-columns: 1fr var(--sidebar-width) !important;
    }

    .viewer-header {
      display: flex !important;
      justify-content: space-between;
      align-items: center;
      padding: 12px 20px;
      border-bottom: 1px solid var(--border-primary);
      background: var(--bg-primary);
    }

    .header-left, .header-right {
      display: none;
    }

    .header-center {
      flex: 1;
    }

    .file-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }

    @media (max-width: 1024px) {
      .viewer-layout {
        grid-template-columns: 1fr !important;
      }

      .outline-sidebar {
        position: fixed !important;
        top: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 280px !important;
        transform: translateX(100%) !important;
        transition: transform 0.2s ease !important;
        z-index: 200 !important;
      }

      .outline-sidebar.open {
        transform: translateX(0) !important;
      }

      .toggle-outline {
        display: flex !important;
        position: fixed !important;
        bottom: 20px !important;
        right: 20px !important;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        background: var(--accent-primary);
        color: white;
        border: none;
        border-radius: 20px;
        cursor: pointer;
        z-index: 100;
      }

      .outline-header .close-sidebar {
        display: flex !important;
      }
    }

    @media (min-width: 1025px) {
      .toggle-outline,
      .outline-header .close-sidebar {
        display: none !important;
      }
    }
  `;

  const scrollSpyJS = `
    document.addEventListener('DOMContentLoaded', function() {
      const links = document.querySelectorAll('.outline-link');
      const content = document.querySelector('.viewer-content');

      // Smooth scroll on click
      links.forEach(link => {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          const targetId = this.getAttribute('href').substring(1);
          const target = document.getElementById(targetId);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            links.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
          }
        });
      });

      // Scroll spy
      if (content) {
        content.addEventListener('scroll', function() {
          let current = '';
          const headings = document.querySelectorAll('[id^="heading-"]');

          headings.forEach(heading => {
            const rect = heading.getBoundingClientRect();
            if (rect.top <= 100) {
              current = heading.id;
            }
          });

          links.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
              link.classList.add('active');
            }
          });
        });
      }

      // Mobile toggle
      const toggleBtn = document.getElementById('toggle-outline');
      const outlineSidebar = document.querySelector('.outline-sidebar');
      const closeBtn = document.getElementById('close-outline');

      if (toggleBtn && outlineSidebar) {
        toggleBtn.addEventListener('click', function() {
          outlineSidebar.classList.add('open');
        });
      }

      if (closeBtn && outlineSidebar) {
        closeBtn.addEventListener('click', function() {
          outlineSidebar.classList.remove('open');
        });
      }

      // Close outline when clicking a link on mobile
      links.forEach(link => {
        link.addEventListener('click', function() {
          if (window.innerWidth <= 1024 && outlineSidebar) {
            outlineSidebar.classList.remove('open');
          }
        });
      });
    });
  `;

  return `<!DOCTYPE html>
<html lang="en" data-theme="${theme === 'dark' ? 'dark' : 'light'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(title)}</title>
  <style>
${cssContent}

${layoutOverride}
  </style>
</head>
<body>
  <div class="viewer-container">
    <header class="viewer-header">
      <div class="header-left"></div>
      <div class="header-center">
        <h1 class="file-title">${escapeHTML(title)}</h1>
      </div>
      <div class="header-right"></div>
    </header>

    <div class="viewer-layout">
      <!-- Main Content -->
      <main class="viewer-content">
        <div class="markdown-body">
${markdownContent}
        </div>
      </main>

      <!-- Right Sidebar: Outline -->
      <aside class="outline-sidebar">
        <div class="outline-header">
          <h3>Outline</h3>
          <button id="close-outline" class="close-sidebar">\u2715</button>
        </div>
        <nav id="outline" class="outline">
${outlineContent}
        </nav>
      </aside>
    </div>

    <!-- Mobile Toggle Button -->
    <button id="toggle-outline" class="toggle-outline">
      <span>\u2630</span> Outline
    </button>
  </div>

  <script>
${scrollSpyJS}
  </script>
</body>
</html>`;
}

// Collect the page's CSS from already-loaded stylesheets. Avoids fetch(), which
// is blocked for local files on file:// . Falls back to inline <style> tags if a
// stylesheet's rules are cross-origin / unreadable.
function collectCss() {
  let css = '';
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      const rules = sheet.cssRules;
      if (!rules) continue;
      for (const rule of Array.from(rules)) css += `${rule.cssText}\n`;
    } catch {
      // cross-origin (e.g. CDN) or file:// -blocked sheet — skip it.
    }
  }
  if (!css) {
    for (const styleEl of Array.from(document.querySelectorAll('style'))) {
      css += `${styleEl.textContent || ''}\n`;
    }
  }
  return css;
}

export async function exportToStaticHTML() {
  try {
    const title = document.getElementById('file-title').textContent || 'Exported Document';
    const markdownContent = document.getElementById('markdown-content').innerHTML;
    const outlineContent = document.getElementById('outline').innerHTML;

    const cssContent = STYLES_CSS || collectCss();
    const theme = document.documentElement.getAttribute('data-theme') || 'light';

    const staticHTML = buildStaticHTML(title, markdownContent, outlineContent, cssContent, theme);

    const blob = new Blob([staticHTML], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9\u00C0-\u024F]/gi, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Export error:', error);
    alert('Failed to export: ' + error.message);
  }
}
