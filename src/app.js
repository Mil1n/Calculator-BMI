const form = document.querySelector('[data-bmi-form]');
const resultPanel = document.querySelector('[data-result-panel]');
const resultContent = document.querySelector('[data-result-content]');
const ctaPanel = document.querySelector('[data-cta-panel]');
const helperText = document.querySelector('[data-helper-text]');
const idealWeightButton = document.querySelector('[data-ideal-weight]');
const nutritionTipsButton = document.querySelector('[data-nutrition-tips]');

const INITIAL_HELPER_TEXT = 'Введи рост и вес — я аккуратно всё посчитаю.';
const HISTORY_STORAGE_KEY = 'bmi-calculator-history';
let lastResult = null;

function renderCategoryScale(activeKey) {
  return BMICalculator.BMI_CATEGORIES.map((category) => {
    const activeClass = category.key === activeKey ? 'scale-card--active' : '';
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

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY)) || [];
  } catch (error) {
    return [];
  }
}

function saveToHistory(result) {
  const historyItem = {
    date: new Date().toLocaleDateString('ru-RU'),
    bmi: result.bmi,
    category: result.category.title,
    height: Math.round(result.heightMeters * 100),
    weight: result.weightKg
  };
  const history = [historyItem, ...getHistory()].slice(0, 5);
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  return history;
}

function renderHistory(history) {
  if (!history.length) {
    return '';
  }

  return `
    <section class="result-section">
      <h2>История расчётов</h2>
      <ul class="history-list">
        ${history.map((item) => `
          <li>
            <span>${item.date}</span>
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

function renderResult(result) {
  const { bmi, category, personalNotes, healthyWeightRange, heightMeters, isChildOrTeen } = result;
  const history = saveToHistory(result);
  lastResult = result;

  resultContent.innerHTML = `
    <div class="result-hero">
      <span class="result-hero__label">Твой BMI</span>
      <strong class="result-hero__value">${bmi.toFixed(1)}</strong>
      <span class="result-hero__category">${category.icon} ${category.title}</span>
    </div>

    ${isChildOrTeen ? '<p class="notice notice--accent">Для детей и подростков взрослые BMI-категории не подходят для точной оценки — используй результат только как повод бережно обсудить здоровье со специалистом.</p>' : ''}

    ${renderHealthyWeight(healthyWeightRange, heightMeters)}

    <section class="result-section">
      <h2>Категории BMI</h2>
      <ul class="scale-grid">${renderCategoryScale(category.key)}</ul>
    </section>

    <section class="result-section">
      <h2>Что это значит</h2>
      <p>${category.tone}</p>
      ${renderPersonalNotes(personalNotes)}
      <p class="notice">BMI — это ориентир, а не медицинский диагноз. Для точной оценки здоровья стоит учитывать состав тела, самочувствие, анализы, уровень активности и другие факторы.</p>
    </section>

    <section class="result-section">
      <h2>Мягкие рекомендации</h2>
      <ul class="tips-list">${renderTips(category.tips)}</ul>
    </section>

    ${renderHistory(history)}
  `;

  helperText.textContent = 'Готово! Можно изменить данные и пересчитать в любой момент.';
  resultPanel.hidden = false;
  ctaPanel.hidden = false;
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
  helperText.textContent = 'Совет дня: собери тарелку из овощей, источника белка, сложных углеводов и добавь воду — без строгих запретов.';
});
