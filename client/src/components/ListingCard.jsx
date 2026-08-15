import { useState } from 'react';
import { Link } from 'react-router-dom';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&auto=format&fit=crop&q=80';

export function getConditionClass(condition) {
  const normalized = (condition || '').toLowerCase().replace(/\s+/g, '-');
  return `condition-badge--${normalized}`;
}

export function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price || 0);
}

export function formatDate(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export default function ListingCard({ listing }) {
  const [imgSrc, setImgSrc] = useState(listing.image || FALLBACK_IMAGE);

  return (
    <Link to={`/listings/${listing.id}`} className="listing-card" id={`listing-card-${listing.id}`}>
      <div className="listing-card__image-container">
        <img
          src={imgSrc}
          alt={listing.title}
          loading="lazy"
          className="listing-card__img"
          onError={() => setImgSrc(FALLBACK_IMAGE)}
        />
        <span className={`condition-badge ${getConditionClass(listing.condition)}`}>
          {listing.condition}
        </span>
      </div>

      <div className="listing-card__body">
        <div className="listing-card__header-line">
          <span className="listing-card__category">{listing.category}</span>
          <span className="listing-card__date">{formatDate(listing.createdAt)}</span>
        </div>

        <h3 className="listing-card__title" title={listing.title}>
          {listing.title}
        </h3>

        <div className="listing-card__footer-line">
          <span className="listing-card__price">{formatPrice(listing.price)}</span>
        </div>
      </div>
    </Link>
  );
}
