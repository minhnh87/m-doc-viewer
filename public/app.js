// Fetch and display all markdown files
async function loadFiles() {
  try {
    const response = await fetch('/api/files');
    const files = await response.json();

    const fileListDiv = document.getElementById('file-list');
    const loadingDiv = document.getElementById('loading');

    loadingDiv.style.display = 'none';

    if (Object.keys(files).length === 0) {
      fileListDiv.innerHTML = '<p class="no-files">No markdown files found.</p>';
      return;
    }

    let html = '';

    // Sort folders alphabetically
    const sortedFolders = Object.keys(files).sort();

    for (const folder of sortedFolders) {
      const folderFiles = files[folder];

      html += `
        <div class="folder-section">
          <h2 class="folder-name">📁 ${folder}</h2>
          <div class="files-grid">
      `;

      // Sort files alphabetically
      folderFiles.sort((a, b) => a.name.localeCompare(b.name));

      for (const file of folderFiles) {
        const encodedPath = encodeURIComponent(file.path);
        html += `
          <a href="index.html?path=${encodedPath}" class="file-card">
            <div class="file-icon">📄</div>
            <div class="file-info">
              <div class="file-name">${file.name}</div>
              <div class="file-path">${file.path}</div>
            </div>
          </a>
        `;
      }

      html += `
          </div>
        </div>
      `;
    }

    fileListDiv.innerHTML = html;
  } catch (error) {
    console.error('Error loading files:', error);
    document.getElementById('loading').innerHTML = '❌ Error loading files. Please try again.';
  }
}

// Load files when page loads
loadFiles();
