const assert = require('node:assert/strict');
const {
  buildResult,
  calculateBmi,
  getCategory,
  normalizeAge,
  normalizeHeight,
  normalizeWeight
} = require('../src/bmi');

assert.equal(normalizeHeight('175'), 1.75);
assert.equal(normalizeHeight('1,75'), 1.75);
assert.equal(normalizeHeight('-10'), null);

assert.equal(normalizeWeight('68,5'), 68.5);
assert.equal(normalizeWeight('0'), null);

assert.equal(normalizeAge('32'), 32);
assert.equal(normalizeAge(''), null);
assert.equal(normalizeAge('140'), null);

assert.equal(calculateBmi(70, 1.75), 22.9);
assert.equal(getCategory(17).key, 'underweight');
assert.equal(getCategory(18.5).key, 'normal');
assert.equal(getCategory(25).key, 'overweight');
assert.equal(getCategory(30).key, 'obesity');

const result = buildResult({ height: '180', weight: '80', age: '64', gender: 'male' });
assert.equal(result.bmi, 24.7);
assert.equal(result.category.key, 'normal');
assert.equal(result.personalNotes.length, 2);

assert.match(buildResult({ height: 'abc', weight: '80' }).error, /Проверь рост/);
assert.match(buildResult({ height: '180', weight: 'abc' }).error, /Проверь вес/);
assert.match(buildResult({ height: '180', weight: '80', age: '200' }).error, /Проверь возраст/);

console.log('BMI calculation tests passed');
