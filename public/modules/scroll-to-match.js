// Scroll the rendered markdown to a search match.
//
// Line numbers from /api/search refer to the RAW markdown file; after
// marked renders it to HTML those lines no longer exist. Instead of a
// line -> element map, we count which occurrence (k-th) of the query the
// clicked line represents in the raw text, then find the k-th occurrence
// in the rendered DOM's text nodes and scroll to its block.

const FLASH_DURATION_MS = 2000;
const FLASH_CLASS = 'search-scroll-flash';
const SKIP_TAGS = new Set(['STYLE', 'SCRIPT', 'NOSCRIPT', 'TEMPLATE']);
const BLOCK_TAGS = new Set([
  'P', 'LI', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'PRE', 'TD', 'TH', 'BLOCKQUOTE', 'DT', 'DD',
]);

function countNonOverlapping(haystack, needle) {
  let count = 0;
  let idx = haystack.indexOf(needle);
  while (idx !== -1) {
    count += 1;
    idx = haystack.indexOf(needle, idx + needle.length);
  }
  return count;
}

/**
 * Which occurrence (0-based, non-overlapping, case-insensitive) of `query`
 * does line `lineNumber` (1-based) hold in `rawContent`?
 * Returns -1 when the line is out of range or does not contain the query.
 * @param {string} rawContent
 * @param {number} lineNumber
 * @param {string} query
 * @returns {number}
 */
export function computeOccurrenceIndex(rawContent, lineNumber, query) {
  if (!rawContent || !query || !Number.isInteger(lineNumber) || lineNumber < 1) return -1;

  const lines = rawContent.split('\n');
  if (lineNumber > lines.length) return -1;

  const needle = query.toLowerCase();
  if (!lines[lineNumber - 1].toLowerCase().includes(needle)) return -1;

  let occurrencesBefore = 0;
  for (let i = 0; i < lineNumber - 1; i++) {
    occurrencesBefore += countNonOverlapping(lines[i].toLowerCase(), needle);
  }
  return occurrencesBefore;
}

/**
 * Find the k-th occurrence of `query` across ordered text-node contents.
 * Matching is case-insensitive, non-overlapping, and may span node
 * boundaries (markdown inline formatting splits text nodes). When fewer
 * occurrences exist than k (raw-vs-rendered drift, e.g. hits inside link
 * URLs), clamps to the last one so we still land near the target.
 * @param {string[]} texts - textContent of each node, in document order
 * @param {string} query
 * @param {number} k - 0-based occurrence index
 * @returns {{ nodeIndex: number, offset: number } | null}
 */
export function locateOccurrence(texts, query, k) {
  if (!texts.length || !query || k < 0) return null;

  const joined = texts.join('').toLowerCase();
  const needle = query.toLowerCase();

  const starts = [];
  let idx = joined.indexOf(needle);
  while (idx !== -1) {
    starts.push(idx);
    idx = joined.indexOf(needle, idx + needle.length);
  }
  if (!starts.length) return null;

  const target = starts[Math.min(k, starts.length - 1)];

  let consumed = 0;
  for (let nodeIndex = 0; nodeIndex < texts.length; nodeIndex++) {
    const end = consumed + texts[nodeIndex].length;
    if (target < end) {
      return { nodeIndex, offset: target - consumed };
    }
    consumed = end;
  }
  return null;
}

function collectTextNodes(container) {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const tag = node.parentElement ? node.parentElement.tagName : '';
      return SKIP_TAGS.has(tag) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
    },
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  return nodes;
}

function findBlockAncestor(textNode, container) {
  let el = textNode.parentElement;
  while (el && el !== container) {
    if (BLOCK_TAGS.has(el.tagName) || el.parentElement === container) return el;
    el = el.parentElement;
  }
  return null;
}

function flash(element) {
  element.classList.remove(FLASH_CLASS);
  // Force reflow so re-adding the class restarts the animation.
  void element.offsetWidth;
  element.classList.add(FLASH_CLASS);
  setTimeout(() => element.classList.remove(FLASH_CLASS), FLASH_DURATION_MS);
}

/**
 * Scroll the rendered markdown container to the search match at
 * `lineNumber` of the raw file and flash its block. No-op (returns false)
 * when the match cannot be located in the rendered DOM.
 * @param {HTMLElement} container - the rendered markdown root
 * @param {string} rawContent - the raw markdown source
 * @param {number} lineNumber - 1-based line of the match in rawContent
 * @param {string} query - the search query
 * @returns {boolean} whether a target was found and scrolled to
 */
export function scrollToSearchMatch(container, rawContent, lineNumber, query) {
  const k = computeOccurrenceIndex(rawContent, lineNumber, query);
  if (k < 0) return false;

  const nodes = collectTextNodes(container);
  const location = locateOccurrence(nodes.map((n) => n.nodeValue), query, k);
  if (!location) return false;

  const block = findBlockAncestor(nodes[location.nodeIndex], container);
  if (!block) return false;

  block.scrollIntoView({ block: 'center', behavior: 'smooth' });
  flash(block);
  return true;
}
