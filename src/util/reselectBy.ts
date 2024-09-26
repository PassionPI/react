export const reselect = <T, S extends Readonly<((input: T) => unknown)[]>, R>(
  getter: () => T,
  selectors: S,
  calc: (...args: { [Key in keyof S]: ReturnType<S[Key]> }) => R,
) => {
  type Args = { [Key in keyof S]: ReturnType<S[Key]> };

  let args = [] as Args;
  let result = null as R;

  return (): R => {
    const next = selectors.map((selector) => selector(getter())) as Args;
    if (next.some((arg, index) => !Object.is(arg, args[index]))) {
      args = next;
      result = calc(...next);
    }
    return result;
  };
};
