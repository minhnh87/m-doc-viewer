// Keyboard navigation and hotkeys

import { apiFetch } from './api.js';
import { navigateToFile } from './navigation.js';

export function setupKeyboardNavigation() {
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
      links.forEach(l => l.classList.remove('active'));
      links[newIndex].classList.add('active');

      const targetId = links[newIndex].getAttribute('href').substring(1);
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      links[newIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
}

export function setupHotkeys(searchPanel, searchInput) {
  document.addEventListener('keydown', (e) => {
    // Ignore if typing in input/textarea
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
      return;
    }

    if (e.key === 'f' || e.key === 'F') {
      // F => open search form, focus input
      e.preventDefault();
      searchPanel.style.display = 'block';
      searchInput.focus();
    } else if (e.key === 'l' || e.key === 'L') {
      // L => open last_talk.md
      e.preventDefault();
      navigateToFile('last_talk.md', false);
    } else if (e.key === 'p' || e.key === 'P') {
      // P => open latest plan file
      e.preventDefault();
      apiFetch('/api/latest-plan')
        .then(data => {
          navigateToFile(data.path, true);
        })
        .catch(error => {
          console.error('Error getting latest plan:', error);
          alert('Loi: ' + error.message);
        });
    }
  });
}
