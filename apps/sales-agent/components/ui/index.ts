/**
 * UI Components Barrel Export
 *
 * This file exports all reusable UI components for the Sales Agent App.
 * Import components from this file for cleaner imports:
 *
 * @example
 * ```tsx
 * import { Button, Input, Card, Badge } from '@/components/ui';
 * ```
 */

// Button Component
export { Button } from './Button';
export type { ButtonProps } from './Button';

// Input Component
export { Input } from './Input';
export type { InputProps } from './Input';

// Card Component
export { Card } from './Card';
export type { CardProps } from './Card';

// Badge Component
export { Badge } from './Badge';
export type { BadgeProps } from './Badge';

// StatusBadge Component
export { StatusBadge } from './StatusBadge';
export type { StatusBadgeProps, BadgeStatus } from './StatusBadge';

// EmptyState Component
export { EmptyState } from './EmptyState';
export type { EmptyStateProps } from './EmptyState';

// LoadingSpinner Component
export { LoadingSpinner } from './LoadingSpinner';
export type { LoadingSpinnerProps } from './LoadingSpinner';

// Avatar Component
export { Avatar } from './Avatar';
export type { AvatarProps } from './Avatar';

// SearchBar Component
export { SearchBar } from './SearchBar';

// DataSourceIndicator Component
export { DataSourceIndicator } from './DataSourceIndicator';

// FloatingCartButton Component
export { FloatingCartButton } from './FloatingCartButton';

/**
 * Default export object containing all components
 */
export default {
  Button,
  Input,
  Card,
  Badge,
  StatusBadge,
  EmptyState,
  LoadingSpinner,
  Avatar,
  SearchBar,
  DataSourceIndicator,
  FloatingCartButton,
};
