// Get file path from URL parameters
const urlParams = new URLSearchParams(window.location.search);
let currentFilePath = urlParams.get('path');

if (!currentFilePath) {
  document.getElementById('loading').innerHTML = '❌ No file specified.';
}

// Load file tree
async function loadFileTree() {
  try {
    const response = await fetch('/api/files');
    const files = await response.json();

    const fileTreeNav = document.getElementById('file-tree');
    const loadingTree = fileTreeNav.querySelector('.loading-tree');

    if (loadingTree) {
      loadingTree.remove();
    }

    let html = '';

    // Sort folders alphabetically
    const sortedFolders = Object.keys(files).sort();

    for (const folder of sortedFolders) {
      const folderFiles = files[folder];
      const folderId = `folder-${folder.replace(/[^a-z0-9]/gi, '-')}`;
      const isExpanded = folderFiles.some(f => f.path === currentFilePath);

      html += `
        <div class="tree-folder ${isExpanded ? 'expanded' : ''}">
          <div class="tree-folder-header" data-folder="${folderId}">
            <svg class="tree-icon folder-icon" viewBox="0 0 16 16" width="16" height="16">
              <path d="M1.75 1A1.75 1.75 0 000 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0016 13.25v-8.5A1.75 1.75 0 0014.25 3H7.5a.25.25 0 01-.2-.1l-.9-1.2C6.07 1.26 5.55 1 5 1H1.75z"></path>
            </svg>
            <svg class="tree-icon chevron-icon" viewBox="0 0 16 16" width="16" height="16">
              <path d="M12.78 5.22a.749.749 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.06 0L3.22 6.28a.749.749 0 1 1 1.06-1.06L8 8.939l3.72-3.719a.749.749 0 0 1 1.06 0z"></path>
            </svg>
            <span class="tree-folder-name">${folder}</span>
          </div>
          <div class="tree-folder-content" id="${folderId}">
      `;

      // Sort files alphabetically
      folderFiles.sort((a, b) => a.name.localeCompare(b.name));

      for (const file of folderFiles) {
        const isActive = file.path === currentFilePath;
        html += `
          <a href="index.html?path=${encodeURIComponent(file.path)}"
             class="tree-file ${isActive ? 'active' : ''}"
             data-path="${file.path}">
            <svg class="tree-icon file-icon" viewBox="0 0 16 16" width="16" height="16">
              <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0113.25 16h-9.5A1.75 1.75 0 012 14.25V1.75zm1.75-.25a.25.25 0 00-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 00.25-.25V6h-2.75A1.75 1.75 0 019 4.25V1.5H3.75a.25.25 0 00-.25.25z"></path>
            </svg>
            <span class="tree-file-name">${file.name}</span>
          </a>
        `;
      }

      html += `
          </div>
        </div>
      `;
    }

    fileTreeNav.innerHTML = html;

    // Add folder toggle functionality
    const folderHeaders = fileTreeNav.querySelectorAll('.tree-folder-header');
    folderHeaders.forEach(header => {
      header.addEventListener('click', () => {
        const folder = header.parentElement;
        folder.classList.toggle('expanded');
      });
    });

  } catch (error) {
    console.error('Error loading file tree:', error);
  }
}

// Generate outline from headings
function generateOutline(htmlContent) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;

  const headings = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const outline = [];

  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.substring(1));
    const text = heading.textContent;
    const id = `heading-${index}`;

    // Add ID to heading for navigation
    heading.id = id;

    outline.push({
      level: level,
      text: text,
      id: id
    });
  });

  return { outline, html: tempDiv.innerHTML };
}

// Render outline in sidebar
function renderOutline(outline) {
  const outlineNav = document.getElementById('outline');

  if (outline.length === 0) {
    outlineNav.innerHTML = '<p class="no-outline">No headings found</p>';
    return;
  }

  let html = '<ul class="outline-list">';

  outline.forEach(item => {
    html += `
      <li class="outline-item outline-level-${item.level}">
        <a href="#${item.id}" class="outline-link">${item.text}</a>
      </li>
    `;
  });

  html += '</ul>';
  outlineNav.innerHTML = html;

  // Add click handlers for smooth scrolling
  const links = outlineNav.querySelectorAll('.outline-link');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Update active state
        links.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  });
}

