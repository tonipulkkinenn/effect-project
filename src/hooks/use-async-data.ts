import { useRef, useState, useCallback, useEffect } from "react";

type AsyncFunction<T> = (...args: unknown[]) => Promise<T>;

type PromiseResult<T> = Awaited<ReturnType<AsyncFunction<T>>>;

/**
 * Options for useAsyncData hook
 *
 * @param deps list of possible dependencies to getter that should trigger a reload. If left undefined, fetch data launches only once.
 * @param enabled If set to false, the data is not loaded.
 */
type UseAsyncDataOptions = {
  deps?: unknown[];
  enabled?: boolean;
};

/**
 * Context returned from useAsyncData hook
 *
 * @param data Resulting data. Undefined when data has not yet been fetched or when error happened during fetch.
 * @param isLoading Indicates whether data is loading.
 * @param isSuccess Indicates whether last fetch was successful. Undefined when fetch has not yet been performed.
 * @param isError Indicates whether error happened during data fetching. Undefined when fetch has not yet been performed.
 * @param error Contains possible error from fetcher method
 * @param reset Function that resets the hook state. Useful e.g. when view is needed to reset.
 * @param refetch Function that calls the fetcher again. Useful when manual update to data is needed without a change in the dependencies.
 */
type UseAsyncDataContext<T> = {
  data: T | undefined;
  isLoading: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  error: unknown;
  reset: () => void;
  refetch: () => void;
};

/**
 * See if dependencies have changed by shallow comparing previous and current dependency arrays
 */
const depsChanged = (prevDeps: unknown[], deps: unknown[]) => {
  if (!(prevDeps || deps)) return false;
  if (!(prevDeps && deps)) return true;
  return prevDeps.some((dep, index) => deps[index] !== dep);
};

/**
 * Hook to ease state handling when using asynchronous data
 *
 * @param fetcher Fetcher for async data
 * @param options Options that define how and when the data is fetched
 * @returns {UseAsyncDataContext} Context containing async data and metadata and actions related to it
 */
export const useAsyncData = <T>(
  fetcher: AsyncFunction<T>,
  { enabled, deps }: UseAsyncDataOptions = {}
): UseAsyncDataContext<T> => {
  // These need to be refs to avoid circular update loops
  const prevDeps = useRef(deps || []);
  const fetcherRef = useRef(fetcher);

  // Needed to see whether fetch needs to be done even when deps are not defined
  const firstRenderRef = useRef(true);

  const [data, setData] = useState<PromiseResult<T>>();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState<boolean>();
  const [isError, setIsError] = useState<boolean>();
  const [error, setError] = useState<unknown>();

  const fetchData = useCallback(async () => {
    setIsLoading(true);

    try {
      setData(await fetcherRef.current());
      setIsSuccess(true);
      setIsError(false);
      setError(undefined);
    } catch (e) {
      setIsSuccess(false);
      setIsError(true);
      setError(e);
      setData(undefined);
    }

    setIsLoading(false);
  }, []);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const reset = useCallback(() => {
    setData(undefined);
    setError(undefined);
    setIsSuccess(undefined);
    setIsError(undefined);
  }, []);

  // First, set fetcher reference up to date after first render
  useEffect(() => {
    if (!firstRenderRef.current) {
      fetcherRef.current = fetcher;
    }
  });

  // Next, check whether to fetch again
  useEffect(() => {
    if (enabled === false) return;

    const needsRefetch = deps && depsChanged(prevDeps.current, deps);
    if (!(firstRenderRef.current || needsRefetch)) return;

    fetchData();
  }, [enabled, fetchData, deps]);

  // Lastly, set prev deps up to date
  useEffect(() => {
    prevDeps.current = deps || [];
  });

  // In addition, set the first render ref to false after the first render
  useEffect(() => {
    firstRenderRef.current = false;
  }, []);

  return {
    isLoading: isLoading,
    isSuccess: isSuccess,
    isError: isError,
    data: data,
    error: error,
    refetch: refetch,
    reset: reset
  };
};