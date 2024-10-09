import { useMemo, useReducer } from "react";

const m = new WeakMap();

const observer = <T extends object>(init: T, callback: () => void): T => {
  return new Proxy<T>(init, {
    get(...args) {
      const value = Reflect.get(...args);
      if (value && typeof value == "object") {
        if (!m.has(value)) {
          m.set(value, observer(value as object, callback));
        }
        return m.get(value);
      }
      return value;
    },
    set(t, k, v, r) {
      if (Object.is(Reflect.get(t, k, r), v)) {
        return true;
      }
      const ok = Reflect.set(t, k, v, r)
      if (ok) {
        m.delete(t);
        callback();
      }
      return ok;
    },
  });
};

export const useReactive = <T extends object>(init: () => T): T => {
  const [, update] = useReducer(() => [], []);
  return useMemo(() => observer(init(), update), []);
};
