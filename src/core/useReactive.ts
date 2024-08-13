import { useMemo, useReducer } from "react";

const map = new WeakMap();

const observer = <T extends object>(init: T, callback: () => void): T => {
  return new Proxy<T>(init, {
    get(...args) {
      const value = Reflect.get(...args);
      if (value && typeof value == "object") {
        if (!map.has(value)) {
          map.set(value, observer(value as object, callback));
        }
        return map.get(value);
      }
      return value;
    },
    set(target, k, v, receiver) {
      const o = Reflect.get(target, k, receiver);
      if (Object.is(o, v)) {
        return true;
      }
      const x = Reflect.set(target, k, v, receiver);
      if (x) {
        map.delete(target);
        callback();
      }
      return x;
    },
  });
};

export const useReactive = <T extends object>(init: () => T): T => {
  const [, update] = useReducer(() => [], []);
  return useMemo(() => observer(init(), update), []);
};
