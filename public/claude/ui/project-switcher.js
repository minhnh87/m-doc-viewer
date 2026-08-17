/** Project switcher — a native select populated from `listProjects`, ordered
 *  by last activity (the data layer already sorts), plus a star button that
 *  pins the selected project to the favourites list below. */

import { el, clear } from './dom.js';
import { shortDisplayPath } from '../lib/paths.js';
import { relativeTime } from '../lib/relative-time.js';

/**
 * @param {HTMLElement} container
 * @param {{ onSelect: (slug: string) => void, onToggleFavourite: () => void }} handlers
 */
export function createProjectSwitcher(container, { onSelect, onToggleFavourite }) {
  let select = null;
  let star = null;

  function render(projects, currentSlug) {
    clear(container);
    container.appendChild(el('label', {
      className: 'project-switcher-label', for: 'project-select', textContent: 'Project',
    }));
    select = el('select', {
      className: 'project-select',
      id: 'project-select',
      onChange: (e) => onSelect(e.target.value),
    });
    for (const p of projects) {
      const activity = p.lastActivity ? ` · ${relativeTime(p.lastActivity)}` : '';
      select.appendChild(el('option', {
        value: p.slug,
        textContent: shortDisplayPath(p.path) + activity,
      }));
    }
    star = el('button', {
      className: 'favourite-star',
      type: 'button',
      title: 'Pin this project to favourites',
      'aria-label': 'Pin this project to favourites',
      'aria-pressed': 'false',
      textContent: '☆',
      onClick: () => onToggleFavourite(),
    });
    container.appendChild(el('div', { className: 'project-switcher-row' }, [select, star]));
    if (currentSlug) select.value = currentSlug;
  }

  function setCurrent(slug) {
    if (select && slug) select.value = slug;
  }

  /** Reflect whether the selected project is pinned. */
  function setFavourite(isFavourite) {
    if (!star) return;
    star.textContent = isFavourite ? '★' : '☆';
    star.setAttribute('aria-pressed', isFavourite ? 'true' : 'false');
    const label = isFavourite ? 'Unpin this project' : 'Pin this project to favourites';
    star.title = label;
    star.setAttribute('aria-label', label);
    star.classList.toggle('is-favourite', isFavourite);
  }

  return { render, setCurrent, setFavourite };
}
