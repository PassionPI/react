import { useCallback, useRef } from "react";

export function useFn<F extends Function>(fn: F): F {
  const ref = useRef<F>();
  ref.current = fn;
  const _fn = ((...args: any[]) => ref.current?.(...args)) as unknown as F;
  return useCallback<F>(_fn, []);
}
