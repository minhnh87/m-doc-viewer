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

// Function to recursively scan directories for markdown files
function scanMarkdownFiles(dirPath, basePath = dirPath) {
  const files = [];

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.relative(basePath, fullPath);

      if (entry.isDirectory()) {
        // Skip excluded directories
        if (!EXCLUDED_DIRS.includes(entry.name) && !entry.name.startsWith('.')) {
          files.push(...scanMarkdownFiles(fullPath, basePath));
        }
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        // Add markdown file
        files.push({
          name: entry.name,
          path: relativePath,
          folder: path.dirname(relativePath),
          fullPath: fullPath
        });
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error);
  }

  return files;
}

// API endpoint to get all markdown files
app.get('/api/files', (req, res) => {
  const files = scanMarkdownFiles(__dirname);

  // Group files by folder
  const grouped = files.reduce((acc, file) => {
    const folder = file.folder === '.' ? 'Root' : file.folder;
    if (!acc[folder]) {
      acc[folder] = [];
    }
    acc[folder].push(file);
    return acc;
  }, {});

  res.json(grouped);
});

// API endpoint to get markdown file content
app.get('/api/file', (req, res) => {
  const filePath = req.query.path;

  if (!filePath) {
    return res.status(400).json({ error: 'File path is required' });
  }

  const fullPath = path.join(__dirname, filePath);

  // Security check: ensure the path is within the project directory
  if (!fullPath.startsWith(__dirname)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const content = fs.readFileSync(fullPath, 'utf-8');
    const html = marked(content);

    res.json({
      content: content,
      html: html,
      path: filePath
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

  if (!filePath) {
    return res.status(400).json({ error: 'File path is required' });
  }

  if (!isPathSafe(filePath)) {
    return res.status(403).json({ error: 'Access denied: Cannot delete this file' });
  }

  const fullPath = path.join(__dirname, filePath);

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

    res.json({ success: true, message: 'File deleted successfully', path: filePath });
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

// Start the server
app.listen(PORT, () => {
  console.log(`Markdown reader server running at http://localhost:${PORT}`);
});
