const form = document.querySelector('[data-bmi-form]');
const resultPanel = document.querySelector('[data-result-panel]');
const resultContent = document.querySelector('[data-result-content]');
const ctaPanel = document.querySelector('[data-cta-panel]');
const helperText = document.querySelector('[data-helper-text]');
const idealWeightButton = document.querySelector('[data-ideal-weight]');
const nutritionTipsButton = document.querySelector('[data-nutrition-tips]');
const exportHistoryButton = document.querySelector('[data-export-history]');
const clearHistoryButton = document.querySelector('[data-clear-history]');
const themeButtons = document.querySelectorAll('[data-theme-choice]');

const INITIAL_HELPER_TEXT = 'Введи рост и вес — я аккуратно всё посчитаю.';
const THEME_STORAGE_KEY = 'bmi-calculator-theme';
let lastResult = null;
let currentHistory = BMIHistory.getHistory();

function applyTheme(theme) {
  document.body.dataset.theme = theme;
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  themeButtons.forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.themeChoice === theme));
  });
}

function restoreTheme() {
  applyTheme(localStorage.getItem(THEME_STORAGE_KEY) || 'system');
}

function renderCategoryScale(activeKey, isChildOrTeen) {
  return BMICalculator.BMI_CATEGORIES.map((category) => {
    const activeClass = !isChildOrTeen && category.key === activeKey ? 'scale-card--active' : '';
    return `
      <li class="scale-card ${activeClass}">
        <span class="scale-card__icon">${category.icon}</span>
        <strong>${category.title}</strong>
        <span>${category.range}</span>
      </li>
    `;
  }).join('');
}

function renderTips(tips) {
  return tips.map((tip) => `<li>${tip}</li>`).join('');
}

function renderPersonalNotes(notes) {
  if (!notes.length) {
    return '';
  }

  return `
    <div class="personal-note">
      <strong>Персональный нюанс:</strong>
      <ul>${notes.map((note) => `<li>${note}</li>`).join('')}</ul>
    </div>
  `;
}

function renderHistoryChart(history) {
  if (history.length < 2) {
    return '<p class="notice">Когда появится минимум два расчёта, здесь будет простой график динамики BMI.</p>';
  }

  const chartItems = [...history].reverse();
  const values = chartItems.map((item) => item.bmi);
  const min = Math.min(...values, 18.5);
  const max = Math.max(...values, 30);
  const range = max - min || 1;
  const width = 520;
  const height = 180;
  const padding = 28;
  const points = chartItems.map((item, index) => {
    const x = padding + (index * (width - padding * 2)) / Math.max(chartItems.length - 1, 1);
    const y = height - padding - ((item.bmi - min) / range) * (height - padding * 2);
    return { ...item, x, y };
  });
  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');

  return `
    <svg class="history-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="График последних BMI расчётов">
      <path class="history-chart__line" d="${path}" />
      ${points.map((point) => `
        <g>
          <circle class="history-chart__point history-chart__point--${point.categoryKey}" cx="${point.x}" cy="${point.y}" r="6" />
          <text x="${point.x}" y="${point.y - 12}" text-anchor="middle">${point.bmi.toFixed(1)}</text>
        </g>
      `).join('')}
    </svg>
  `;
}

function renderHistory(history) {
  if (!history.length) {
    return '';
  }

  return `
    <section class="result-section">
      <div class="section-heading">
        <h2>История расчётов</h2>
        <span>Хранится только в этом браузере</span>
      </div>
      ${renderHistoryChart(history)}
      <ul class="history-list">
        ${history.map((item) => `
          <li>
            <span>${BMIHistory.formatHistoryDate(item.createdAt)}</span>
            <strong>BMI ${item.bmi.toFixed(1)}</strong>
            <span>${item.category} · ${item.height} см · ${item.weight} кг</span>
          </li>
        `).join('')}
      </ul>
    </section>
  `;
}

function renderHealthyWeight(range, heightMeters) {
  return `
    <section class="result-section weight-range-card">
      <h2>Ориентировочный диапазон веса</h2>
      <p>Для роста ${Math.round(heightMeters * 100)} см зона BMI ${BMICalculator.HEALTHY_BMI_RANGE.min}–${BMICalculator.HEALTHY_BMI_RANGE.max} соответствует примерно <strong>${range.min}–${range.max} кг</strong>.</p>
    </section>
  `;
}

function renderWeightChangePreview(preview) {
  return `
    <section class="result-section weight-preview-card">
      <h2>Как меняется BMI</h2>
      <p>Это только математический ориентир, не цель и не рекомендация.</p>
      <div class="preview-grid">
        <span>Если вес −${preview.delta} кг: <strong>BMI ${preview.lower.bmi.toFixed(1)}</strong></span>
        <span>Если вес +${preview.delta} кг: <strong>BMI ${preview.higher.bmi.toFixed(1)}</strong></span>
      </div>
    </section>
  `;
}

