const VALID_PAGES = ['home', 'services', 'about', 'contact', 'resources'];

// ── PAGE ROUTING ──
function showPage(name, pushHistory = true) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (pushHistory) history.pushState({ page: name }, '', '#' + name);

  // Close mobile menu
  document.getElementById('nav-links').classList.remove('open');
  document.getElementById('hamburger').classList.remove('open');

  // Update active nav link
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  const activeLink = document.querySelector(`.nav-links a[data-page="${name}"]`);
  if (activeLink) activeLink.classList.add('active');

  setTimeout(initReveal, 100);
}

// ── BROWSER BACK / FORWARD ──
window.addEventListener('popstate', e => {
  const page = (e.state && e.state.page) || 'home';
  showPage(page, false);
});

// ── SCROLL EFFECTS ──
window.addEventListener('scroll', () => {
  document.getElementById('main-nav').classList.toggle('scrolled', window.scrollY > 20);
  initReveal();
});

// ── REVEAL ANIMATION ──
function initReveal() {
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 60) el.classList.add('visible');
  });
}

// ── MOBILE NAV ──
document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('nav-links').classList.toggle('open');
  document.getElementById('hamburger').classList.toggle('open');
});

// ── CUSTOM CHECKBOXES ──
document.querySelectorAll('.check-item').forEach(item => {
  item.addEventListener('click', function() {
    const cb = this.querySelector('input[type="checkbox"]');
    cb.checked = !cb.checked;
  });
});

// ── INLINE FORM VALIDATION ──
function setFieldError(id, message) {
  const el = document.getElementById(id);
  el.style.borderColor = message ? '#c0392b' : '';
  el.style.boxShadow = message ? '0 0 0 3px rgba(192,57,43,0.1)' : '';
  let hint = el.nextElementSibling;
  if (hint && hint.classList.contains('field-error')) {
    hint.textContent = message || '';
    hint.style.display = message ? 'block' : 'none';
  } else if (message) {
    hint = document.createElement('span');
    hint.className = 'field-error';
    hint.style.cssText = 'display:block; font-size:0.75rem; color:#c0392b; margin-top:0.3rem;';
    hint.textContent = message;
    el.parentNode.insertBefore(hint, el.nextSibling);
  }
}

function clearErrors() {
  ['fname', 'email'].forEach(id => setFieldError(id, ''));
  const servErr = document.getElementById('services-error');
  if (servErr) servErr.style.display = 'none';
}

// ── FORM SUBMIT ──
function submitForm() {
  clearErrors();
  const fname = document.getElementById('fname').value.trim();
  const email = document.getElementById('email').value.trim();
  const services = [...document.querySelectorAll('input[name="service"]:checked')];
  let valid = true;

  if (!fname) { setFieldError('fname', 'Please enter your first name.'); valid = false; }
  if (!email || !email.includes('@')) { setFieldError('email', 'Please enter a valid email address.'); valid = false; }
  if (services.length === 0) {
    let servErr = document.getElementById('services-error');
    if (!servErr) {
      servErr = document.createElement('span');
      servErr.id = 'services-error';
      servErr.style.cssText = 'display:block; font-size:0.75rem; color:#c0392b; margin-bottom:0.75rem;';
      const grid = document.querySelector('.services-check-grid');
      grid.parentNode.insertBefore(servErr, grid);
    }
    servErr.textContent = 'Please select at least one service.';
    servErr.style.display = 'block';
    valid = false;
  }

  if (!valid) return;

  document.getElementById('form-body').style.display = 'none';
  document.getElementById('form-success').classList.add('show');
}

