const form = document.querySelector('[data-bmi-form]');
const resultPanel = document.querySelector('[data-result-panel]');
const resultContent = document.querySelector('[data-result-content]');
const ctaPanel = document.querySelector('[data-cta-panel]');
const helperText = document.querySelector('[data-helper-text]');

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

function renderResult(result) {
  const { bmi, category, personalNotes } = result;

  resultContent.innerHTML = `
    <div class="result-hero">
      <span class="result-hero__label">Твой BMI</span>
      <strong class="result-hero__value">${bmi.toFixed(1)}</strong>
      <span class="result-hero__category">${category.icon} ${category.title}</span>
    </div>

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
  `;

  helperText.textContent = 'Готово! Можно изменить данные и пересчитать в любой момент.';
  resultPanel.hidden = false;
  ctaPanel.hidden = false;
  resultPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    gender: formData.get('gender')
  });

  if (result.error) {
    renderError(result.error);
    return;
  }

  renderResult(result);
});

document.querySelector('[data-ideal-weight]').addEventListener('click', () => {
  helperText.textContent = 'Идеальный вес лучше считать диапазоном: для твоего роста ориентиром может быть зона BMI 18.5–24.9.';
});

document.querySelector('[data-nutrition-tips]').addEventListener('click', () => {
  helperText.textContent = 'Совет дня: собери тарелку из овощей, источника белка, сложных углеводов и добавь воду — без строгих запретов.';
});
