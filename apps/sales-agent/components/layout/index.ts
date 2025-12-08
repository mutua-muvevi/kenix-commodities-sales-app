/**
 * Layout Components
 *
 * Barrel export for all layout components.
 * Provides consistent screen structure and safe area handling.
 *
 * Components:
 * - SafeArea: Safe area context wrapper with configurable edges
 * - Container: Flexible container with padding and centering
 * - ScreenWrapper: Complete screen layout with scroll, keyboard, refresh
 * - Header: Navigation header with back button and actions
 *
 * @example
 * import { ScreenWrapper, Header, Container } from '@/components/layout';
 */

export { SafeArea } from './SafeArea';
export type { SafeAreaProps } from './SafeArea';

export { Container } from './Container';
export type { ContainerProps } from './Container';

export { ScreenWrapper } from './ScreenWrapper';
export type { ScreenWrapperProps } from './ScreenWrapper';

export { Header } from './Header';
export type { HeaderProps } from './Header';
