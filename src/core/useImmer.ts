import { isFn } from "@/util/object";
import { produce } from "immer";
import { useCallback, useState } from "react";

export function useImmer<T extends object>(init: T | (() => T)) {
  const [state, setState] = useState(init);
  const setImmerState = useCallback((patch: (draft: T) => void) => {
    if (isFn(patch)) {
      setState((base) => produce(base, patch));
    }
  }, []);
  return [state, setImmerState] as const;
}
