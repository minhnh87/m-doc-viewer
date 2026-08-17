/** Pinned projects, rendered right under the project switcher. */

import { el, clear } from './dom.js';
import { shortDisplayPath, slugToDisplayPath } from '../lib/paths.js';

/**
 * @param {HTMLElement} container
 * @param {{ onSelect: (slug: string) => void, onRemove: (slug: string) => void }} handlers
 */
export function createFavouriteList(container, { onSelect, onRemove }) {
  /**
   * @param {string[]} slugs      pinned project slugs
   * @param {object[]} projects   projects known to the app (for display paths)
   * @param {string|null} currentSlug
   */
  function render(slugs, projects, currentSlug) {
    clear(container);
    if (!slugs.length) return;

    container.appendChild(el('div', {
      className: 'favourites-label', textContent: 'Favourites',
    }));

    for (const slug of slugs) {
      // A pinned project can disappear (deleted on disk) — fall back to the
      // path encoded in the slug so the row stays readable and removable.
      const project = projects.find((p) => p.slug === slug);
      const label = shortDisplayPath(project ? project.path : slugToDisplayPath(slug));

      const open = el('button', {
        className: 'favourite-open',
        type: 'button',
        title: project ? project.path : slugToDisplayPath(slug),
        textContent: label,
        onClick: () => onSelect(slug),
      });
      const remove = el('button', {
        className: 'favourite-remove',
        type: 'button',
        title: `Unpin ${label}`,
        'aria-label': `Unpin ${label}`,
        textContent: '✕',
        onClick: () => onRemove(slug),
      });

      container.appendChild(el('div', {
        className: slug === currentSlug ? 'favourite-item active' : 'favourite-item',
      }, [open, remove]));
    }
  }

  return { render };
}
