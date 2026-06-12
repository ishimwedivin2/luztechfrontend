const API_ORIGIN = 'http://localhost:8080';

export const resolveImageUrl = (image) => {
  if (!image) return null;

  const path = typeof image === 'string' ? image : image.url;
  if (!path) return null;

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  return `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
};

export const resolveProductImage = (product) => resolveImageUrl(product?.images?.[0]);
