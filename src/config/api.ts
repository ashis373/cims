export const API_BASE_URL = 
  import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.MODE === 'production' ? '/dev/cims/api' : 'http://localhost/full-cims/api');

export const UPLOADS_BASE_URL = 
  import.meta.env.MODE === 'production' 
    ? 'https://demo.hexalearn.com/dev/cims/uploads' 
    : 'http://localhost/full-cims/uploads';

/**
 * Helper to build a clean absolute URL for any candidate/profile image or document
 */
export function getUploadUrl(path: string | undefined | null): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  
  // Clean relative path indicators like "../../uploads/" or "../uploads/" or "uploads/"
  let cleanPath = path.replace(/^(\.\.\/)+/, '').replace(/^uploads\//, '');
  if (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.substring(1);
  }
  return `${UPLOADS_BASE_URL}/${cleanPath}`;
}
