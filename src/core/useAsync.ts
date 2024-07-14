import { useMemo, useState } from "react";
import { useFn } from "./useFn";

export function useAsync<A extends unknown[], R>(
  fn: (...args: A) => Promise<R>
) {
  const [data, setData] = useState<R | undefined>();
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const pass = useMemo(() => new Map<Promise<unknown>, boolean>(), []);

  const invoke = useFn((...args: A) => {
    setError(null);
    setLoading(true);

    const p = Promise.resolve()
      .then(() => fn(...args))
      .then(
        (res) => [null, res] as const,
        (err) => [err, undefined] as const
      )
      .then((jar) => {
        if (pass.get(p)) {
          const [error, data] = jar;
          setData(data);
          setError(error);
        }
        pass.delete(p);
        setLoading(false);
        return jar;
      });

    pass.set(p, true);

    const promise = p as typeof p & { abort: () => void };
    promise.abort = () => pass.set(p, false);

    return promise;
  });

  return {
    setData,
    setError,
    invoke,
    data,
    error,
    loading,
  };
}
