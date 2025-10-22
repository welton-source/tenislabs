const assert = require('assert');
const {
  normalizeCategories,
  shouldShowProduct,
  applyProductVisibility,
  filterProducts,
  activatePill,
} = require('../assets/js/main.js');

const createFakeElement = ({
  classes = [],
  dataset = {},
  attributes = {},
} = {}) => {
  const classSet = new Set(classes);
  const attrStore = Object.assign({}, attributes);

  return {
    dataset: Object.assign({}, dataset),
    classList: {
      toggle(className, force) {
        if (typeof force === 'boolean') {
          if (force) {
            classSet.add(className);
          } else {
            classSet.delete(className);
          }
          return;
        }

        if (classSet.has(className)) {
          classSet.delete(className);
        } else {
          classSet.add(className);
        }
      },
      contains(className) {
        return classSet.has(className);
      },
    },
    setAttribute(name, value) {
      attrStore[name] = String(value);
    },
    getAttribute(name) {
      return attrStore[name];
    },
    _debug: {
      classes: classSet,
      attributes: attrStore,
    },
  };
};

const createFakeGrid = () => {
  const attributes = {};
  return {
    setAttribute(name, value) {
      attributes[name] = String(value);
    },
    getAttribute(name) {
      return attributes[name];
    },
    _debug: { attributes },
  };
};

const tests = [
  {
    name: 'normalizeCategories removes empty entries and trims whitespace',
    fn: () => {
      const result = normalizeCategories('street,  running , ,lifestyle,,');
      assert.deepStrictEqual(result, ['street', 'running', 'lifestyle']);
    },
  },
  {
    name: 'shouldShowProduct respects the "all" category and matches entries',
    fn: () => {
      assert.strictEqual(shouldShowProduct(['street'], 'all'), true);
      assert.strictEqual(shouldShowProduct(['street', 'running'], 'running'), true);
      assert.strictEqual(shouldShowProduct(['street'], 'performance'), false);
    },
  },
  {
    name: 'filterProducts hides products without the selected category',
    fn: () => {
      const products = [
        createFakeElement({ dataset: { categories: 'street, running' } }),
        createFakeElement({ dataset: { categories: 'performance' } }),
        createFakeElement({ dataset: { categories: '' } }),
      ];
      const grid = createFakeGrid();

      filterProducts(products, 'street', grid);

      assert.strictEqual(products[0].classList.contains('is-hidden'), false);
      assert.strictEqual(products[0].getAttribute('aria-hidden'), 'false');
      assert.strictEqual(products[1].classList.contains('is-hidden'), true);
      assert.strictEqual(products[1].getAttribute('aria-hidden'), 'true');
      assert.strictEqual(products[2].classList.contains('is-hidden'), true);
      assert.strictEqual(grid.getAttribute('data-active-category'), 'street');
    },
  },
  {
    name: 'filterProducts shows all products when category is "all"',
    fn: () => {
      const products = [
        createFakeElement({ dataset: { categories: 'street' }, classes: ['is-hidden'] }),
        createFakeElement({ dataset: { categories: '' }, classes: ['is-hidden'] }),
      ];
      const grid = createFakeGrid();

      filterProducts(products, 'all', grid);

      products.forEach((product) => {
        assert.strictEqual(product.classList.contains('is-hidden'), false);
        assert.strictEqual(product.getAttribute('aria-hidden'), 'false');
      });
      assert.strictEqual(grid.getAttribute('data-active-category'), 'all');
    },
  },
  {
    name: 'activatePill toggles active state and accessibility attributes',
    fn: () => {
      const pills = [
        createFakeElement({ classes: ['active'], dataset: { category: 'all' }, attributes: { 'aria-pressed': 'true' } }),
        createFakeElement({ dataset: { category: 'street' }, attributes: { 'aria-pressed': 'false' } }),
      ];

      activatePill(pills, pills[1]);

      assert.strictEqual(pills[0].classList.contains('active'), false);
      assert.strictEqual(pills[0].getAttribute('aria-pressed'), 'false');
      assert.strictEqual(pills[1].classList.contains('active'), true);
      assert.strictEqual(pills[1].getAttribute('aria-pressed'), 'true');
    },
  },
];

let failures = 0;

for (const test of tests) {
  try {
    test.fn();
    console.log(`✔ ${test.name}`);
  } catch (error) {
    failures += 1;
    console.error(`✖ ${test.name}`);
    console.error(error.stack || error.message || error);
  }
}

if (failures > 0) {
  process.exitCode = 1;
} else {
  console.log(`\n${tests.length} tests passed`);
}
