export default function Pagination({ page, totalPages, total, limit, onPageChange }) {
  if (totalPages <= 1) {
    if (total > 0) {
      return (
        <div className="pagination-summary-only">
          Showing all {total} item{total === 1 ? '' : 's'}
        </div>
      );
    }
    return null;
  }

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  const pages = [];
  for (let p = 1; p <= totalPages; p++) {
    pages.push(p);
  }

  return (
    <div className="pagination-wrapper">
      <div className="pagination-info">
        Showing <strong>{startItem}–{endItem}</strong> of <strong>{total}</strong> listings
      </div>

      <nav className="pagination" aria-label="Pagination Navigation">
        <button
          type="button"
          className="pagination-btn pagination-btn--nav"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous Page"
          id="pagination-prev"
        >
          Previous
        </button>

        <div className="pagination-numbers">
          {pages.map((p) => (
            <button
              key={p}
              type="button"
              className={`pagination-number-btn ${p === page ? 'pagination-number-btn--active' : ''}`}
              onClick={() => onPageChange(p)}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="pagination-btn pagination-btn--nav"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next Page"
          id="pagination-next"
        >
          Next
        </button>
      </nav>
    </div>
  );
}
