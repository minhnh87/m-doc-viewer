// Scroll spy: highlight current section in outline

export function setupScrollSpy(outline) {
  const links = document.querySelectorAll('.outline-link');
  const content = document.querySelector('.viewer-content');

  content.addEventListener('scroll', () => {
    let current = '';

    outline.forEach(item => {
      const section = document.getElementById(item.id);
      if (section) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 100) {
          current = item.id;
        }
      }
    });

    links.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}
