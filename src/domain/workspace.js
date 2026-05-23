/**
 * @typedef {Object} Workspace
 * @property {string} id - Unique workspace identifier ('ws-default' reserved for Default)
 * @property {string} name - Human-readable workspace name
 * @property {string[]} folderPaths - Absolute paths of external folders in this workspace
 * @property {number} createdAt - Unix epoch ms
 */

/**
 * @typedef {Object} WorkspacesState
 * @property {number} version - Schema version (1)
 * @property {string} activeWorkspaceId - Id of currently active workspace
 * @property {Workspace[]} workspaces - All workspaces, ordered by user preference
 */

export {};
