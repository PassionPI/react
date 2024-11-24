import { useCallback, useRef } from "react";

type Fn<A extends unknown[], R> = (...args: A) => R;

export function useFn<A extends unknown[], R>(fn: Fn<A, R>): Fn<A, R> {
  const ref = useRef<Fn<A, R>>();
  ref.current = fn;
  return useCallback((...args: A) => ref.current?.(...args)!, []);
}
