export const ALLOWED_CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor'];

export const ALLOWED_CATEGORIES = [
  'Electronics',
  'Furniture',
  'Vehicles',
  'Fashion',
  'Home & Garden',
  'Sports',
];

/**
 * Validates a listing payload for creation / updates.
 * Returns an array of error message strings. If empty, payload is valid.
 */
export function validateListing(payload) {
  const errors = [];

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return ['Request body must be a JSON object'];
  }

  const { title, category, price, condition, description, image } = payload;

  // Title validation
  if (!title || typeof title !== 'string' || !title.trim()) {
    errors.push('Title is required');
  } else if (title.trim().length > 120) {
    errors.push('Title must be 120 characters or fewer');
  }

  // Category validation
  if (!category || typeof category !== 'string' || !category.trim()) {
    errors.push('Category is required');
  } else if (!ALLOWED_CATEGORIES.includes(category.trim())) {
    errors.push(`Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}`);
  }

  // Price validation
  if (price === undefined || price === null || price === '') {
    errors.push('Price is required');
  } else {
    const numPrice = Number(price);
    if (typeof numPrice !== 'number' || Number.isNaN(numPrice) || numPrice <= 0) {
      errors.push('Price must be a positive number');
    }
  }

  // Condition validation
  if (!condition || typeof condition !== 'string') {
    errors.push('Condition is required');
  } else if (!ALLOWED_CONDITIONS.includes(condition)) {
    errors.push(`Condition must be one of: ${ALLOWED_CONDITIONS.join(', ')}`);
  }

  // Description validation
  if (!description || typeof description !== 'string' || !description.trim()) {
    errors.push('Description is required');
  } else if (description.trim().length < 10) {
    errors.push('Description must be at least 10 characters');
  } else if (description.trim().length > 2000) {
    errors.push('Description must not exceed 2000 characters');
  }

  // Optional image validation
  if (image !== undefined && image !== null && image !== '') {
    if (typeof image !== 'string') {
      errors.push('Image must be a valid URL string');
    } else {
      try {
        const parsedUrl = new URL(image.trim());
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
          errors.push('Image URL must use http or https protocol');
        }
      } catch {
        errors.push('Image must be a valid URL');
      }
    }
  }

  return errors;
}
