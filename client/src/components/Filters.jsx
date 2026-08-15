export const CATEGORIES = [
  'Electronics',
  'Furniture',
  'Vehicles',
  'Fashion',
  'Home & Garden',
  'Sports',
];

export default function Filters({ filters, onChange, onReset }) {
  const update = (patch) => onChange({ ...filters, ...patch, page: 1 });

  const hasActiveFilters = Boolean(
    filters.q ||
    filters.category ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.condition ||
    filters.sortBy !== 'date' ||
    filters.order !== 'desc'
  );

  return (
    <div className="filters-container">
      <div className="filters-grid">
        {/* Search Input */}
        <div className="filter-group filter-group--search">
          <label htmlFor="search-input" className="filter-label">Search</label>
          <div className="input-with-icon">
            <svg className="input-icon" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            <input
              id="search-input"
              type="search"
              placeholder="Search by title or description..."
              value={filters.q}
              onChange={(e) => update({ q: e.target.value })}
              className="filter-input"
            />
            {filters.q && (
              <button
                type="button"
                className="input-clear-btn"
                onClick={() => update({ q: '' })}
                aria-label="Clear search text"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Category Dropdown */}
        <div className="filter-group">
          <label htmlFor="category-select" className="filter-label">Category</label>
          <select
            id="category-select"
            value={filters.category}
            onChange={(e) => update({ category: e.target.value })}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range Filter */}
        <div className="filter-group filter-group--price">
          <label htmlFor="min-price-input" className="filter-label">Price Range ($)</label>
          <div className="price-inputs-row">
            <input
              id="min-price-input"
              type="number"
              placeholder="Min"
              min="0"
              value={filters.minPrice}
              onChange={(e) => update({ minPrice: e.target.value })}
              className="filter-input filter-input--price"
              aria-label="Minimum price"
            />
            <span className="price-separator">–</span>
            <input
              id="max-price-input"
              type="number"
              placeholder="Max"
              min="0"
              value={filters.maxPrice}
              onChange={(e) => update({ maxPrice: e.target.value })}
              className="filter-input filter-input--price"
              aria-label="Maximum price"
            />
          </div>
        </div>

        {/* Sort Selector */}
        <div className="filter-group">
          <label htmlFor="sort-select" className="filter-label">Sort By</label>
          <select
            id="sort-select"
            value={`${filters.sortBy}-${filters.order}`}
            onChange={(e) => {
              const [sortBy, order] = e.target.value.split('-');
              update({ sortBy, order });
            }}
            className="filter-select"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="filters-active-bar">
          <span className="filters-active-text">Active filters applied</span>
          <button
            type="button"
            className="btn-reset-filters"
            onClick={onReset}
            id="reset-filters-btn"
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
}
