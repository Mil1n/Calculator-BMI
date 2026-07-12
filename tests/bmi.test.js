const assert = require('node:assert/strict');
const {
  buildResult,
  calculateBmi,
  calculateHealthyWeightRange,
  getCategory,
  normalizeAge,
  normalizeHeight,
  normalizeWeight
} = require('../src/bmi');

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

assert.equal(calculateBmi(70, 1.75), 22.9);
assert.deepEqual(calculateHealthyWeightRange(1.75), { min: 56.7, max: 76.3 });
assert.equal(getCategory(17).key, 'underweight');
assert.equal(getCategory(18.5).key, 'normal');
assert.equal(getCategory(25).key, 'overweight');
assert.equal(getCategory(30).key, 'obesity');

const result = buildResult({ height: '180', weight: '80', age: '64', gender: 'male', goal: 'maintain', activity: 'medium' });
assert.equal(result.bmi, 24.7);
assert.equal(result.category.key, 'normal');
assert.equal(result.personalNotes.length, 4);
assert.deepEqual(result.healthyWeightRange, { min: 59.9, max: 80.7 });

assert.match(buildResult({ height: 'abc', weight: '80' }).error, /Проверь рост/);
assert.match(buildResult({ height: '180', weight: 'abc' }).error, /Проверь вес/);
assert.match(buildResult({ height: '180', weight: '80', age: '200' }).error, /Проверь возраст/);

const teenResult = buildResult({ height: '165', weight: '55', age: '16' });
assert.equal(teenResult.isChildOrTeen, true);
assert.match(teenResult.personalNotes[0], /возрастно-половым/);

console.log('BMI calculation tests passed');
