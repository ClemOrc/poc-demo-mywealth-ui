/**
 * Application-wide constants
 * Centralizes all hardcoded values for better maintainability
 */

// UI Display Constants
export const EMPTY_FIELD_PLACEHOLDER = '-';
export const DEFAULT_CURRENCY = 'CAD';
export const DEFAULT_PAGE_SIZE = 10;

// Route Constants
export const ROUTES = {
  ROOT: '/',
  DASHBOARD: '/dashboard',
  AGREEMENTS: '/agreements',
  CREATE_AGREEMENT: '/agreements/create',
  AGREEMENT_DETAILS: (id: string) => `/agreements/${id}`,
  MODIFY_AGREEMENT: (id: string) => `/agreements/${id}/modify`,
  PENDING_MODIFICATIONS: '/pending-modifications',
} as const;

// Agreement Status Constants
export const AGREEMENT_STATUS = {
  DRAFT: 'DRAFT',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  ACTIVE: 'ACTIVE',
  TERMINATED: 'TERMINATED',
  EXPIRED: 'EXPIRED',
  SUSPENDED: 'SUSPENDED',
} as const;

export const AGREEMENT_STATUS_LABELS: Record<string, string> = {
  [AGREEMENT_STATUS.DRAFT]: 'Draft',
  [AGREEMENT_STATUS.PENDING_APPROVAL]: 'Pending Approval',
  [AGREEMENT_STATUS.ACTIVE]: 'Active',
  [AGREEMENT_STATUS.TERMINATED]: 'Terminated',
  [AGREEMENT_STATUS.EXPIRED]: 'Expired',
  [AGREEMENT_STATUS.SUSPENDED]: 'Suspended',
};

// Dashboard Tab Configuration
export const DASHBOARD_TABS = {
  PENDING: { value: 'PENDING_APPROVAL', label: 'Pending' },
  NEW: { value: 'NEW', label: 'New' },
  READY: { value: 'READY', label: 'Ready' },
  SENT: { value: 'SENT', label: 'Sent' },
  DELETED: { value: 'DELETED', label: 'Deleted' },
  DRAFTS: { value: 'DRAFT', label: 'Drafts' },
  ALL: { value: 'ALL', label: 'All' },
} as const;

// BNC Theme Colors - Red, Grey, White color scheme
export const COLORS = {
  // Primary BNC Red
  PRIMARY: '#D32F2F',  // BNC Red (primary/accent color)
  PRIMARY_LIGHT: '#EF5350',  // Lighter red for hover states
  PRIMARY_DARK: '#C62828',   // Darker red for emphasis
  
  // BNC Greys
  BACKGROUND_GRAY: '#F5F5F5',  // Light grey background
  BACKGROUND_LIGHT: '#FAFAFA', // Almost white background
  BORDER_GRAY: '#E0E0E0',      // Grey borders
  TEXT_SECONDARY: '#757575',   // Medium grey for secondary text
  TEXT_DARK: '#424242',        // Dark grey for primary text
  GREY_50: '#FAFAFA',
  GREY_100: '#F5F5F5',
  GREY_200: '#EEEEEE',
  GREY_300: '#E0E0E0',
  GREY_400: '#BDBDBD',
  GREY_500: '#9E9E9E',
  GREY_600: '#757575',
  GREY_700: '#616161',
  GREY_800: '#424242',
  GREY_900: '#212121',
  
  // Status Colors (using red/grey variants)
  ERROR: '#D32F2F',     // Red for errors
  SUCCESS: '#757575',   // Grey for success (neutral)
  WARNING: '#EF5350',   // Light red for warnings
  
  // Pure White
  WHITE: '#FFFFFF',
} as const;

// Form Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Invalid email address',
  INVALID_PHONE: 'Invalid phone number',
  INVALID_DATE: 'Invalid date format',
  MIN_LENGTH: (min: number) => `Must be at least ${min} characters`,
  MAX_LENGTH: (max: number) => `Must be at most ${max} characters`,
} as const;

// API Configuration
export const API_CONFIG = {
  DEFAULT_GRAPHQL_ENDPOINT: 'http://localhost:8080/graphql',
  REQUEST_TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
} as const;

// Date Format Constants
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  ISO: 'yyyy-MM-dd',
  FULL: 'MMMM dd, yyyy',
} as const;

// File Upload Constants
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ACCEPTED_TYPES: '.pdf,.doc,.docx,.xls,.xlsx',
  ACCEPTED_MIME_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
} as const;

// Notification Types
export const NOTIFICATION_TYPE = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;

// Agreement Types
export const AGREEMENT_TYPES = [
  'Wealth Management',
  'Investment Advisory',
  'Portfolio Management',
  'Financial Planning',
  'Asset Management',
  'Discretionary Management',
  'Advisory Services',
] as const;

// Wizard Step Names
export const WIZARD_STEPS = [
  'Client Details',
  'Investing Account',
  'Asset Allocation',
  'Billing Details',
  'Program Fees',
  'Documents',
  'Notes',
  'Review',
] as const;