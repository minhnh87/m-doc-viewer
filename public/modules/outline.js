// Outline generation and rendering

export function generateOutline(htmlContent) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;

  const headings = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const outline = [];

  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.substring(1));
    const text = heading.textContent;
    const id = `heading-${index}`;

    heading.id = id;

    outline.push({
      level: level,
      text: text,
      id: id
    });
  });

  return { outline, html: tempDiv.innerHTML };
}

export function renderOutline(outline) {
  const outlineNav = document.getElementById('outline');

  if (outline.length === 0) {
    outlineNav.innerHTML = '<p class="no-outline">No headings found</p>';
    return;
  }

  let html = '<ul class="outline-list">';

  outline.forEach(item => {
    html += `
      <li class="outline-item outline-level-${item.level}">
        <a href="#${item.id}" class="outline-link">${item.text}</a>
      </li>
    `;
  });

  html += '</ul>';
  outlineNav.innerHTML = html;

  // Add click handlers for smooth scrolling
  const links = outlineNav.querySelectorAll('.outline-link');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        links.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  });
}
