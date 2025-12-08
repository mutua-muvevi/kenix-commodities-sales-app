/**
 * Formatters Utility
 * Formatting functions for currency, dates, distances, phone numbers, etc.
 */

import { CONFIG } from '../constants/config';

/**
 * Format number as Kenyan currency
 * @param amount - The amount to format
 * @param includeDecimals - Whether to include decimal places (default: false)
 * @returns Formatted currency string (e.g., "KES 1,234")
 */
export const formatCurrency = (amount: number, includeDecimals = false): string => {
  if (amount === null || amount === undefined || isNaN(amount)) return 'KES 0';

  const options: Intl.NumberFormatOptions = {
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  };

  return `${CONFIG.CURRENCY} ${amount.toLocaleString(CONFIG.CURRENCY_LOCALE, options)}`;
};

/**
 * Format number as short currency (K, M, B)
 * @param amount - The amount to format
 * @returns Formatted short currency string (e.g., "KES 1.2K")
 */
export const formatShortCurrency = (amount: number): string => {
  if (amount === null || amount === undefined || isNaN(amount)) return 'KES 0';

  const absAmount = Math.abs(amount);
  let value: number;
  let suffix: string;

  if (absAmount >= 1_000_000_000) {
    value = amount / 1_000_000_000;
    suffix = 'B';
  } else if (absAmount >= 1_000_000) {
    value = amount / 1_000_000;
    suffix = 'M';
  } else if (absAmount >= 1_000) {
    value = amount / 1_000;
    suffix = 'K';
  } else {
    return formatCurrency(amount);
  }

  return `${CONFIG.CURRENCY} ${value.toFixed(1)}${suffix}`;
};

/**
 * Format date to localized string
 * @param date - Date string or Date object
 * @returns Formatted date string (e.g., "15 Jan 2025")
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '-';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '-';

    return dateObj.toLocaleDateString(CONFIG.CURRENCY_LOCALE, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
};

/**
 * Format time to localized string
 * @param date - Date string or Date object
 * @returns Formatted time string (e.g., "14:30")
 */
export const formatTime = (date: string | Date | null | undefined): string => {
  if (!date) return '-';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '-';

    return dateObj.toLocaleTimeString(CONFIG.CURRENCY_LOCALE, {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return '-';
  }
};

/**
 * Format date and time to localized string
 * @param date - Date string or Date object
 * @returns Formatted datetime string (e.g., "15 Jan 2025 14:30")
 */
export const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return '-';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '-';

    return `${formatDate(dateObj)} ${formatTime(dateObj)}`;
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return '-';
  }
};

/**
 * Format date to relative time (e.g., "2 hours ago", "yesterday")
 * @param date - Date string or Date object
 * @returns Relative time string
 */
export const formatRelativeTime = (date: string | Date | null | undefined): string => {
  if (!date) return '-';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '-';

    const now = new Date();
    const diff = now.getTime() - dateObj.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
    return `${years} year${years > 1 ? 's' : ''} ago`;
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return '-';
  }
};

/**
 * Format distance in meters/kilometers
 * @param meters - Distance in meters
 * @returns Formatted distance string (e.g., "1.2 km" or "350 m")
 */
export const formatDistance = (meters: number | null | undefined): string => {
  if (meters === null || meters === undefined || isNaN(meters)) return '-';

  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }

  const km = meters / 1000;
  return `${km.toFixed(1)} km`;
};

/**
 * Format duration in minutes/hours
 * @param minutes - Duration in minutes
 * @returns Formatted duration string (e.g., "2h 30m" or "45 min")
 */
export const formatDuration = (minutes: number | null | undefined): string => {
  if (minutes === null || minutes === undefined || isNaN(minutes)) return '-';

  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);

  if (mins === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}m`;
};

/**
 * Format phone number to readable format
 * @param phone - Phone number string
 * @returns Formatted phone number (e.g., "+254 712 345 678")
 */
export const formatPhoneNumber = (phone: string | null | undefined): string => {
  if (!phone) return '-';

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Format +254XXXXXXXXX to +254 712 345 678
  if (cleaned.length === 12 && cleaned.startsWith('254')) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  }

  // Format 0712345678 to 0712 345 678
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }

  return phone;
};

/**
 * Format percentage
 * @param value - Decimal value (0-1) or percentage value (0-100)
 * @param isDecimal - Whether input is decimal (default: true)
 * @returns Formatted percentage string (e.g., "75%")
 */
export const formatPercentage = (
  value: number | null | undefined,
  isDecimal = true
): string => {
  if (value === null || value === undefined || isNaN(value)) return '0%';

  const percentage = isDecimal ? value * 100 : value;
  return `${Math.round(percentage)}%`;
};

/**
 * Format order ID to short readable format
 * @param id - Order ID string
 * @returns Formatted order ID (e.g., "#ABC123")
 */
export const formatOrderId = (id: string | null | undefined): string => {
  if (!id) return '-';
  return `#${id.slice(-6).toUpperCase()}`;
};

/**
 * Format number with thousand separators
 * @param num - Number to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted number string (e.g., "1,234,567")
 */
export const formatNumber = (num: number | null | undefined, decimals = 0): string => {
  if (num === null || num === undefined || isNaN(num)) return '0';

  return num.toLocaleString(CONFIG.CURRENCY_LOCALE, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Format file size
 * @param bytes - File size in bytes
 * @returns Formatted file size string (e.g., "1.2 MB")
 */
export const formatFileSize = (bytes: number | null | undefined): string => {
  if (bytes === null || bytes === undefined || isNaN(bytes) || bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Capitalize first letter of string
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export const capitalize = (str: string | null | undefined): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Truncate string with ellipsis
 * @param str - String to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated string
 */
export const truncate = (str: string | null | undefined, maxLength = 50): string => {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
};

/**
 * Format name (capitalize each word)
 * @param name - Name to format
 * @returns Formatted name
 */
export const formatName = (name: string | null | undefined): string => {
  if (!name) return '';
  return name
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
};

/**
 * Format commission amount with percentage
 * @param amount - Order amount
 * @param rate - Commission rate (decimal)
 * @returns Formatted commission string
 */
export const formatCommission = (amount: number, rate: number = CONFIG.COMMISSION_RATE): string => {
  const commission = amount * rate;
  return `${formatCurrency(commission)} (${formatPercentage(rate)})`;
};

export default {
  formatCurrency,
  formatShortCurrency,
  formatDate,
  formatTime,
  formatDateTime,
  formatRelativeTime,
  formatDistance,
  formatDuration,
  formatPhoneNumber,
  formatPercentage,
  formatOrderId,
  formatNumber,
  formatFileSize,
  capitalize,
  truncate,
  formatName,
  formatCommission,
};
