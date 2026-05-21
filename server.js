const express = require('express');
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// ── Configuration ────────────────────────────────────────────────────────────
const CONFIG = {
  port: process.env.PORT || 3001,
  staticDir: 'public',
  plansDir: path.join(require('os').homedir(), '.claude', 'plans'),
  excludedDirs: ['.git', '.claude', 'node_modules', 'public', '.ipam'],
  supportedExtensions: ['.md', '.drawio', '.mermaid', '.mmd'],
};
// ─────────────────────────────────────────────────────────────────────────────

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(CONFIG.staticDir));

// Function to recursively scan directories for supported files
// options: { basePath, isExternal, externalRoot }
function scanFiles(dirPath, options = {}) {
  const basePath = options.basePath || dirPath;
  const isExternal = options.isExternal || false;
  const externalRoot = options.externalRoot || basePath;
  const files = [];

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.relative(basePath, fullPath);

      if (entry.isDirectory()) {
        // Skip hidden directories; also skip excluded dirs for local scans
        if (entry.name.startsWith('.')) continue;
        if (!isExternal && CONFIG.excludedDirs.includes(entry.name)) continue;

        files.push(...scanFiles(fullPath, { basePath, isExternal, externalRoot }));
      } else if (entry.isFile()) {
        // Check if file has supported extension
        const ext = path.extname(entry.name).toLowerCase();
        if (CONFIG.supportedExtensions.includes(ext)) {
          let type = 'markdown';
          if (ext === '.drawio') type = 'drawio';
          else if (ext === '.mermaid' || ext === '.mmd') type = 'mermaid';

          const fileEntry = {
            name: entry.name,
            path: isExternal ? fullPath : relativePath,
            folder: isExternal
              ? (relativePath === entry.name ? '.' : path.dirname(relativePath))
              : path.dirname(relativePath),
            fullPath: fullPath,
            type: type
          };

          if (isExternal) {
            fileEntry.isExternal = true;
          }

          files.push(fileEntry);
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error);
  }

  return files;
}

