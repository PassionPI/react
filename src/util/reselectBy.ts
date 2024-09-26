export const reselect = <T, S extends Readonly<((input: T) => unknown)[]>, R>(
  getter: () => T,
  selectors: S,
  calc: (...args: { [Key in keyof S]: ReturnType<S[Key]> }) => R,
) => {
  type Args = { [Key in keyof S]: ReturnType<S[Key]> };
  const last: { args: Args; result: R } = {
    args: [] as Args,
    result: null as R,
  };

  const getSnapshot = (): R => {
    const args = selectors.map((selector) => selector(getter())) as Args;
    if (args.some((arg, index) => !Object.is(arg, last.args[index]))) {
      last.args = args;
      last.result = calc(...args);
    }
    return last.result;
  };

  return getSnapshot;
};