// Load and display markdown file
async function loadMarkdown() {
  try {
    const response = await fetch(`/api/file?path=${encodeURIComponent(currentFilePath)}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to load file');
    }

    // Update title
    const fileName = currentFilePath.split('/').pop();
    document.getElementById('file-title').textContent = fileName;
    document.title = fileName;

    // Generate outline and update HTML with IDs
    const { outline, html } = generateOutline(data.html);

    // Display markdown content
    const contentDiv = document.getElementById('markdown-content');
    const loadingDiv = document.getElementById('loading');

    loadingDiv.style.display = 'none';
    contentDiv.innerHTML = html;

    // Render outline
    renderOutline(outline);

    // Highlight active section on scroll
    setupScrollSpy(outline);

  } catch (error) {
    console.error('Error loading markdown:', error);
    document.getElementById('loading').innerHTML = `❌ Error: ${error.message}`;
  }
}

// Setup scroll spy to highlight current section in outline
function setupScrollSpy(outline) {
  const links = document.querySelectorAll('.outline-link');
  const content = document.querySelector('.viewer-content');

  content.addEventListener('scroll', () => {
    let current = '';

    outline.forEach(item => {
      const section = document.getElementById(item.id);
      if (section) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 100) {
          current = item.id;
        }
      }
    });

    links.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

// Toggle sidebars on mobile
const toggleFileTreeButton = document.getElementById('toggle-file-tree');
const toggleOutlineButton = document.getElementById('toggle-outline');
const closeFileTreeButton = document.getElementById('close-file-tree');
const closeOutlineButton = document.getElementById('close-outline');
const fileTreeSidebar = document.querySelector('.file-tree-sidebar');
const outlineSidebar = document.querySelector('.outline-sidebar');

toggleFileTreeButton.addEventListener('click', () => {
  fileTreeSidebar.classList.toggle('open');
  outlineSidebar.classList.remove('open');
});

toggleOutlineButton.addEventListener('click', () => {
  outlineSidebar.classList.toggle('open');
  fileTreeSidebar.classList.remove('open');
});

closeFileTreeButton.addEventListener('click', () => {
  fileTreeSidebar.classList.remove('open');
});

closeOutlineButton.addEventListener('click', () => {
  outlineSidebar.classList.remove('open');
});

// Keyboard navigation for outline (J/K keys)
function setupKeyboardNavigation() {
  document.addEventListener('keydown', (e) => {
    // Ignore if user is typing in an input field
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
      return;
    }

    const links = document.querySelectorAll('.outline-link');
    if (links.length === 0) return;

    // Find current active link index
    let currentIndex = -1;
    links.forEach((link, index) => {
      if (link.classList.contains('active')) {
        currentIndex = index;
      }
    });

    let newIndex = -1;

    if (e.key === 'j' || e.key === 'J') {
      // Next item
      e.preventDefault();
      if (currentIndex === -1) {
        newIndex = 0;
      } else {
        newIndex = Math.min(currentIndex + 1, links.length - 1);
      }
    } else if (e.key === 'k' || e.key === 'K') {
      // Previous item
      e.preventDefault();
      if (currentIndex === -1) {
        newIndex = 0;
      } else {
        newIndex = Math.max(currentIndex - 1, 0);
      }
    }

    if (newIndex !== -1 && newIndex !== currentIndex) {
      // Update active state
      links.forEach(l => l.classList.remove('active'));
      links[newIndex].classList.add('active');

      // Scroll to the heading
      const targetId = links[newIndex].getAttribute('href').substring(1);
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      // Ensure the outline link is visible in sidebar
      links[newIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
}

// Load file tree and markdown when page loads
loadFileTree();
loadMarkdown();
setupKeyboardNavigation();
