import { useMemo, useRef, useState } from "react";

const ob = <T extends object>(init: T, callback: () => void): T => {
  return new Proxy<T>(init, {
    get(...args) {
      const x = Reflect.get(...args);
      return x && typeof x == "object" ? ob(x as T, callback) : x;
    },
    set(...args) {
      const b = Reflect.set(...args);
      callback();
      return b;
    },
  });
};

const useMemoRef = <T>(init: () => T) => useRef(useMemo(init, []));

export const useReactive = <T extends object>(init: () => T): T => {
  const [, update] = useState([]);
  const a = useMemoRef(init);
  const b = useMemoRef(() => ob(a.current, () => update([])));
  return b.current;
};
