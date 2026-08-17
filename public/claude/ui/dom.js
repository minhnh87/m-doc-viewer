/** Minimal DOM helpers for the vanilla conversation viewer. */

/**
 * Create an element with props (attrs/dataset/events) and children.
 * @param {string} tag
 * @param {Object} [props]  className, textContent, html, dataset, on{Event}, plus attrs
 * @param {(Node|string)[]} [children]
 */
export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null) continue;
    if (key === 'className') node.className = value;
    else if (key === 'textContent') node.textContent = value;
    else if (key === 'html') node.innerHTML = value;
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === 'hidden') {
      if (value) node.setAttribute('hidden', '');
    } else {
      node.setAttribute(key, value);
    }
  }
  for (const child of [].concat(children)) {
    if (child === null || child === undefined || child === false) continue;
    node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
  }
  return node;
}

/** Remove all children of a node. */
export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

/** Escape a string for safe interpolation into innerHTML contexts. */
export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
