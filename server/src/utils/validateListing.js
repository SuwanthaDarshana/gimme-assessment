const ALLOWED_CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor'];

export function validateListing(payload) {
  const errors = [];
  if (!payload || typeof payload !== 'object') return ['Request body must be a JSON object'];

  const { title, category, price, condition, description } = payload;

  if (!title?.trim()) errors.push('title is required');
  else if (title.trim().length > 120) errors.push('title must be 120 characters or fewer');

  if (!category?.trim()) errors.push('category is required');

  if (price === undefined || price === null || price === '') errors.push('price is required');
  else if (typeof price !== 'number' || Number.isNaN(price) || price <= 0) errors.push('price must be a positive number');

  if (!condition || !ALLOWED_CONDITIONS.includes(condition)) {
    errors.push(`condition must be one of: ${ALLOWED_CONDITIONS.join(', ')}`);
  }

  if (!description || description.trim().length < 10) errors.push('description must be at least 10 characters');

  return errors;
}

export { ALLOWED_CONDITIONS };