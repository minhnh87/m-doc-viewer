const express = require('express');
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Directories to exclude from scanning
const EXCLUDED_DIRS = ['.git', '.claude', 'node_modules', 'public', '.ipam'];

// Supported file extensions
const SUPPORTED_EXTENSIONS = ['.md', '.drawio', '.mermaid', '.mmd'];

// Function to recursively scan directories for supported files
function scanFiles(dirPath, basePath = dirPath) {
  const files = [];

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.relative(basePath, fullPath);

      if (entry.isDirectory()) {
        // Skip excluded directories
        if (!EXCLUDED_DIRS.includes(entry.name) && !entry.name.startsWith('.')) {
          files.push(...scanFiles(fullPath, basePath));
        }
      } else if (entry.isFile()) {
        // Check if file has supported extension
        const ext = path.extname(entry.name).toLowerCase();
        if (SUPPORTED_EXTENSIONS.includes(ext)) {
          let type = 'markdown';
          if (ext === '.drawio') type = 'drawio';
          else if (ext === '.mermaid' || ext === '.mmd') type = 'mermaid';

          files.push({
            name: entry.name,
            path: relativePath,
            folder: path.dirname(relativePath),
            fullPath: fullPath,
            type: type
          });
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
        if (!EXCLUDED_DIRS.includes(entry.name) && !entry.name.startsWith('.')) {
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

// API endpoint to get markdown file content
app.get('/api/file', (req, res) => {
  const filePath = req.query.path;
  const isExternal = req.query.external === 'true';

  if (!filePath) {
    return res.status(400).json({ error: 'File path is required' });
  }

  let fullPath;

  if (isExternal) {
    // External file - use the path directly
    fullPath = filePath;
  } else {
    fullPath = path.join(__dirname, filePath);
    // Security check: ensure the path is within the project directory
    if (!fullPath.startsWith(__dirname)) {
      return res.status(403).json({ error: 'Access denied' });
    }
  }

  try {
    // Validate file exists and is a file
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const stats = fs.statSync(fullPath);
    if (!stats.isFile()) {
      return res.status(400).json({ error: 'Path is not a file' });
    }

    const content = fs.readFileSync(fullPath, 'utf-8');
    const html = marked(content);

    res.json({
      content: content,
      html: html,
      path: filePath,
      isExternal: isExternal
    });
  } catch (error) {
    res.status(404).json({ error: 'File not found' });
  }
});

// API endpoint to get drawio file content (XML)
app.get('/api/drawio', (req, res) => {
  const filePath = req.query.path;
  const isExternal = req.query.external === 'true';

  if (!filePath) {
    return res.status(400).json({ error: 'File path is required' });
  }

  // Validate it's a .drawio file
  if (!filePath.endsWith('.drawio')) {
    return res.status(400).json({ error: 'Not a drawio file' });
  }

  let fullPath;

  if (isExternal) {
    fullPath = filePath;
  } else {
    fullPath = path.join(__dirname, filePath);
    if (!fullPath.startsWith(__dirname)) {
      return res.status(403).json({ error: 'Access denied' });
    }
  }

  try {
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const stats = fs.statSync(fullPath);
    if (!stats.isFile()) {
      return res.status(400).json({ error: 'Path is not a file' });
    }

    const content = fs.readFileSync(fullPath, 'utf-8');

    res.json({
      content: content,
      path: filePath,
      isExternal: isExternal
    });
  } catch (error) {
    res.status(404).json({ error: 'File not found' });
  }
});

// API endpoint to get mermaid file content
app.get('/api/mermaid', (req, res) => {
  const filePath = req.query.path;
  const isExternal = req.query.external === 'true';

  if (!filePath) {
    return res.status(400).json({ error: 'File path is required' });
  }

  // Validate it's a mermaid file
  if (!filePath.endsWith('.mermaid') && !filePath.endsWith('.mmd')) {
    return res.status(400).json({ error: 'Not a mermaid file' });
  }

  let fullPath;

  if (isExternal) {
    fullPath = filePath;
  } else {
    fullPath = path.join(__dirname, filePath);
    if (!fullPath.startsWith(__dirname)) {
      return res.status(403).json({ error: 'Access denied' });
    }
  }

  try {
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const stats = fs.statSync(fullPath);
    if (!stats.isFile()) {
      return res.status(400).json({ error: 'Path is not a file' });
    }

    const content = fs.readFileSync(fullPath, 'utf-8');

    res.json({
      content: content,
      path: filePath,
      isExternal: isExternal
    });
  } catch (error) {
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

  if (EXCLUDED_DIRS.includes(firstDir) || relativePath === '') {
    return false;
  }

  return true;
}

// API endpoint to delete a file
app.delete('/api/file', (req, res) => {
  const filePath = req.query.path;
  const isExternal = req.query.external === 'true';

  if (!filePath) {
    return res.status(400).json({ error: 'File path is required' });
  }

  let fullPath;

  if (isExternal) {
    // External file - use the path directly
    fullPath = filePath;

    // Ensure it's a markdown file for safety
    if (!fullPath.endsWith('.md')) {
      return res.status(403).json({ error: 'Access denied: Can only delete markdown files' });
    }
  } else {
    if (!isPathSafe(filePath)) {
      return res.status(403).json({ error: 'Access denied: Cannot delete this file' });
    }
    fullPath = path.join(__dirname, filePath);
  }

  try {
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check if it's actually a file
    const stats = fs.statSync(fullPath);
    if (!stats.isFile()) {
      return res.status(400).json({ error: 'Path is not a file' });
    }

    // Delete the file
    fs.unlinkSync(fullPath);

    res.json({ success: true, message: 'File deleted successfully', path: filePath, isExternal });
  } catch (error) {
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

      // Scan for supported files (non-recursive for external folders)
      const files = [];
      const entries = fs.readdirSync(folderPath, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (SUPPORTED_EXTENSIONS.includes(ext)) {
            const fullPath = path.join(folderPath, entry.name);
            let type = 'markdown';
            if (ext === '.drawio') type = 'drawio';
            else if (ext === '.mermaid' || ext === '.mmd') type = 'mermaid';

            files.push({
              name: entry.name,
              path: fullPath,
              folder: folderPath,
              fullPath: fullPath,
              isExternal: true,
              type: type
            });
          }
        }
      }

      // Use folder path as key
      result[folderPath] = files;
    } catch (error) {
      console.error(`Error scanning external folder ${folderPath}:`, error);
    }
  }

  res.json(result);
});

// API endpoint to get the latest plan file
app.get('/api/latest-plan', (req, res) => {
  const plansDir = '/Users/minh/.claude/plans';

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
app.listen(PORT, () => {
  console.log(`Markdown reader server running at http://localhost:${PORT}`);
});
