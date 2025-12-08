/**
 * Components Index
 *
 * Barrel export for all reusable components in the Sales Agent App.
 * Provides centralized access to all components across the application.
 *
 * @example
 * import { ScreenWrapper, SafeArea, LocationPicker } from '@/components';
 */

// Layout Components
export {
  SafeArea,
  Container,
  ScreenWrapper,
  Header,
} from './layout';

export type {
  SafeAreaProps,
  ContainerProps,
  ScreenWrapperProps,
  HeaderProps,
} from './layout';

// Feature Components
export { LocationPicker } from './LocationPicker';
export { ShopPhotoCapture } from './ShopPhotoCapture';
