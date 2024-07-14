export const { is, keys } = Object;

export function isFn(x: unknown): x is Function {
  return typeof x == "function";
}

export function isObj(x: unknown): x is object {
  return typeof x == "object" && x != null;
}
