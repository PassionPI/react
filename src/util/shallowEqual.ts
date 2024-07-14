import { is, isObj, keys } from "./is";

export function shallowEqual(o1: unknown, o2: unknown) {
  if (is(o1, o2)) {
    return true;
  }
  if (!isObj(o1) || !isObj(o2)) {
    return false;
  }
  const ok = keys(o1) as (keyof typeof o1)[];
  if (ok.length != keys(o2).length) {
    return false;
  }
  for (const key of ok) {
    if (!is(o1[key], o2[key])) {
      return false;
    }
  }
  return true;
}
