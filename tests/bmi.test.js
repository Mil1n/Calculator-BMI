const assert = require('node:assert/strict');
const {
  buildResult,
  calculateBmi,
  calculateHealthyWeightRange,
  calculateWeightChangePreview,
  getCategory,
  getNutritionTips,
  normalizeAge,
  normalizeHeight,
  normalizeWeight
} = require('../src/bmi');
const {
  HISTORY_LIMIT,
  addHistoryItem,
  clearHistory,
  exportHistoryToCsv,
  getHistory
} = require('../src/history');

function test(name, fn) {
  fn();
  console.log(`✓ ${name}`);
}

function createMemoryStorage() {
  const data = new Map();
  return {
    getItem: (key) => data.get(key) || null,
    setItem: (key, value) => data.set(key, value),
    removeItem: (key) => data.delete(key)
  };
}

test('normalizes height, weight, and age safely', () => {
  assert.equal(normalizeHeight('175'), 1.75);
  assert.equal(normalizeHeight('1,75'), 1.75);
  assert.equal(normalizeHeight('-10'), null);
  assert.equal(normalizeHeight('49'), null);
  assert.equal(normalizeHeight('251'), null);
  assert.equal(normalizeHeight('3.01'), null);

  assert.equal(normalizeWeight('68,5'), 68.5);
  assert.equal(normalizeWeight('0'), null);
  assert.equal(normalizeWeight('1'), null);
  assert.equal(normalizeWeight('501'), null);

  assert.equal(normalizeAge('32'), 32);
  assert.equal(normalizeAge(''), null);
  assert.equal(normalizeAge('140'), null);
  assert.equal(normalizeAge('32.5'), null);
});

test('calculates BMI, categories, healthy range, and preview', () => {
  assert.equal(calculateBmi(70, 1.75), 22.9);
  assert.deepEqual(calculateHealthyWeightRange(1.75), { min: 56.7, max: 76.3 });
  assert.deepEqual(calculateWeightChangePreview(80, 1.8), {
    delta: 4,
    lower: { weight: 76, bmi: 23.5 },
    higher: { weight: 84, bmi: 25.9 }
  });
  assert.equal(getCategory(17).key, 'underweight');
  assert.equal(getCategory(18.5).key, 'normal');
  assert.equal(getCategory(25).key, 'overweight');
  assert.equal(getCategory(30).key, 'obesity');
});

test('builds personalized adult and teen results', () => {
  const result = buildResult({ height: '180', weight: '80', age: '64', gender: 'male', goal: 'maintain', activity: 'medium' });
  assert.equal(result.bmi, 24.7);
  assert.equal(result.category.key, 'normal');
  assert.equal(result.personalNotes.length, 4);
  assert.deepEqual(result.healthyWeightRange, { min: 59.9, max: 80.7 });
  assert.equal(result.nutritionTips.length, 2);

  const teenResult = buildResult({ height: '165', weight: '55', age: '16' });
  assert.equal(teenResult.isChildOrTeen, true);
  assert.match(teenResult.personalNotes[0], /возрастно-половым/);
});

test('returns friendly validation errors', () => {
  assert.match(buildResult({ height: 'abc', weight: '80' }).error, /Проверь рост/);
  assert.match(buildResult({ height: '180', weight: 'abc' }).error, /Проверь вес/);
  assert.match(buildResult({ height: '180', weight: '80', age: '200' }).error, /Проверь возраст/);
});

test('creates contextual nutrition tips', () => {
  const tips = getNutritionTips('overweight', 'lose', 'high');
  assert.equal(tips.length, 4);
  assert.match(tips.at(-1), /высокой активности/);
});

test('stores, deduplicates, clears, and exports history', () => {
  const storage = createMemoryStorage();
  const result = buildResult({ height: '180', weight: '80' });

  addHistoryItem(result, storage, new Date('2026-07-18T10:00:00Z'));
  addHistoryItem(result, storage, new Date('2026-07-18T10:01:00Z'));
  assert.equal(getHistory(storage).length, 1);

  for (let index = 0; index < HISTORY_LIMIT + 2; index += 1) {
    addHistoryItem(buildResult({ height: '180', weight: String(70 + index) }), storage, new Date(`2026-07-18T10:${String(index + 2).padStart(2, '0')}:00Z`));
  }

  const history = getHistory(storage);
  assert.equal(history.length, HISTORY_LIMIT);
  assert.match(exportHistoryToCsv(history), /"Дата","BMI","Категория","Рост, см","Вес, кг"/);

  clearHistory(storage);
  assert.equal(getHistory(storage).length, 0);
});

console.log('BMI calculation tests passed');
