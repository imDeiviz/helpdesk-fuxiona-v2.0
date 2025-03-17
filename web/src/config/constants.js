// API Configuration
export const API_URL = process.env.VITE_API_URL || 'https://helpdesk-fuxiona-v2-0.onrender.com';

// Office Options
export const OFFICE_OPTIONS = [
  { value: 'Malaga', label: 'Málaga' },
  { value: 'Marbella', label: 'Marbella' },

  { value: 'Fuengirola', label: 'Fuengirola' }
];

// Priority Options
export const PRIORITY_OPTIONS = [
  { value: 'Baja', label: 'Baja', color: 'success' },
  { value: 'Media', label: 'Media', color: 'warning' },
  { value: 'Alta', label: 'Alta', color: 'danger' }
];

// Role Options
export const ROLE_OPTIONS = [
  { value: 'user', label: 'Usuario' },
  { value: 'admin', label: 'Administrador' },
  { value: 'tecnico', label: 'Técnico' }
];

// File Extensions
export const ALLOWED_FILE_EXTENSIONS = [
  'jpg', 'jpeg', 'png', 'gif', 'mp4', 'pdf', 
  'doc', 'docx', 'xls', 'xlsx', 'txt', 'zip', 'rar'
];

// Max File Size (in bytes) - 10MB
export const MAX_FILE_SIZE = 10 * 1024 * 1024;
