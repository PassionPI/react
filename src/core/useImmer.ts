import { produce } from "immer";
import { useCallback, useState } from "react";
import { isFn } from "../util/is";

export function useImmer<T extends object>(init: T | (() => T)) {
  const [state, setState] = useState(init);
  const setImmerState = useCallback((patch: (draft: T) => void) => {
    const fn = isFn(patch) ? patch : () => {};
    setState(produce(fn) as (base: T) => T);
  }, []);
  return [state, setImmerState] as const;
}
