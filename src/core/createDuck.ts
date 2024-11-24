import { identify, isFn, shallowMemo } from "@/util/object";
import {
  Calculator,
  createDuck,
  pipe,
  ReadonlySelector,
  ReadonlySelectorReturn,
  reselect,
} from "@passion_pi/fp";
import { produce } from "immer";
import { useMemo, useSyncExternalStore } from "react";

function immerAtom<T>(init: () => T) {
  const instance = createDuck(init);

  return {
    ...instance,
    set(setter: T | ((val: T) => T | void)) {
      instance.set((old) => {
        return isFn(setter) ? produce(old, setter) : setter;
      });
    },
  };
}

export function duck<T>(init: () => T) {
  const instance = immerAtom(init);

  function useSelector<R>(selector: (state: T) => R): R {
    return useSyncExternalStore(instance.listen, pipe(instance.get, selector));
  }

  function useReselect<S extends ReadonlySelector<T>, R>(
    selectors: S,
    calc: Calculator<T, S, R>
  ): R {
    return useSelector(useMemo(() => reselect(selectors, calc), []));
  }

  function useShallow(): T;
  function useShallow<R>(selector?: (state: T) => R): R;
  function useShallow<R>(selector?: (state: T) => R): T | R {
    const shallow = useMemo(shallowMemo<T | R>, []);
    return useSelector(pipe(selector || identify, shallow));
  }

  return { ...instance, useReselect, useShallow };
}

type Duck<T> = ReturnType<typeof duck<T>>;

export type { Calculator, Duck, ReadonlySelector, ReadonlySelectorReturn };
