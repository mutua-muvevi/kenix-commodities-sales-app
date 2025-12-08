/**
 * Zustand Logger Middleware
 * Logs state changes in development mode for debugging
 */

import { StateCreator, StoreMutatorIdentifier } from 'zustand';

type Logger = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  f: StateCreator<T, Mps, Mcs>,
  name?: string
) => StateCreator<T, Mps, Mcs>;

type LoggerImpl = <T>(
  f: StateCreator<T, [], []>,
  name?: string
) => StateCreator<T, [], []>;

const loggerImpl: LoggerImpl = (f, name) => (set, get, store) => {
  const loggedSet: typeof set = (...args) => {
    const prevState = get();
    set(...args);
    const nextState = get();

    if (__DEV__) {
      console.group(`🔵 ${name || 'Store'} Update`);
      console.log('Previous State:', prevState);
      console.log('Next State:', nextState);
      console.groupEnd();
    }
  };

  return f(loggedSet, get, store);
};

export const logger = loggerImpl as Logger;

/**
 * Conditional logger - only logs in development mode
 */
export const conditionalLogger = <T,>(
  config: StateCreator<T, [], []>,
  name?: string
): StateCreator<T, [], []> => {
  if (__DEV__) {
    return logger(config, name);
  }
  return config;
};

/**
 * Action logger - logs only when specific actions are called
 */
export const actionLogger = (storeName: string, actionName: string, ...args: any[]) => {
  if (__DEV__) {
    console.log(`🎬 [${storeName}] ${actionName}`, ...args);
  }
};

/**
 * Error logger for store operations
 */
export const errorLogger = (storeName: string, actionName: string, error: any) => {
  console.error(`❌ [${storeName}] ${actionName} failed:`, error);
};
