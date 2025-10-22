const setupCategoryFilter = () => {
  const pills = Array.from(document.querySelectorAll('.category-pill'));
  const products = Array.from(document.querySelectorAll('.collection-product'));
  const grid = document.querySelector('.product-grid');

  if (!pills.length || !products.length || !grid) return;

  const activatePill = (activePill) => {
    pills.forEach((pill) => {
      const isActive = pill === activePill;
      pill.classList.toggle('active', isActive);
      pill.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  };

  const filterProducts = (category) => {
    products.forEach((product) => {
      const dataset = product.dataset.categories || '';
      const normalized = dataset.split(',').map((item) => item.trim()).filter(Boolean);
      const shouldShow = category === 'all' || normalized.includes(category);
      product.classList.toggle('is-hidden', !shouldShow);
      product.setAttribute('aria-hidden', shouldShow ? 'false' : 'true');
    });

    if (grid) {
      grid.setAttribute('data-active-category', category);
    }
  };

  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const { category = 'all' } = pill.dataset;
      activatePill(pill);
      filterProducts(category);
    });
  });

  const defaultPill = pills.find((pill) => pill.classList.contains('active')) || pills[0];
  if (defaultPill) {
    const { category = 'all' } = defaultPill.dataset;
    activatePill(defaultPill);
    filterProducts(category);
  }
};

window.addEventListener('DOMContentLoaded', setupCategoryFilter);
