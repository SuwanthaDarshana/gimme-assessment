import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../api/AuthContext';
import ListingCard, { formatPrice, formatDate, getConditionClass } from '../components/ListingCard';
import ConfirmDialog from '../components/ConfirmDialog';
import { LoadingState, ErrorState } from '../components/StatusStates';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&auto=format&fit=crop&q=80';

export default function ListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [listing, setListing] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [imgSrc, setImgSrc] = useState(FALLBACK_IMAGE);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const load = useCallback(async () => {
    setStatus('loading');
    setErrorMessage('');
    setDeleteError(null);
    try {
      const { data } = await api.getListing(id);
      setListing(data);
      setImgSrc(data.image || FALLBACK_IMAGE);
      setStatus('success');

      // Fetch similar items in the same category
      try {
        const similarRes = await api.getListings({
          category: data.category,
          excludeId: data.id,
          limit: 4,
        });
        setSimilar(similarRes.data || []);
      } catch {
        setSimilar([]);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Listing not found.');
      setStatus('error');
    }
  }, [id]);

  useEffect(() => {
    load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [load]);

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await api.deleteListing(id);
      setConfirmOpen(false);
      navigate('/', { replace: true });
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete listing. Make sure you are authenticated.');
      setIsDeleting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="page page--detail">
        <LoadingState label="Loading product details..." />
      </div>
    );
  }

  if (status === 'error' || !listing) {
    return (
      <div className="page page--detail">
        <div className="detail-navigation">
          <Link to="/" className="back-link">
            ← Back to all listings
          </Link>
        </div>
        <ErrorState
          message={errorMessage || 'This listing could not be found or has been removed.'}
          onRetry={load}
        />
      </div>
    );
  }

  const specsEntries = listing.specifications ? Object.entries(listing.specifications) : [];

  return (
    <div className="page page--detail">
      <div className="detail-navigation">
        <Link to="/" className="back-link">
          &larr; Back to listings
        </Link>
      </div>

      <article className="listing-detail-card">
        <div className="listing-detail__media">
          <div className="listing-detail__image-wrapper">
            <img
              src={imgSrc}
              alt={listing.title}
              className="listing-detail__image"
              onError={() => setImgSrc(FALLBACK_IMAGE)}
            />
            <span className={`condition-badge condition-badge--large ${getConditionClass(listing.condition)}`}>
              {listing.condition}
            </span>
          </div>
        </div>

        <div className="listing-detail__content">
          <div className="listing-detail__meta-bar">
            <span className="listing-detail__category">{listing.category}</span>
            <span className="listing-detail__date">Listed {formatDate(listing.createdAt)}</span>
          </div>

          <h1 className="listing-detail__title">{listing.title}</h1>
          <div className="listing-detail__price">{formatPrice(listing.price)}</div>

          <div className="listing-detail__section">
            <h2 className="section-heading">Description</h2>
            <p className="listing-detail__description">{listing.description}</p>
          </div>

          {specsEntries.length > 0 && (
            <div className="listing-detail__section">
              <h2 className="section-heading">Specifications & Details</h2>
              <div className="specs-grid">
                {specsEntries.map(([key, val]) => (
                  <div key={key} className="spec-item">
                    <dt className="spec-label">{key}</dt>
                    <dd className="spec-value">{String(val)}</dd>
                  </div>
                ))}
              </div>
            </div>
          )}

          {deleteError && (
            <div className="alert alert--error" role="alert">
              <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" style={{ flexShrink: 0 }}>
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{deleteError}</span>
            </div>
          )}

          <div className="listing-detail__actions">
            {isAuthenticated ? (
              <button
                type="button"
                className="btn btn--danger"
                onClick={() => setConfirmOpen(true)}
                id="delete-listing-btn"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" style={{ marginRight: '6px' }}>
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Delete listing
              </button>
            ) : (
              <div className="auth-notice">
                <span>Want to edit or remove this listing?</span>
                <Link to="/login" state={{ redirectTo: `/listings/${listing.id}` }} className="auth-notice__link">
                  Sign in
                </Link>
              </div>
            )}
          </div>
        </div>
      </article>

      {similar.length > 0 && (
        <section className="similar-section" aria-labelledby="similar-heading">
          <div className="similar-section__header">
            <h2 id="similar-heading" className="similar-section__title">
              Similar items in {listing.category}
            </h2>
            <span className="similar-section__badge">{similar.length} items</span>
          </div>

          <div className="listing-grid">
            {similar.map((item) => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>
        </section>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this listing?"
        message={`Are you sure you want to permanently delete "${listing.title}"? This action cannot be undone.`}
        confirmLabel="Yes, Delete Listing"
        cancelLabel="Cancel"
        isProcessing={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!isDeleting) setConfirmOpen(false);
        }}
      />
    </div>
  );
}