function resetForm() {
  clearErrors();
  document.getElementById('form-body').style.display = 'block';
  document.getElementById('form-success').classList.remove('show');
  ['fname', 'lname', 'email', 'phone', 'biz', 'message'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.querySelectorAll('input[name="service"]').forEach(cb => cb.checked = false);
  document.querySelectorAll('input[name="budget"]').forEach(rb => rb.checked = false);
}

// ── SAVINGS CALCULATOR ──
function formatCurrency(val) {
  if (val >= 1000000) return '£' + (val / 1000000).toFixed(1).replace(/\.0$/, '') + 'm';
  if (val >= 1000) return '£' + Math.round(val / 1000) + 'k';
  return '£' + Math.round(val).toLocaleString('en-GB');
}

function runCalculator() {
  const purchases = parseFloat(document.getElementById('calc-purchases').value) || 0;
  const revenue = parseFloat(document.getElementById('calc-revenue').value) || 0;

  if (purchases === 0 && revenue === 0) {
    ['calc-purchases', 'calc-revenue'].forEach(id => {
      const el = document.getElementById(id);
      el.closest('.calc-input-wrap').style.borderColor = '#c0392b';
      el.closest('.calc-input-wrap').style.boxShadow = '0 0 0 3px rgba(192,57,43,0.1)';
      el.addEventListener('input', function onInput() {
        el.closest('.calc-input-wrap').style.borderColor = '';
        el.closest('.calc-input-wrap').style.boxShadow = '';
        el.removeEventListener('input', onInput);
      });
    });
    return;
  }

  const purchasingSavings = purchases * 0.10;
  const revenueOpportunity = revenue * 0.10;
  const total = purchasingSavings + revenueOpportunity;

  document.getElementById('calc-total-num').textContent = formatCurrency(total);
  document.getElementById('calc-purchasing-num').textContent = formatCurrency(purchasingSavings);
  document.getElementById('calc-revenue-num').textContent = formatCurrency(revenueOpportunity);

  document.getElementById('calc-purchasing-result').style.display = purchases > 0 ? 'block' : 'none';
  document.getElementById('calc-revenue-result').style.display = revenue > 0 ? 'block' : 'none';

  const sub = purchases > 0 && revenue > 0
    ? 'Combined purchasing savings & revenue improvement'
    : purchases > 0
      ? 'Estimated purchasing cost savings'
      : 'Estimated revenue improvement opportunity';
  document.getElementById('calc-total-sub').textContent = sub;

  document.getElementById('calc-empty').style.display = 'none';
  document.getElementById('calc-output').classList.add('visible');

  if (window.innerWidth < 768) {
    document.getElementById('calc-results-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ── FINANCIAL CALCULATORS ──
function calcDSO() {
  const ar        = parseFloat(document.getElementById('dso-ar').value) || 0;
  const revenue   = parseFloat(document.getElementById('dso-revenue').value) || 0;
  const ap        = parseFloat(document.getElementById('dso-ap').value) || 0;
  const purchases = parseFloat(document.getElementById('dso-purchases').value) || 0;
  const days      = parseInt(document.getElementById('dso-period').value) || 365;
  const result    = document.getElementById('dso-result');

  if (!ar || !revenue) { result.innerHTML = 'Please enter at least your customer figures to continue.'; result.classList.add('show'); return; }

  const dso = (ar / revenue) * days;
  const dpo = (ap && purchases) ? (ap / purchases) * days : null;
  const gap = dpo !== null ? dso - dpo : null;

  let dsoLabel = dso <= 30 ? 'Excellent' : dso <= 45 ? 'Good' : dso <= 60 ? 'Fair' : 'High';
  let html = `<strong>${Math.round(dso)} days</strong>`;
  html += `Customers take <b>${Math.round(dso)} days</b> on average to pay you (${dsoLabel}).\n`;

  if (dpo !== null) {
    html += `You take <b>${Math.round(dpo)} days</b> on average to pay your suppliers.\n\n`;
    if (gap > 0) {
      html += `Your cash gap is <b>${Math.round(gap)} days</b> — you are effectively funding your customers for that period. Tightening collections or extending supplier terms would free up working capital.`;
    } else if (gap < 0) {
      html += `Your suppliers are effectively funding you by <b>${Math.round(Math.abs(gap))} days</b> — a healthy position. Keep it that way when renegotiating terms.`;
    } else {
      html += `Your payment cycle is balanced — you collect from customers at roughly the same pace you pay suppliers.`;
    }
  } else {
    html += `\nEnter your supplier figures above to see your full working capital cycle.`;
  }

  result.innerHTML = html;
  result.classList.add('show');
}

function calcMarkupMargin() {
  const cost  = parseFloat(document.getElementById('mm-cost').value) || 0;
  const price = parseFloat(document.getElementById('mm-price').value) || 0;
  const result = document.getElementById('mm-result');
  if (!cost || !price || price <= cost) { result.innerHTML = 'Enter a valid cost and selling price (price must exceed cost).'; result.classList.add('show'); return; }
  const markup = ((price - cost) / cost) * 100;
  const margin = ((price - cost) / price) * 100;
  result.innerHTML = `<strong>${margin.toFixed(1)}% margin</strong>Gross margin: ${margin.toFixed(2)}%\nMarkup on cost: ${markup.toFixed(2)}%\nProfit per unit: £${(price - cost).toFixed(2)}`;
  result.classList.add('show');
}

function calcBreakEven() {
  const fixed    = parseFloat(document.getElementById('be-fixed').value) || 0;
  const price    = parseFloat(document.getElementById('be-price').value) || 0;
  const variable = parseFloat(document.getElementById('be-variable').value) || 0;
  const result   = document.getElementById('be-result');

  if (!fixed || !price) { result.innerHTML = 'Please enter your fixed costs and selling price.'; result.classList.add('show'); return; }
  if (price <= variable) { result.innerHTML = 'Your selling price must be higher than your variable cost per sale.'; result.classList.add('show'); return; }

  const contribution = price - variable;
  const units = Math.ceil(fixed / contribution);
  const revenue = units * price;

  result.innerHTML = `<strong>${units.toLocaleString('en-GB')} sales / units</strong>`
    + `You need <b>${units.toLocaleString('en-GB')} sales</b> per month to cover your costs.\n`
    + `That's <b>£${revenue.toLocaleString('en-GB')}</b> in monthly revenue before you make any profit.\n\n`
    + `Each sale contributes <b>£${contribution.toFixed(2)}</b> towards your fixed costs after variable costs are covered.`;
  result.classList.add('show');
}

// ── EMPLOYEE COST CALCULATOR ──

function empTogglePayType() {
  const type = document.querySelector('input[name="emp-pay-type"]:checked').value;
  document.getElementById('emp-salary-group').style.display  = type === 'salary' ? '' : 'none';
  document.getElementById('emp-hourly-group').style.display  = type === 'hourly' ? '' : 'none';
}

function empShowAnnualEq() {
  const rate  = parseFloat(document.getElementById('emp-hourly').value) || 0;
  const hours = parseFloat(document.getElementById('emp-hours').value)  || 37.5;
  const eq    = document.getElementById('emp-annual-eq');
  if (rate > 0) {
    const annual = rate * hours * 52;
    eq.textContent = 'Equivalent annual salary: £' + Math.round(annual).toLocaleString('en-GB');
  } else {
    eq.textContent = 'Enter an hourly rate to see the annual equivalent.';
  }
}

function empToggleRecruitCost(el) {
  document.getElementById('emp-recruit-cost-group').style.display = el.checked ? '' : 'none';
}

function empFmt(val) {
  return '£' + Math.round(val).toLocaleString('en-GB');
}

function calcEmployeeCost() {
  const payType     = document.querySelector('input[name="emp-pay-type"]:checked').value;
  const hours       = parseFloat(document.getElementById('emp-hours').value)        || 37.5;
  const holidayDays = parseFloat(document.getElementById('emp-holidays').value)     || 28;
  const sickDays    = parseFloat(document.getElementById('emp-sick').value)         || 7;
  const inclPension = document.getElementById('emp-pension-chk').checked;
  const inclRecruit = document.getElementById('emp-recruit-chk').checked;
  const recruitCost = parseFloat(document.getElementById('emp-recruit-cost').value) || 0;

  let annualSalary = 0;
  if (payType === 'salary') {
    annualSalary = parseFloat(document.getElementById('emp-salary').value) || 0;
  } else {
    const rate = parseFloat(document.getElementById('emp-hourly').value) || 0;
    annualSalary = rate * hours * 52;
  }

  if (!annualSalary) {
    const targetId = payType === 'salary' ? 'emp-salary' : 'emp-hourly';
    const el = document.getElementById(targetId);
    el.closest('.calc-input-wrap').style.borderColor = '#c0392b';
    el.closest('.calc-input-wrap').style.boxShadow   = '0 0 0 3px rgba(192,57,43,0.1)';
    el.addEventListener('input', function clear() {
      el.closest('.calc-input-wrap').style.borderColor = '';
      el.closest('.calc-input-wrap').style.boxShadow   = '';
      el.removeEventListener('input', clear);
    });
    return;
  }

  // 2025/26 UK Employer NI: 15% above £5,000 secondary threshold
  const employerNI      = Math.max(0, (annualSalary - 5000) * 0.15);
  const employerPension = inclPension ? annualSalary * 0.03 : 0;
  const recruitAnnual   = inclRecruit ? recruitCost / 2 : 0;

  const totalTrueCost = annualSalary + employerNI + employerPension + recruitAnnual;
  const premiumPct    = ((totalTrueCost - annualSalary) / annualSalary) * 100;

  // Productive days
  const workingDays    = 260; // 52 × 5
  const productiveDays = Math.max(0, workingDays - holidayDays - sickDays);
  const hoursPerDay    = hours / 5;
  const productiveHrs  = productiveDays * hoursPerDay;

  const dayRate  = productiveDays > 0 ? totalTrueCost / productiveDays  : 0;
  const hourRate = productiveHrs  > 0 ? totalTrueCost / productiveHrs   : 0;

  // — Update headline —
  document.getElementById('emp-disp-salary').textContent = empFmt(annualSalary);
  document.getElementById('emp-disp-total').textContent  = empFmt(totalTrueCost);
  document.getElementById('emp-disp-premium').innerHTML  =
    `That\'s <strong>${Math.round(premiumPct)}% more</strong> than the salary alone`;

  // — Breakdown rows —
  const rows = [
    { label: 'Base Salary',          value: annualSalary,    base: true },
    { label: 'Employer NI (15%)',     value: employerNI,      base: false },
    { label: 'Employer Pension (3%)', value: employerPension, base: false, show: inclPension },
    { label: 'Recruitment (ann.)',    value: recruitAnnual,   base: false, show: inclRecruit && recruitAnnual > 0 },
  ];
  const bEl = document.getElementById('emp-breakdown');
  bEl.innerHTML = '';
  rows.forEach(r => {
    if (r.show === false) return;
    const pct  = Math.min(100, (r.value / totalTrueCost) * 100);
    const row  = document.createElement('div');
    row.className = 'emp-breakdown-row';
    row.innerHTML = `
      <div class="emp-br-label">${r.label}</div>
      <div class="emp-br-bar-wrap"><div class="emp-br-bar${r.base ? '' : ' oncost'}" style="width:${pct.toFixed(1)}%"></div></div>
      <div class="emp-br-val">${empFmt(r.value)}</div>`;
    bEl.appendChild(row);
  });

  // — Days bar —
  const prodPct    = (productiveDays / workingDays) * 100;
  const holPct     = Math.min(100 - prodPct, (holidayDays / workingDays) * 100);
  const sickPct    = Math.max(0, 100 - prodPct - holPct);
  const daysBar    = document.getElementById('emp-days-bar');
  daysBar.innerHTML = `
    <div class="emp-days-segment empds-productive" style="width:${prodPct.toFixed(1)}%">
      ${Math.round(productiveDays)}&nbsp;days<br>Productive
    </div>
    ${holidayDays > 0 ? `<div class="emp-days-segment empds-holiday" style="width:${holPct.toFixed(1)}%">${Math.round(holidayDays)}&nbsp;days<br>Holiday</div>` : ''}
    ${sickDays > 0 ? `<div class="emp-days-segment empds-sick" style="width:${sickPct.toFixed(1)}%">${Math.round(sickDays)}&nbsp;days<br>Sick</div>` : ''}`;

  // — Metrics —
  document.getElementById('emp-disp-prod-days').textContent = Math.round(productiveDays);
  document.getElementById('emp-disp-day-cost').textContent  = empFmt(dayRate);
  document.getElementById('emp-disp-hr-cost').textContent   = '£' + hourRate.toFixed(2);

  // — Show output —
  document.getElementById('emp-calc-empty').style.display = 'none';
  document.getElementById('emp-calc-output').classList.add('visible');

  if (window.innerWidth < 768) {
    document.getElementById('emp-calc-results-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ── INIT ──
document.getElementById('footer-year').textContent = new Date().getFullYear();

const hash = window.location.hash.slice(1);
const initialPage = VALID_PAGES.includes(hash) ? hash : 'home';
history.replaceState({ page: initialPage }, '', '#' + initialPage);
showPage(initialPage, false);
setTimeout(initReveal, 200);