// Function to get all folders (including empty ones)
function getAllFolders(dirPath, basePath = dirPath) {
  const folders = [];

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (!CONFIG.excludedDirs.includes(entry.name) && !entry.name.startsWith('.')) {
          const fullPath = path.join(dirPath, entry.name);
          const relativePath = path.relative(basePath, fullPath);
          folders.push(relativePath);
          // Recursively get subfolders
          folders.push(...getAllFolders(fullPath, basePath));
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning folders ${dirPath}:`, error);
  }

  return folders;
}

// API endpoint to get all files
app.get('/api/files', (req, res) => {
  const files = scanFiles(__dirname);
  const allFolders = getAllFolders(__dirname);

  // Group files by folder
  const grouped = files.reduce((acc, file) => {
    const folder = file.folder === '.' ? 'Root' : file.folder;
    if (!acc[folder]) {
      acc[folder] = [];
    }
    acc[folder].push(file);
    return acc;
  }, {});

  // Add empty folders
  allFolders.forEach(folder => {
    if (!grouped[folder]) {
      grouped[folder] = [];
    }
  });

  res.json(grouped);
});

// Unified API endpoint to get file content (markdown, drawio, mermaid)
app.get('/api/content', (req, res) => {
  const filePath = req.query.path;
  const isExternal = req.query.external === 'true';

  if (!filePath) {
    return res.status(400).json({ error: 'File path is required' });
  }

  try {
    const { fullPath } = resolveFilePath(filePath, isExternal);
    const content = fs.readFileSync(fullPath, 'utf-8');
    const ext = path.extname(filePath).toLowerCase();

    // Auto-detect type from extension
    let type;
    if (ext === '.drawio') {
      type = 'drawio';
    } else if (ext === '.mermaid' || ext === '.mmd') {
      type = 'mermaid';
    } else {
      type = 'markdown';
    }

    const response = { content, type, path: filePath, isExternal };

    // Add rendered html for markdown files
    if (type === 'markdown') {
      response.html = marked(content);
    }

    res.json(response);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.error });
    res.status(404).json({ error: 'File not found' });
  }
});

// Helper function to validate path is within project directory
function isPathSafe(filePath) {
  const fullPath = path.resolve(__dirname, filePath);
  const projectRoot = path.resolve(__dirname);

  // Must be within project directory
  if (!fullPath.startsWith(projectRoot + path.sep)) {
    return false;
  }

  // Cannot delete from excluded directories or the project root itself
  const relativePath = path.relative(projectRoot, fullPath);
  const firstDir = relativePath.split(path.sep)[0];

  if (CONFIG.excludedDirs.includes(firstDir) || relativePath === '') {
    return false;
  }

  return true;
}

// Shared helper: resolve file path (external vs local), validate existence
// Returns { fullPath, relativePath } or throws { status, error }
function resolveFilePath(filePath, isExternal) {
  let fullPath;

  if (isExternal) {
    fullPath = filePath;
  } else {
    fullPath = path.join(__dirname, filePath);
    if (!fullPath.startsWith(__dirname)) {
      throw { status: 403, error: 'Access denied' };
    }
  }

  if (!fs.existsSync(fullPath)) {
    throw { status: 404, error: 'File not found' };
  }

  const stats = fs.statSync(fullPath);
  if (!stats.isFile()) {
    throw { status: 400, error: 'Path is not a file' };
  }

  return { fullPath, relativePath: filePath };
}

// API endpoint to delete a file
app.delete('/api/file', (req, res) => {
  const filePath = req.query.path;
  const isExternal = req.query.external === 'true';

  if (!filePath) {
    return res.status(400).json({ error: 'File path is required' });
  }

  // Delete-specific security checks
  if (isExternal) {
    if (!filePath.endsWith('.md')) {
      return res.status(403).json({ error: 'Access denied: Can only delete markdown files' });
    }
  } else {
    if (!isPathSafe(filePath)) {
      return res.status(403).json({ error: 'Access denied: Cannot delete this file' });
    }
  }

  try {
    const { fullPath } = resolveFilePath(filePath, isExternal);

    // Delete the file
    fs.unlinkSync(fullPath);

    res.json({ success: true, message: 'File deleted successfully', path: filePath, isExternal });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.error });
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// API endpoint to delete a folder
app.delete('/api/folder', (req, res) => {
  const folderPath = req.query.path;

  if (!folderPath) {
    return res.status(400).json({ error: 'Folder path is required' });
  }

  if (!isPathSafe(folderPath)) {
    return res.status(403).json({ error: 'Access denied: Cannot delete this folder' });
  }

  const fullPath = path.join(__dirname, folderPath);

  try {
    // Check if folder exists
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    // Check if it's actually a directory
    const stats = fs.statSync(fullPath);
    if (!stats.isDirectory()) {
      return res.status(400).json({ error: 'Path is not a folder' });
    }

    // Delete the folder recursively
    fs.rmSync(fullPath, { recursive: true });

    res.json({ success: true, message: 'Folder deleted successfully', path: folderPath });
  } catch (error) {
    console.error('Error deleting folder:', error);
    res.status(500).json({ error: 'Failed to delete folder' });
  }
});

// API endpoint to create a folder
app.post('/api/folder', (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Folder name is required' });
  }

  // Sanitize folder name
  const sanitizedName = name.replace(/[<>:"/\\|?*]/g, '').trim();
  if (!sanitizedName) {
    return res.status(400).json({ error: 'Invalid folder name' });
  }

  if (!isPathSafe(sanitizedName)) {
    return res.status(403).json({ error: 'Access denied: Cannot create this folder' });
  }

  const fullPath = path.join(__dirname, sanitizedName);

  try {
    if (fs.existsSync(fullPath)) {
      return res.status(409).json({ error: 'Folder already exists' });
    }

    fs.mkdirSync(fullPath, { recursive: true });
    res.json({ success: true, message: 'Folder created successfully', path: sanitizedName });
  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).json({ error: 'Failed to create folder' });
  }
});

// API endpoint to rename a file or folder
app.put('/api/rename', (req, res) => {
  const { oldPath, newName, type } = req.body;

  if (!oldPath || !newName) {
    return res.status(400).json({ error: 'Old path and new name are required' });
  }

  if (!isPathSafe(oldPath)) {
    return res.status(403).json({ error: 'Access denied: Cannot rename this item' });
  }

  // Sanitize new name
  const sanitizedName = newName.replace(/[<>:"/\\|?*]/g, '').trim();
  if (!sanitizedName) {
    return res.status(400).json({ error: 'Invalid new name' });
  }

  const fullOldPath = path.join(__dirname, oldPath);
  const parentDir = path.dirname(fullOldPath);
  const fullNewPath = path.join(parentDir, sanitizedName);
  const newRelativePath = path.relative(__dirname, fullNewPath);

  if (!isPathSafe(newRelativePath)) {
    return res.status(403).json({ error: 'Access denied: Invalid destination' });
  }

  try {
    if (!fs.existsSync(fullOldPath)) {
      return res.status(404).json({ error: 'File or folder not found' });
    }

    if (fs.existsSync(fullNewPath)) {
      return res.status(409).json({ error: 'A file or folder with this name already exists' });
    }

    fs.renameSync(fullOldPath, fullNewPath);
    res.json({ success: true, message: 'Renamed successfully', oldPath, newPath: newRelativePath });
  } catch (error) {
    console.error('Error renaming:', error);
    res.status(500).json({ error: 'Failed to rename' });
  }
});

// API endpoint to move a file
app.put('/api/file/move', (req, res) => {
  const { from, to } = req.body;

  if (!from) {
    return res.status(400).json({ error: 'Source path is required' });
  }

  if (!isPathSafe(from)) {
    return res.status(403).json({ error: 'Access denied: Cannot move this file' });
  }

  const fullFromPath = path.join(__dirname, from);
  const fileName = path.basename(from);

  // "to" can be empty string for Root
  const destFolder = to || '';
  const fullToPath = destFolder
    ? path.join(__dirname, destFolder, fileName)
    : path.join(__dirname, fileName);
  const newRelativePath = path.relative(__dirname, fullToPath);

  // Validate destination (empty is OK for root)
  if (destFolder && !isPathSafe(destFolder)) {
    return res.status(403).json({ error: 'Access denied: Invalid destination folder' });
  }

  try {
    if (!fs.existsSync(fullFromPath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const stats = fs.statSync(fullFromPath);
    if (!stats.isFile()) {
      return res.status(400).json({ error: 'Can only move files' });
    }

    if (fs.existsSync(fullToPath)) {
      return res.status(409).json({ error: 'A file with this name already exists in the destination' });
    }

    // Ensure destination folder exists
    if (destFolder) {
      const destFullPath = path.join(__dirname, destFolder);
      if (!fs.existsSync(destFullPath)) {
        return res.status(404).json({ error: 'Destination folder not found' });
      }
    }

    fs.renameSync(fullFromPath, fullToPath);
    res.json({ success: true, message: 'File moved successfully', from, to: newRelativePath });
  } catch (error) {
    console.error('Error moving file:', error);
    res.status(500).json({ error: 'Failed to move file' });
  }
});

// API endpoint to scan external folders for markdown files
app.post('/api/external-files', (req, res) => {
  const { paths } = req.body;

  if (!paths || !Array.isArray(paths)) {
    return res.status(400).json({ error: 'Paths array is required' });
  }

  const result = {};

  for (const folderPath of paths) {
    try {
      // Validate path exists and is a directory
      if (!fs.existsSync(folderPath)) {
        continue;
      }

      const stats = fs.statSync(folderPath);
      if (!stats.isDirectory()) {
        continue;
      }

      // Scan for supported files (recursive)
      const files = scanFiles(folderPath, { isExternal: true });

      // Group files by subfolder
      const grouped = files.reduce((acc, file) => {
        const folder = file.folder;
        if (!acc[folder]) {
          acc[folder] = [];
        }
        acc[folder].push(file);
        return acc;
      }, {});

      // Return grouped result with base path as key
      result[folderPath] = grouped;
    } catch (error) {
      console.error(`Error scanning external folder ${folderPath}:`, error);
    }
  }

  res.json(result);
});

// API endpoint to get the latest plan file
app.get('/api/latest-plan', (req, res) => {
  const plansDir = CONFIG.plansDir;

  try {
    if (!fs.existsSync(plansDir)) {
      return res.status(404).json({ error: 'Plans directory not found' });
    }

    const entries = fs.readdirSync(plansDir, { withFileTypes: true });
    const mdFiles = entries
      .filter(entry => entry.isFile() && entry.name.endsWith('.md'))
      .map(entry => {
        const fullPath = path.join(plansDir, entry.name);
        const stats = fs.statSync(fullPath);
        return {
          name: entry.name,
          path: fullPath,
          mtime: stats.mtime
        };
      })
      .sort((a, b) => b.mtime - a.mtime);

    if (mdFiles.length === 0) {
      return res.status(404).json({ error: 'No plan files found' });
    }

    res.json({
      path: mdFiles[0].path,
      name: mdFiles[0].name
    });
  } catch (error) {
    console.error('Error getting latest plan:', error);
    res.status(500).json({ error: 'Failed to get latest plan' });
  }
});

// Helper function to search in a single file
function searchInFile(fullPath, fileName, query, isExternal, relativePath) {
  const searchLower = query.toLowerCase();
  const ext = path.extname(fileName).toLowerCase();

  try {
    const content = fs.readFileSync(fullPath, 'utf-8');
    const lines = content.split('\n');
    const matches = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineLower = line.toLowerCase();
      const matchIndex = lineLower.indexOf(searchLower);

      if (matchIndex !== -1) {
        // Get context around match (50 chars before/after)
        const contextStart = Math.max(0, matchIndex - 50);
        const contextEnd = Math.min(line.length, matchIndex + query.length + 50);
        let context = line.substring(contextStart, contextEnd);

        // Add ellipsis if truncated
        if (contextStart > 0) context = '...' + context;
        if (contextEnd < line.length) context = context + '...';

        matches.push({
          line: i + 1,
          content: context,
          matchStart: contextStart > 0 ? matchIndex - contextStart + 3 : matchIndex
        });

        // Limit to 5 matches per file
        if (matches.length >= 5) break;
      }
    }

    if (matches.length > 0) {
      const fileInfo = {
        name: fileName,
        path: isExternal ? fullPath : relativePath,
        fullPath: fullPath,
        type: ext === '.drawio' ? 'drawio' : (ext === '.mermaid' || ext === '.mmd') ? 'mermaid' : 'markdown',
        isExternal: isExternal
      };

      return {
        file: fileInfo,
        matches: matches
      };
    }
  } catch (readError) {
    console.error(`Error reading file ${fullPath}:`, readError);
  }

  return null;
}

// API endpoint to search text in folder
app.get('/api/search', (req, res) => {
  const query = req.query.query;
  const folder = req.query.folder;
  const isExternal = req.query.external === 'true';
  const scope = req.query.scope || 'folder'; // 'folder' or 'all'

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  // For scope=all, folder is not required
  if (scope === 'folder' && !folder && folder !== '') {
    return res.status(400).json({ error: 'Folder is required' });
  }

  const results = [];
  let totalMatches = 0;
  let totalFiles = 0;

  try {
    if (scope === 'all') {
      // Search in entire project (recursive)
      const projectFiles = scanFiles(__dirname);

      for (const file of projectFiles) {
        const result = searchInFile(file.fullPath, file.name, query, false, file.path);
        if (result) {
          results.push(result);
          totalMatches += result.matches.length;
          totalFiles++;
        }
      }

      // Search in external folders (from query param) - recursive
      const externalFoldersParam = req.query.externalFolders;
      if (externalFoldersParam) {
        try {
          const externalFolders = JSON.parse(externalFoldersParam);

          for (const extFolder of externalFolders) {
            if (!fs.existsSync(extFolder) || !fs.statSync(extFolder).isDirectory()) {
              continue;
            }

            // Scan external folder recursively
            const extFiles = scanFiles(extFolder, { isExternal: true });

            for (const file of extFiles) {
              const result = searchInFile(file.fullPath, file.name, query, true, file.fullPath);
              if (result) {
                results.push(result);
                totalMatches += result.matches.length;
                totalFiles++;
              }
            }
          }
        } catch (parseError) {
          console.error('Error parsing external folders:', parseError);
        }
      }

    } else {
      // Original behavior: search in single folder (non-recursive)
      let searchDir;
      if (isExternal) {
        searchDir = folder;
      } else {
        searchDir = folder ? path.join(__dirname, folder) : __dirname;
        // Security check
        if (!searchDir.startsWith(__dirname)) {
          return res.status(403).json({ error: 'Access denied' });
        }
      }

      if (!fs.existsSync(searchDir)) {
        return res.status(404).json({ error: 'Folder not found' });
      }

      const stats = fs.statSync(searchDir);
      if (!stats.isDirectory()) {
        return res.status(400).json({ error: 'Path is not a directory' });
      }

      // Read files in folder (non-recursive)
      const entries = fs.readdirSync(searchDir, { withFileTypes: true });

      for (const entry of entries) {
        if (!entry.isFile()) continue;

        const ext = path.extname(entry.name).toLowerCase();
        if (!CONFIG.supportedExtensions.includes(ext)) continue;

        const fullPath = path.join(searchDir, entry.name);
        const relativePath = folder ? path.join(folder, entry.name) : entry.name;

        const result = searchInFile(fullPath, entry.name, query, isExternal, isExternal ? fullPath : relativePath);
        if (result) {
          results.push(result);
          totalMatches += result.matches.length;
          totalFiles++;
        }
      }
    }

    res.json({
      results: results,
      totalMatches: totalMatches,
      totalFiles: totalFiles
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// API endpoint to validate external folder path
app.post('/api/validate-folder', (req, res) => {
  const { path: folderPath } = req.body;

  if (!folderPath) {
    return res.status(400).json({ error: 'Path is required', valid: false });
  }

  try {
    if (!fs.existsSync(folderPath)) {
      return res.json({ valid: false, error: 'Path does not exist' });
    }

    const stats = fs.statSync(folderPath);
    if (!stats.isDirectory()) {
      return res.json({ valid: false, error: 'Path is not a directory' });
    }

    res.json({ valid: true });
  } catch (error) {
    res.json({ valid: false, error: error.message });
  }
});

// Start the server
app.listen(CONFIG.port, () => {
  console.log(`Markdown reader server running at http://localhost:${CONFIG.port}`);
});
