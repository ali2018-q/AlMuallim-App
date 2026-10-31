const test = require("node:test");
const assert = require("node:assert/strict");

const points = [100,200,300,400,500,600,700,800,900,1000];

function score(correctness) {
  if (!Array.isArray(correctness) || correctness.length !== 10) {
    throw new Error("A stage must contain exactly 10 answers");
  }
  return correctness.reduce((total, ok, index) => total + (ok ? points[index] : 0), 0);
}

test("perfect stage awards 5500 points", () => {
  assert.equal(score(Array(10).fill(true)), 5500);
});

test("all incorrect answers award zero", () => {
  assert.equal(score(Array(10).fill(false)), 0);
});

test("question position determines award", () => {
  const answers = Array(10).fill(false);
  answers[0] = true;
  answers[9] = true;
  assert.equal(score(answers), 1100);
});

test("rejects a stage with wrong answer count", () => {
  assert.throws(() => score([true, false]), /exactly 10/);
});
