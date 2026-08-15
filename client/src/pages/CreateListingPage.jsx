import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../api/AuthContext';
import { CATEGORIES } from '../components/Filters';

const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor'];

const EMPTY_FORM = {
  title: '',
  category: '',
  price: '',
  condition: 'Good',
  description: '',
  image: '',
  specBrand: '',
  specModel: '',
  specKeyExtra: '',
  specValExtra: '',
};

function validate(form) {
  const errors = {};

  if (!form.title || !form.title.trim()) {
    errors.title = 'Title is required.';
  } else if (form.title.trim().length > 120) {
    errors.title = 'Title must be 120 characters or fewer.';
  }

  if (!form.category) {
    errors.category = 'Please select a product category.';
  }

  if (form.price === undefined || form.price === null || form.price === '') {
    errors.price = 'Price is required.';
  } else {
    const num = Number(form.price);
    if (isNaN(num) || num <= 0) {
      errors.price = 'Price must be a positive number greater than 0.';
    }
  }

  if (!form.condition) {
    errors.condition = 'Please select the item condition.';
  }

  if (!form.description || !form.description.trim()) {
    errors.description = 'Description is required.';
  } else if (form.description.trim().length < 10) {
    errors.description = 'Description must be at least 10 characters.';
  } else if (form.description.trim().length > 2000) {
    errors.description = 'Description cannot exceed 2000 characters.';
  }

  if (form.image && form.image.trim()) {
    try {
      const parsed = new URL(form.image.trim());
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        errors.image = 'Image URL must start with http:// or https://';
      }
    } catch {
      errors.image = 'Please enter a valid URL (e.g. https://images.unsplash.com/...)';
    }
  }

  return errors;
}

