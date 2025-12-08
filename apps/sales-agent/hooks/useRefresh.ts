import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * useRefresh Hook
 *
 * Manages pull-to-refresh state for RefreshControl components.
 * Handles loading state and error handling for refresh operations.
 *
 * @param onRefresh - Async function to execute on refresh
 * @returns Refresh state and handler
 *
 * @example
 * const { refreshing, handleRefresh } = useRefresh(async () => {
 *   await fetchRoutes();
 * });
 *
 * <ScrollView
 *   refreshControl={
 *     <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
 *   }
 * >
 *   {content}
 * </ScrollView>
 */
export const useRefresh = (onRefresh: () => Promise<void>) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh]);

  return { refreshing, handleRefresh };
};

/**
 * useAsyncData Hook
 *
 * Comprehensive hook for managing async data fetching with loading, error, and refresh states.
 * Provides automatic initial load and manual refresh capability.
 *
 * @param fetchFn - Async function that fetches data
 * @param initialData - Initial data value
 * @param options - Configuration options
 * @returns Data state and control functions
 *
 * @example
 * const { data, isLoading, error, refresh } = useAsyncData(
 *   async () => await api.getRoutes(),
 *   [],
 *   { autoLoad: true }
 * );
 *
 * if (isLoading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage error={error} />;
 * return <RouteList routes={data} />;
 */
export const useAsyncData = <T>(
  fetchFn: () => Promise<T>,
  initialData: T,
  options?: {
    autoLoad?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  }
) => {
  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { autoLoad = true, onSuccess, onError } = options || {};

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred while loading data';
      setError(errorMessage);
      if (onError) {
        onError(err);
      }
      console.error('useAsyncData load error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, onSuccess, onError]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred while refreshing data';
      setError(errorMessage);
      if (onError) {
        onError(err);
      }
      console.error('useAsyncData refresh error:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchFn, onSuccess, onError]);

  const retry = useCallback(async () => {
    await load();
  }, [load]);

  useEffect(() => {
    if (autoLoad) {
      load();
    }
  }, [autoLoad]); // Only run on mount if autoLoad is true

  return {
    data,
    setData,
    isLoading,
    error,
    isRefreshing,
    load,
    refresh,
    retry,
  };
};

/**
 * usePaginatedData Hook
 *
 * Manages paginated data fetching with infinite scroll support.
 * Handles loading more data, refreshing, and error states.
 *
 * @param fetchFn - Async function that fetches paginated data
 * @param options - Configuration options
 * @returns Paginated data state and control functions
 *
 * @example
 * const {
 *   data,
 *   isLoading,
 *   loadMore,
 *   hasMore,
 *   refresh
 * } = usePaginatedData(
 *   async (page) => await api.getOrders(page),
 *   { pageSize: 20 }
 * );
 *
 * <FlatList
 *   data={data}
 *   onEndReached={loadMore}
 *   onEndReachedThreshold={0.5}
 *   refreshing={isRefreshing}
 *   onRefresh={refresh}
 * />
 */
export const usePaginatedData = <T>(
  fetchFn: (page: number, pageSize: number) => Promise<T[]>,
  options?: {
    pageSize?: number;
    autoLoad?: boolean;
    onSuccess?: (data: T[]) => void;
    onError?: (error: Error) => void;
  }
) => {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { pageSize = 20, autoLoad = true, onSuccess, onError } = options || {};
  const isInitialMount = useRef(true);

  const load = useCallback(async (pageNum: number, append: boolean = false) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const result = await fetchFn(pageNum, pageSize);

      if (append) {
        setData(prev => [...prev, ...result]);
      } else {
        setData(result);
      }

      // If we received fewer items than pageSize, we've reached the end
      setHasMore(result.length >= pageSize);
      setPage(pageNum);

      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred while loading data';
      setError(errorMessage);
      if (onError) {
        onError(err);
      }
      console.error('usePaginatedData load error:', err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [fetchFn, pageSize, onSuccess, onError]);

  const loadMore = useCallback(async () => {
    if (!isLoadingMore && !isLoading && hasMore) {
      await load(page + 1, true);
    }
  }, [isLoadingMore, isLoading, hasMore, page, load]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    setHasMore(true);
    try {
      await load(1, false);
    } finally {
      setIsRefreshing(false);
    }
  }, [load]);

  useEffect(() => {
    if (autoLoad && isInitialMount.current) {
      isInitialMount.current = false;
      load(1, false);
    }
  }, [autoLoad]); // Only run on mount if autoLoad is true

  return {
    data,
    isLoading,
    isLoadingMore,
    isRefreshing,
    error,
    hasMore,
    page,
    loadMore,
    refresh,
    setData,
  };
};

/**
 * usePolling Hook
 *
 * Polls an async function at regular intervals.
 * Useful for real-time data updates (e.g., order status, route updates).
 *
 * @param fetchFn - Async function to poll
 * @param interval - Polling interval in milliseconds (default: 5000ms)
 * @param options - Configuration options
 * @returns Polling state and control functions
 *
 * @example
 * const { data, isPolling, startPolling, stopPolling } = usePolling(
 *   async () => await api.getOrderStatus(orderId),
 *   3000,
 *   { autoStart: true }
 * );
 */
export const usePolling = <T>(
  fetchFn: () => Promise<T>,
  interval: number = 5000,
  options?: {
    autoStart?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  }
) => {
  const [data, setData] = useState<T | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { autoStart = false, onSuccess, onError } = options || {};
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const poll = useCallback(async () => {
    try {
      const result = await fetchFn();
      setData(result);
      setError(null);
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Polling error occurred';
      setError(errorMessage);
      if (onError) {
        onError(err);
      }
      console.error('usePolling error:', err);
    }
  }, [fetchFn, onSuccess, onError]);

  const startPolling = useCallback(() => {
    if (!isPolling) {
      setIsPolling(true);
      poll(); // Initial poll
      intervalRef.current = setInterval(poll, interval);
    }
  }, [isPolling, poll, interval]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  useEffect(() => {
    if (autoStart) {
      startPolling();
    }

    return () => {
      stopPolling();
    };
  }, [autoStart]); // Only run on mount if autoStart is true

  return {
    data,
    isPolling,
    error,
    startPolling,
    stopPolling,
    setData,
  };
};
