(function (root) {
  const BMI_CATEGORIES = [
    {
      key: 'underweight',
      icon: '🟦',
      title: 'Недостаточный вес',
      range: 'BMI < 18.5',
      min: 0,
      max: 18.5,
      tone: 'Организму может не хватать энергии и ресурсов для восстановления.',
      tips: [
        'Добавляй к рациону питательные продукты: крупы, бобовые, орехи, рыбу, яйца или другие источники белка.',
        'Старайся есть регулярно и не пропускать приёмы пищи, особенно если много двигаешься.',
        'Лёгкие силовые тренировки помогут укреплять мышцы и поддерживать тонус.'
      ]
    },
    {
      key: 'normal',
      icon: '🟩',
      title: 'Норма',
      range: '18.5–24.9',
      min: 18.5,
      max: 25,
      tone: 'Вес находится в диапазоне, который обычно связан с хорошим балансом для большинства взрослых.',
      tips: [
        'Продолжай поддерживать привычки, которые дают тебе энергию и хорошее самочувствие.',
        'Выбирай разнообразное питание: овощи, белок, цельные злаки и полезные жиры.',
        'Добавляй движение в течение недели: прогулки, растяжку, спорт или активные хобби.'
      ]
    },
    {
      key: 'overweight',
      icon: '🟨',
      title: 'Избыточный вес',
      range: '25–29.9',
      min: 25,
      max: 30,
      tone: 'Показатель выше нормы — это повод мягко посмотреть на питание, активность и восстановление.',
      tips: [
        'Начни с маленьких шагов: больше воды, больше овощей и чуть меньше сладких напитков.',
        'Выбирай активность, которую реально приятно повторять: ходьбу, велосипед, плавание или танцы.',
        'Сон и стресс сильно влияют на аппетит, поэтому восстановление тоже часть заботы о себе.'
      ]
    },
    {
      key: 'obesity',
      icon: '🟥',
      title: 'Ожирение',
      range: '30+',
      min: 30,
      max: Infinity,
      tone: 'BMI заметно выше нормы. Это не диагноз, но сигнал уделить больше внимания здоровью и нагрузке на организм.',
      tips: [
        'Ставь реалистичные цели: устойчивые изменения важнее быстрых ограничений.',
        'Постепенно увеличивай бытовую активность и выбирай щадящие нагрузки, комфортные для суставов.',
        'Если есть возможность, обсуди план питания и активности со специалистом — так безопаснее и спокойнее.'
      ]
    }
  ];

  function normalizeHeight(value) {
    const height = Number.parseFloat(String(value).replace(',', '.'));

    if (!Number.isFinite(height) || height <= 0) {
      return null;
    }

    return height > 3 ? height / 100 : height;
  }

  function normalizeWeight(value) {
    const weight = Number.parseFloat(String(value).replace(',', '.'));
    return Number.isFinite(weight) && weight > 0 ? weight : null;
  }

  function normalizeAge(value) {
    if (String(value).trim() === '') {
      return null;
    }

    const age = Number.parseInt(value, 10);
    return Number.isFinite(age) && age > 0 && age < 130 ? age : null;
  }

  function calculateBmi(weightKg, heightMeters) {
    return Math.round((weightKg / heightMeters ** 2) * 10) / 10;
  }

  function getCategory(bmi) {
    return BMI_CATEGORIES.find((category) => bmi >= category.min && bmi < category.max);
  }

  function getPersonalNote({ age, gender }) {
    const notes = [];

    if (age) {
      if (age < 18) {
        notes.push('Для детей и подростков BMI оценивают иначе — по возрастным таблицам, поэтому лучше сверить результат со специалистом.');
      } else if (age >= 60) {
        notes.push('С возрастом особенно важны мышечная масса, сила и баланс, а не только цифра BMI.');
      }
    }

    if (gender === 'female') {
      notes.push('У женщин на вес и самочувствие могут влиять цикл, гормональный фон и уровень железа.');
    }

    if (gender === 'male') {
      notes.push('У мужчин высокий BMI иногда связан с развитой мышечной массой, поэтому полезно учитывать объёмы и состав тела.');
    }

    return notes;
  }

  function buildResult({ height, weight, age = '', gender = '' }) {
    const heightMeters = normalizeHeight(height);
    const weightKg = normalizeWeight(weight);
    const normalizedAge = normalizeAge(age);

    if (!heightMeters) {
      return { error: 'Проверь рост: укажи значение в сантиметрах или метрах, например 175 или 1.75.' };
    }

    if (!weightKg) {
      return { error: 'Проверь вес: укажи положительное число в килограммах, например 68.' };
    }

    if (String(age).trim() !== '' && !normalizedAge) {
      return { error: 'Проверь возраст: укажи число от 1 до 129 или оставь поле пустым.' };
    }

    const bmi = calculateBmi(weightKg, heightMeters);
    const category = getCategory(bmi);

    return {
      bmi,
      category,
      heightMeters,
      weightKg,
      personalNotes: getPersonalNote({ age: normalizedAge, gender })
    };
  }

  const api = {
    BMI_CATEGORIES,
    buildResult,
    calculateBmi,
    getCategory,
    normalizeAge,
    normalizeHeight,
    normalizeWeight
  };

  root.BMICalculator = api;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