export default function CreateListingPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ redirectTo: '/create' }} />;
  }

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    const updated = { ...form, [field]: value };
    setForm(updated);

    if (touched[field]) {
      const valErrors = validate(updated);
      setErrors((prev) => ({
        ...prev,
        [field]: valErrors[field],
      }));
    }
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const valErrors = validate(form);
    setErrors((prev) => ({
      ...prev,
      [field]: valErrors[field],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);
    setTouched({
      title: true,
      category: true,
      price: true,
      condition: true,
      description: true,
      image: true,
    });

    if (Object.keys(validationErrors).length > 0) {
      const firstKey = Object.keys(validationErrors)[0];
      const element = document.getElementById(`field-${firstKey}`);
      if (element) element.focus();
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const specifications = {};
    if (form.specBrand.trim()) specifications.Brand = form.specBrand.trim();
    if (form.specModel.trim()) specifications.Model = form.specModel.trim();
    if (form.specKeyExtra.trim() && form.specValExtra.trim()) {
      specifications[form.specKeyExtra.trim()] = form.specValExtra.trim();
    }

    try {
      const { data } = await api.createListing({
        title: form.title.trim(),
        category: form.category,
        price: Number(form.price),
        condition: form.condition,
        description: form.description.trim(),
        image: form.image.trim() || null,
        specifications,
      });

      navigate(`/listings/${data.id}`);
    } catch (err) {
      if (err.details && Array.isArray(err.details)) {
        setSubmitError(err.details.join(', '));
      } else {
        setSubmitError(err.message || 'Failed to create listing.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page page--narrow">
      <div className="form-card">
        <div className="form-card__header">
          <Link to="/" className="back-link">
            &larr; Cancel
          </Link>
          <h1 className="form-card__title">Create Listing</h1>
          <p className="form-card__subtitle">
            Provide details about your item to publish it on the marketplace.
          </p>
        </div>

        {submitError && (
          <div className="alert alert--error" role="alert">
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" style={{ flexShrink: 0 }}>
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{submitError}</span>
          </div>
        )}

        <form className="form" onSubmit={handleSubmit} noValidate>
          {/* Title */}
          <div className="form-group">
            <label htmlFor="field-title" className="form-label">
              Listing Title <span className="required-star">*</span>
            </label>
            <input
              id="field-title"
              type="text"
              placeholder="e.g. Apple MacBook Pro 14 (M3 Pro)"
              value={form.title}
              onChange={handleChange('title')}
              onBlur={handleBlur('title')}
              className={`form-input ${errors.title ? 'form-input--error' : ''}`}
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? 'error-title' : undefined}
              maxLength={120}
            />
            <div className="field-hint-row">
              {errors.title ? (
                <span id="error-title" className="field-error">
                  {errors.title}
                </span>
              ) : (
                <span className="field-hint">A clear, descriptive headline</span>
              )}
              <span className="char-count">{form.title.length}/120</span>
            </div>
          </div>

          {/* Category & Condition Row */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="field-category" className="form-label">
                Category <span className="required-star">*</span>
              </label>
              <select
                id="field-category"
                value={form.category}
                onChange={handleChange('category')}
                onBlur={handleBlur('category')}
                className={`form-select ${errors.category ? 'form-input--error' : ''}`}
                aria-invalid={Boolean(errors.category)}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.category && <span className="field-error">{errors.category}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="field-condition" className="form-label">
                Condition <span className="required-star">*</span>
              </label>
              <select
                id="field-condition"
                value={form.condition}
                onChange={handleChange('condition')}
                onBlur={handleBlur('condition')}
                className={`form-select ${errors.condition ? 'form-input--error' : ''}`}
              >
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.condition && <span className="field-error">{errors.condition}</span>}
            </div>
          </div>

          {/* Price */}
          <div className="form-group">
            <label htmlFor="field-price" className="form-label">
              Price (USD $) <span className="required-star">*</span>
            </label>
            <div className="input-prefix-wrapper">
              <span className="input-prefix">$</span>
              <input
                id="field-price"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={form.price}
                onChange={handleChange('price')}
                onBlur={handleBlur('price')}
                className={`form-input form-input--with-prefix ${errors.price ? 'form-input--error' : ''}`}
                aria-invalid={Boolean(errors.price)}
              />
            </div>
            {errors.price && <span className="field-error">{errors.price}</span>}
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="field-description" className="form-label">
              Description <span className="required-star">*</span>
            </label>
            <textarea
              id="field-description"
              rows={4}
              placeholder="Describe item condition, key features, reasons for selling, warranty, etc. (min 10 characters)"
              value={form.description}
              onChange={handleChange('description')}
              onBlur={handleBlur('description')}
              className={`form-textarea ${errors.description ? 'form-input--error' : ''}`}
              aria-invalid={Boolean(errors.description)}
              maxLength={2000}
            />
            <div className="field-hint-row">
              {errors.description ? (
                <span className="field-error">{errors.description}</span>
              ) : (
                <span className="field-hint">Minimum 10 characters</span>
              )}
              <span className="char-count">{form.description.length}/2000</span>
            </div>
          </div>

          {/* Image URL */}
          <div className="form-group">
            <label htmlFor="field-image" className="form-label">
              Image URL <span className="optional-tag">(optional)</span>
            </label>
            <input
              id="field-image"
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={form.image}
              onChange={handleChange('image')}
              onBlur={handleBlur('image')}
              className={`form-input ${errors.image ? 'form-input--error' : ''}`}
            />
            {errors.image && <span className="field-error">{errors.image}</span>}
            {form.image && !errors.image && (
              <div className="image-preview-box">
                <span className="preview-label">Image Preview:</span>
                <img
                  src={form.image}
                  alt="Preview"
                  className="preview-thumbnail"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Specifications (Optional) */}
          <fieldset className="form-fieldset">
            <legend className="fieldset-legend">Product Specifications (Optional)</legend>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="field-specBrand" className="form-label">Brand</label>
                <input
                  id="field-specBrand"
                  type="text"
                  placeholder="e.g. Apple, Sony"
                  value={form.specBrand}
                  onChange={handleChange('specBrand')}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="field-specModel" className="form-label">Model</label>
                <input
                  id="field-specModel"
                  type="text"
                  placeholder="e.g. Pro 14, XM5"
                  value={form.specModel}
                  onChange={handleChange('specModel')}
                  className="form-input"
                />
              </div>
            </div>
          </fieldset>

          {/* Submit */}
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn--primary btn--full"
              disabled={submitting}
              id="publish-listing-btn"
            >
              {submitting ? (
                <>
                  <span className="btn-spinner" /> Publishing Listing...
                </>
              ) : (
                'Publish Listing'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
