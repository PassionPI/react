import { shallowEqual } from "@passion_pi/fp";

export const { freeze, create, keys, is } = Object;

export const isFn = (fn: unknown): fn is Function => typeof fn == "function";

export const isObj = (x: unknown): x is object =>
  typeof x == "object" && x != null;

export const identify = <T>(x: T) => x;

export const shallowMemo = <T>() => {
  let old: T;
  return (val: T): T => {
    if (!shallowEqual(old, val)) {
      old = val;
    }
    return old;
  };
};
