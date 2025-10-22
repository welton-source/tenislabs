const normalizeCategories = (value) => {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

const shouldShowProduct = (categories, selectedCategory) => {
  if (!selectedCategory || selectedCategory === 'all') {
    return true;
  }

  return Array.isArray(categories) && categories.includes(selectedCategory);
};

const applyProductVisibility = (product, shouldShow) => {
  if (!product) return;

  const classList = product.classList;
  if (classList && typeof classList.toggle === 'function') {
    classList.toggle('is-hidden', !shouldShow);
  }

  if (typeof product.setAttribute === 'function') {
    product.setAttribute('aria-hidden', shouldShow ? 'false' : 'true');
  }
};

const filterProducts = (products, category, grid) => {
  const activeCategory = category || 'all';

  (products || []).forEach((product) => {
    const data = product && product.dataset ? product.dataset.categories : '';
    const categories = normalizeCategories(data);
    const visible = shouldShowProduct(categories, activeCategory);
    applyProductVisibility(product, visible);
  });

  if (grid && typeof grid.setAttribute === 'function') {
    grid.setAttribute('data-active-category', activeCategory);
  }
};

const activatePill = (pills, activePill) => {
  (pills || []).forEach((pill) => {
    const isActive = pill === activePill;
    const classList = pill && pill.classList;

    if (classList && typeof classList.toggle === 'function') {
      classList.toggle('active', isActive);
    }

    if (typeof pill.setAttribute === 'function') {
      pill.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    }
  });
};

const setupCategoryFilter = () => {
  if (typeof document === 'undefined') return;

  const pills = Array.from(document.querySelectorAll('.category-pill'));
  const products = Array.from(document.querySelectorAll('.collection-product'));
  const grid = document.querySelector('.product-grid');

  if (!pills.length || !products.length || !grid) return;

  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const dataset = pill.dataset || {};
      const category = dataset.category || 'all';
      activatePill(pills, pill);
      filterProducts(products, category, grid);
    });
  });

  const defaultPill = pills.find((pill) => pill.classList.contains('active')) || pills[0];
  if (defaultPill) {
    const dataset = defaultPill.dataset || {};
    const category = dataset.category || 'all';
    activatePill(pills, defaultPill);
    filterProducts(products, category, grid);
  }
};

const api = {
  normalizeCategories,
  shouldShowProduct,
  applyProductVisibility,
  filterProducts,
  activatePill,
  setupCategoryFilter,
};

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', setupCategoryFilter);
  window.tenisLabs = window.tenisLabs || {};
  window.tenisLabs.categoryFilter = api;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
}
