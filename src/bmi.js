(function (root) {
  const HEIGHT_LIMITS = {
    min: 0.5,
    max: 2.5
  };

  const WEIGHT_LIMITS = {
    min: 2,
    max: 500
  };

  const HEALTHY_BMI_RANGE = {
    min: 18.5,
    max: 24.9
  };

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

  const GOAL_NOTES = {
    maintain: 'Если цель — поддерживать вес, полезно отслеживать привычки, которые уже работают: сон, движение, питание и уровень стресса.',
    gain: 'Если хочешь набрать вес, делай ставку на регулярное питание, достаточный белок и постепенные силовые нагрузки.',
    lose: 'Если хочешь снизить вес, безопаснее двигаться маленькими шагами: умеренный дефицит, больше активности и без жёстких запретов.',
    learn: 'Если ты просто изучаешь показатель, воспринимай BMI как стартовую подсказку, а не как итоговую оценку здоровья.'
  };

  const ACTIVITY_NOTES = {
    low: 'При низкой активности начни с коротких прогулок, лёгкой разминки или бытового движения — регулярность важнее интенсивности.',
    medium: 'При умеренной активности старайся сочетать кардио, силовые упражнения и дни восстановления.',
    high: 'При высокой активности особенно важны восстановление, достаточное питание и внимательное отношение к сигналам усталости.'
  };

  function parseNumber(value) {
    return Number.parseFloat(String(value).trim().replace(',', '.'));
  }

  function isWithinRange(value, limits) {
    return value >= limits.min && value <= limits.max;
  }

  function normalizeHeight(value) {
    const height = parseNumber(value);

    if (!Number.isFinite(height) || height <= 0) {
      return null;
    }

    const heightMeters = height > 3 ? height / 100 : height;
    return isWithinRange(heightMeters, HEIGHT_LIMITS) ? heightMeters : null;
  }

  function normalizeWeight(value) {
    const weight = parseNumber(value);
    return Number.isFinite(weight) && isWithinRange(weight, WEIGHT_LIMITS) ? weight : null;
  }

  function normalizeAge(value) {
    if (String(value).trim() === '') {
      return null;
    }

    const age = Number(value);
    return Number.isInteger(age) && age > 0 && age < 130 ? age : null;
  }

  function calculateBmi(weightKg, heightMeters) {
    return Math.round((weightKg / heightMeters ** 2) * 10) / 10;
  }

  function calculateHealthyWeightRange(heightMeters) {
    return {
      min: Math.round((HEALTHY_BMI_RANGE.min * heightMeters ** 2) * 10) / 10,
      max: Math.round((HEALTHY_BMI_RANGE.max * heightMeters ** 2) * 10) / 10
    };
  }

  function getCategory(bmi) {
    return BMI_CATEGORIES.find((category) => bmi >= category.min && bmi < category.max);
  }

  function calculateWeightChangePreview(weightKg, heightMeters) {
    const delta = Math.max(1, Math.round(weightKg * 0.05));
    const lowerWeight = Math.max(WEIGHT_LIMITS.min, weightKg - delta);
    const higherWeight = Math.min(WEIGHT_LIMITS.max, weightKg + delta);

    return {
      delta,
      lower: {
        weight: Math.round(lowerWeight * 10) / 10,
        bmi: calculateBmi(lowerWeight, heightMeters)
      },
      higher: {
        weight: Math.round(higherWeight * 10) / 10,
        bmi: calculateBmi(higherWeight, heightMeters)
      }
    };
  }

  function getNutritionTips(categoryKey, goal = '', activity = '') {
    const tipsByCategory = {
      underweight: [
        'Добавляй к привычным блюдам питательные ингредиенты: орехи, авокадо, сыр, яйца, рыбу или бобовые.',
        'Если сложно добирать калории, попробуй 1–2 дополнительных перекуса между основными приёмами пищи.'
      ],
      normal: [
        'Сохраняй разнообразие: половина тарелки овощи или фрукты, четверть белок и четверть сложные углеводы.',
        'Поддерживай стабильный режим питания, который не мешает энергии, сну и тренировкам.'
      ],
      overweight: [
        'Начни с мягких замен: вода вместо сладких напитков, больше овощей и чуть меньше ультрапереработанных перекусов.',
        'Выбирай постепенные изменения, которые можно повторять неделями, а не строгие короткие ограничения.'
      ],
      obesity: [
        'Сфокусируйся на безопасных маленьких шагах: регулярные приёмы пищи, больше белка и клетчатки, меньше жидких калорий.',
        'Если есть возможность, обсуди питание со специалистом — индивидуальный план обычно спокойнее и безопаснее.'
      ]
    };
    const tips = [...(tipsByCategory[categoryKey] || tipsByCategory.normal)];

    if (goal === 'gain') {
      tips.push('Для набора веса полезнее увеличивать порции постепенно и сочетать питание с силовыми нагрузками.');
    } else if (goal === 'lose') {
      tips.push('Для снижения веса лучше начинать с умеренного дефицита и не убирать целые группы продуктов без причины.');
    }

    if (activity === 'high') {
      tips.push('При высокой активности не забывай про восстановление, воду и достаточное количество углеводов вокруг нагрузок.');
    }

    return tips;
  }

  function getPersonalNote({ age, gender, goal, activity }) {
    const notes = [];

    if (age) {
      if (age < 18) {
        notes.push('Для детей и подростков BMI оценивают иначе — по возрастно-половым таблицам, поэтому лучше сверить результат со специалистом. Взрослая категория ниже показана только как общий ориентир.');
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

    if (GOAL_NOTES[goal]) {
      notes.push(GOAL_NOTES[goal]);
    }

    if (ACTIVITY_NOTES[activity]) {
      notes.push(ACTIVITY_NOTES[activity]);
    }

    return notes;
  }

  function buildResult({ height, weight, age = '', gender = '', goal = '', activity = '' }) {
    const heightMeters = normalizeHeight(height);
    const weightKg = normalizeWeight(weight);
    const normalizedAge = normalizeAge(age);

    if (!heightMeters) {
      return { error: 'Проверь рост: укажи реалистичное значение от 50 до 250 см или от 0.5 до 2.5 м.' };
    }

    if (!weightKg) {
      return { error: 'Проверь вес: укажи реалистичное положительное число от 2 до 500 кг.' };
    }

    if (String(age).trim() !== '' && !normalizedAge) {
      return { error: 'Проверь возраст: укажи целое число от 1 до 129 или оставь поле пустым.' };
    }

    const bmi = calculateBmi(weightKg, heightMeters);
    const category = getCategory(bmi);

    return {
      bmi,
      category,
      heightMeters,
      weightKg,
      healthyWeightRange: calculateHealthyWeightRange(heightMeters),
      isChildOrTeen: Boolean(normalizedAge && normalizedAge < 18),
      nutritionTips: getNutritionTips(category.key, goal, activity),
      personalNotes: getPersonalNote({ age: normalizedAge, gender, goal, activity }),
      weightChangePreview: calculateWeightChangePreview(weightKg, heightMeters)
    };
  }

  const api = {
    ACTIVITY_NOTES,
    BMI_CATEGORIES,
    GOAL_NOTES,
    HEALTHY_BMI_RANGE,
    HEIGHT_LIMITS,
    WEIGHT_LIMITS,
    buildResult,
    calculateBmi,
    calculateHealthyWeightRange,
    calculateWeightChangePreview,
    getCategory,
    getNutritionTips,
    normalizeAge,
    normalizeHeight,
    normalizeWeight
  };

  root.BMICalculator = api;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