function renderAdultCategoryBlock(categoryKey, isChildOrTeen) {
  if (isChildOrTeen) {
    return `
      <section class="result-section">
        <h2>Как читать результат до 18 лет</h2>
        <p class="notice notice--accent">Для детей и подростков взрослые BMI-категории не подходят для точной оценки. Нужны возрастно-половые перцентильные таблицы и консультация специалиста.</p>
      </section>
    `;
  }

  return `
    <section class="result-section">
      <h2>Категории BMI</h2>
      <ul class="scale-grid">${renderCategoryScale(categoryKey, isChildOrTeen)}</ul>
    </section>
  `;
}

function renderResult(result, { save = true } = {}) {
  const { bmi, category, personalNotes, healthyWeightRange, heightMeters, isChildOrTeen, weightChangePreview } = result;
  currentHistory = save ? BMIHistory.addHistoryItem(result) : BMIHistory.getHistory();
  lastResult = result;

  resultContent.innerHTML = `
    <div class="result-hero">
      <span class="result-hero__label">Твой BMI</span>
      <strong class="result-hero__value">${bmi.toFixed(1)}</strong>
      <span class="result-hero__category">${isChildOrTeen ? 'Нужна оценка по возрастным таблицам' : `${category.icon} ${category.title}`}</span>
    </div>

    ${renderHealthyWeight(healthyWeightRange, heightMeters)}
    ${renderWeightChangePreview(weightChangePreview)}
    ${renderAdultCategoryBlock(category.key, isChildOrTeen)}

    <section class="result-section">
      <h2>Что это значит</h2>
      <p>${isChildOrTeen ? 'BMI можно использовать как числовой ориентир, но итоговую категорию для возраста до 18 лет лучше определять по специальным таблицам.' : category.tone}</p>
      ${renderPersonalNotes(personalNotes)}
      <p class="notice">BMI — это ориентир, а не медицинский диагноз. Для точной оценки здоровья стоит учитывать состав тела, самочувствие, анализы, уровень активности и другие факторы.</p>
    </section>

    <section class="result-section">
      <h2>Мягкие рекомендации</h2>
      <ul class="tips-list">${renderTips(category.tips)}</ul>
    </section>

    ${renderHistory(currentHistory)}
  `;

  helperText.textContent = 'Готово! Можно изменить данные и пересчитать в любой момент.';
  resultPanel.hidden = false;
  ctaPanel.hidden = false;
  exportHistoryButton.disabled = currentHistory.length === 0;
  clearHistoryButton.disabled = currentHistory.length === 0;
  resultPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  resultContent.focus({ preventScroll: true });
}

function renderError(message) {
  resultContent.innerHTML = `
    <div class="error-card" role="alert">
      <strong>Давай поправим данные 💛</strong>
      <p>${message}</p>
    </div>
  `;
  helperText.textContent = 'Ничего страшного — введи значения заново, и я пересчитаю.';
  resultPanel.hidden = false;
  ctaPanel.hidden = true;
}

function downloadCsv(csv) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'bmi-history.csv';
  link.click();
  URL.revokeObjectURL(url);
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const result = BMICalculator.buildResult({
    height: formData.get('height'),
    weight: formData.get('weight'),
    age: formData.get('age'),
    gender: formData.get('gender'),
    goal: formData.get('goal'),
    activity: formData.get('activity')
  });

  if (result.error) {
    renderError(result.error);
    return;
  }

  renderResult(result);
});

form.addEventListener('reset', () => {
  lastResult = null;
  resultPanel.hidden = true;
  ctaPanel.hidden = true;
  resultContent.innerHTML = '';
  helperText.textContent = INITIAL_HELPER_TEXT;
});

idealWeightButton.addEventListener('click', () => {
  if (!lastResult) {
    helperText.textContent = 'Сначала рассчитай BMI — и я покажу диапазон веса для твоего роста.';
    return;
  }

  const { min, max } = lastResult.healthyWeightRange;
  helperText.textContent = `Для твоего роста ориентировочный диапазон по BMI 18.5–24.9: ${min}–${max} кг.`;
});

nutritionTipsButton.addEventListener('click', () => {
  if (!lastResult) {
    helperText.textContent = 'Сначала рассчитай BMI — и я подберу более точные советы по питанию.';
    return;
  }

  helperText.textContent = lastResult.nutritionTips.join(' ');
});

exportHistoryButton.addEventListener('click', () => {
  currentHistory = BMIHistory.getHistory();

  if (!currentHistory.length) {
    helperText.textContent = 'История пока пустая — сначала сделай хотя бы один расчёт.';
    return;
  }

  downloadCsv(BMIHistory.exportHistoryToCsv(currentHistory));
  helperText.textContent = 'Готово — история скачана в CSV-файл.';
});

clearHistoryButton.addEventListener('click', () => {
  currentHistory = BMIHistory.clearHistory();
  helperText.textContent = 'История очищена в этом браузере.';

  if (lastResult) {
    renderResult(lastResult, { save: false });
    return;
  }

  exportHistoryButton.disabled = true;
  clearHistoryButton.disabled = true;
});

themeButtons.forEach((button) => {
  button.addEventListener('click', () => applyTheme(button.dataset.themeChoice));
});

restoreTheme();
exportHistoryButton.disabled = currentHistory.length === 0;
clearHistoryButton.disabled = currentHistory.length === 0;
