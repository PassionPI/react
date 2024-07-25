import { useMemo, useReducer } from 'react';

const weak = new WeakMap();

const observer = <T extends object>(init: T, callback: () => void): T => {
  return new Proxy<T>(init, {
    get(...args) {
      const value = Reflect.get(...args);
      if (value && typeof value == 'object') {
        if (!weak.has(value)) {
          weak.set(value, observer(value as object, callback));
        }
        return weak.get(value);
      }
      return value;
    },
    set(target, ...rest) {
      const x = Reflect.set(target, ...rest);
      weak.delete(target);
      callback();
      return x;
    },
  });
};

export const useReactive = <T extends object>(init: () => T): T => {
  const [, update] = useReducer(() => [], []);
  return useMemo(() => observer(init(), update), []);
};
