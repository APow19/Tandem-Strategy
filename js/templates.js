// ── TEMPLATE REGISTRY ──
// To add a new template: add one entry here + create templates/<id>.html
const TEMPLATES = [
  {
    id: 'invoice',
    name: 'Invoice',
    description: 'Professional invoice with itemised lines, VAT calculation, bank details and late payment notice.',
    category: 'Finance',
    file: 'templates/invoice.html',
  },
  {
    id: 'quote-estimate',
    name: 'Quotation / Estimate',
    description: 'Formal quotation with itemised scope, validity period and acceptance terms.',
    category: 'Client & Sales',
    file: 'templates/quote-estimate.html',
  },
  {
    id: 'client-proposal',
    name: 'Client Proposal',
    description: 'Structured proposal covering understanding, scope, deliverables, timeline and investment.',
    category: 'Client & Sales',
    file: 'templates/client-proposal.html',
  },
  {
    id: 'scope-of-work',
    name: 'Scope of Work',
    description: 'Defines project boundaries: in-scope, out-of-scope, milestones, assumptions and sign-off.',
    category: 'Client & Sales',
    file: 'templates/scope-of-work.html',
  },
  {
    id: 'business-plan',
    name: 'Business Plan',
    description: 'Full business plan with executive summary, market analysis, operations and financial projections.',
    category: 'Finance',
    file: 'templates/business-plan.html',
  },
  {
    id: 'nda',
    name: 'Non-Disclosure Agreement',
    description: 'Mutual or one-way NDA with standard UK clauses covering definition, obligations and remedies.',
    category: 'Legal',
    file: 'templates/nda.html',
  },
  {
    id: 'terms-conditions',
    name: 'Terms & Conditions',
    description: 'Service terms covering payment, IP, liability limitation and governing law (England & Wales).',
    category: 'Legal',
    file: 'templates/terms-conditions.html',
  },
  {
    id: 'employment-contract',
    name: 'Employment Contract',
    description: 'Written statement of employment particulars compliant with UK employment law.',
    category: 'HR',
    file: 'templates/employment-contract.html',
  },
];

const CATEGORIES = ['All', 'Finance', 'Legal', 'HR', 'Client & Sales'];
let activeFilter = 'All';

// ── RENDER ──
function renderCards() {
  const grid = document.getElementById('template-grid');
  const filtered = activeFilter === 'All'
    ? TEMPLATES
    : TEMPLATES.filter(t => t.category === activeFilter);

  grid.innerHTML = '';

  if (filtered.length === 0) {
    grid.innerHTML = '<p class="tl-empty">No templates in this category yet.</p>';
    return;
  }

  filtered.forEach(t => {
    const card = document.createElement('div');
    card.className = 'template-card';
    card.innerHTML = `
      <div class="tc-category">${t.category}</div>
      <h3 class="tc-name">${t.name}</h3>
      <p class="tc-desc">${t.description}</p>
      <div class="tc-actions">
        <button class="tc-btn tc-btn-primary" onclick="downloadPDF('${t.file}', '${t.name}')">
          Download PDF
        </button>
        <button class="tc-btn" onclick="openEmail('${t.file}', '${t.name}')">
          Open in Email
        </button>
      </div>`;
    grid.appendChild(card);
  });
}

// ── FILTER ──
function setFilter(category) {
  activeFilter = category;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === category);
  });
  renderCards();
}

// ── PDF DOWNLOAD ──
// Loads the template HTML into a hidden print iframe, triggers print, then removes the frame.
// Note: fetch() requires the page to be served over HTTP — use a local server for development.
async function downloadPDF(file, name) {
  const btn = event.currentTarget;
  const original = btn.textContent;
  btn.textContent = 'Loading…';
  btn.disabled = true;

  try {
    const res = await fetch(file);
    if (!res.ok) throw new Error('Could not load template.');
    const fragment = await res.text();

    const frame = document.createElement('iframe');
    frame.setAttribute('aria-hidden', 'true');
    frame.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:210mm;height:297mm;border:none;';
    document.body.appendChild(frame);

    const doc = frame.contentDocument || frame.contentWindow.document;
    doc.open();
    doc.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${name}</title>
  <link rel="stylesheet" href="css/templates.css">
</head>
<body class="template-print-body">${fragment}</body>
</html>`);
    doc.close();

    // Wait for CSS to load before printing
    setTimeout(() => {
      frame.contentWindow.focus();
      frame.contentWindow.print();
      setTimeout(() => {
        if (frame.parentNode) frame.parentNode.removeChild(frame);
      }, 2000);
    }, 600);

  } catch (err) {
    alert('Could not load template. If viewing locally, open via a web server (e.g. VS Code Live Server).');
    console.error(err);
  } finally {
    btn.textContent = original;
    btn.disabled = false;
  }
}

// ── OPEN IN EMAIL ──
async function openEmail(file, name) {
  const btn = event.currentTarget;
  const original = btn.textContent;
  btn.textContent = 'Loading…';
  btn.disabled = true;

  try {
    const res = await fetch(file);
    if (!res.ok) throw new Error('Could not load template.');
    const fragment = await res.text();

    // Strip HTML tags to get plain text
    const div = document.createElement('div');
    div.innerHTML = fragment;
    // Preserve some structure: replace block elements with newlines
    div.querySelectorAll('p, h1, h2, h3, h4, tr, li, br').forEach(el => {
      el.prepend(document.createTextNode('\n'));
    });
    div.querySelectorAll('td, th').forEach(el => {
      el.append(document.createTextNode('\t'));
    });
    const text = (div.innerText || div.textContent || '').replace(/\n{3,}/g, '\n\n').trim();

    const subject = encodeURIComponent(name);
    const body = encodeURIComponent(text);
    // mailto: body max length is ~2000 chars in some clients — truncate gracefully
    const maxBody = 1800;
    const truncated = text.length > maxBody
      ? encodeURIComponent(text.slice(0, maxBody) + '\n\n[— continued — see full template at tandemstrategy.co.uk —]')
      : body;

    window.location.href = `mailto:?subject=${subject}&body=${truncated}`;

  } catch (err) {
    alert('Could not load template. If viewing locally, open via a web server (e.g. VS Code Live Server).');
    console.error(err);
  } finally {
    btn.textContent = original;
    btn.disabled = false;
  }
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  // Build filter buttons
  const bar = document.getElementById('filter-bar');
  CATEGORIES.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn' + (cat === 'All' ? ' active' : '');
    btn.dataset.filter = cat;
    btn.textContent = cat;
    btn.addEventListener('click', () => setFilter(cat));
    bar.appendChild(btn);
  });

  renderCards();
});
