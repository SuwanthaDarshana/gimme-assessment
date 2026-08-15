import { useEffect, useState, useCallback, useRef } from 'react';
import { api } from '../api/client';
import ListingCard from '../components/ListingCard';
import Filters from '../components/Filters';
import Pagination from '../components/Pagination';
import { LoadingState, ErrorState, EmptyState } from '../components/StatusStates';

const DEFAULT_FILTERS = {
  q: '',
  category: '',
  minPrice: '',
  maxPrice: '',
  sortBy: 'date',
  order: 'desc',
  page: 1,
};

const ITEMS_PER_PAGE = 12;

export default function ListingsPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [listings, setListings] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: ITEMS_PER_PAGE, totalPages: 1 });
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const isFirstMount = useRef(true);

  const fetchListings = useCallback(async (currentFilters) => {
    setStatus('loading');
    setErrorMessage('');
    try {
      const res = await api.getListings({
        ...currentFilters,
        limit: ITEMS_PER_PAGE,
      });
      setListings(res.data || []);
      setMeta(res.meta || { total: 0, page: 1, limit: ITEMS_PER_PAGE, totalPages: 1 });
      setStatus('success');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to fetch listings');
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    const delay = isFirstMount.current ? 0 : 250;
    isFirstMount.current = false;

    const timer = setTimeout(() => {
      fetchListings(filters);
    }, delay);

    return () => clearTimeout(timer);
  }, [filters, fetchListings]);

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  return (
    <div className="page page--listings">
      <div className="page-hero">
        <div className="page-hero__content">
          <h1 className="page-hero__title">Browse Listings</h1>
          <p className="page-hero__subtitle">
            Find and buy pre-owned items from trusted sellers.
          </p>
        </div>
      </div>

      <Filters
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
      />

      {status === 'loading' && <LoadingState label="Loading listings..." />}

      {status === 'error' && (
        <ErrorState
          message={errorMessage}
          onRetry={() => fetchListings(filters)}
        />
      )}

      {status === 'success' && listings.length === 0 && (
        <EmptyState
          title="No listings found"
          message="No items match your selected filters. Try changing your search query or clearing active filters."
          action={
            <button type="button" className="btn btn--primary" onClick={handleResetFilters}>
              Clear filters
            </button>
          }
        />
      )}

      {status === 'success' && listings.length > 0 && (
        <>
          <div className="listing-grid" id="listings-grid">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>

          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            total={meta.total}
            limit={meta.limit}
            onPageChange={(newPage) => {
              setFilters((prev) => ({ ...prev, page: newPage }));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </>
      )}
    </div>
  );
}
