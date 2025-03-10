 // Configuración de la API

export const API_URL = 'http://localhost:3000/api/v1';

 // Oficina
export const OFFICE_OPTIONS = [
  { value: 'Malaga', label: 'Málaga' },
  { value: 'El Palo', label: 'El Palo' },
  { value: 'Fuengirola', label: 'Fuengirola' }
];

 // Prioridad
export const PRIORITY_OPTIONS = [
  { value: 'Baja', label: 'Baja', color: 'success' },
  { value: 'Media', label: 'Media', color: 'warning' },
  { value: 'Alta', label: 'Alta', color: 'danger' }
];

 // Rol
export const ROLE_OPTIONS = [
  { value: 'user', label: 'Usuario' },
  { value: 'admin', label: 'Administrador' },
  { value: 'tecnico', label: 'Técnico' }
];

 // Extensiones de archivo
export const ALLOWED_FILE_EXTENSIONS = [
  'jpg', 'jpeg', 'png', 'gif', 'mp4', 'pdf', 
  'doc', 'docx', 'xls', 'xlsx', 'txt', 'zip', 'rar'
];

 // Tamaño máximo del archivo - 10MB
export const MAX_FILE_SIZE = 10 * 1024 * 1024;