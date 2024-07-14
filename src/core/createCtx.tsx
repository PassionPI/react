import React, {
  createContext,
  memo,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import { isFn } from "../util/is";
import { reselectBy } from "../util/reselectBy";
import { shallowEqual } from "../util/shallowEqual";

export function createCtx<T extends object = object, P extends object = object>(
  useHooks: (props?: P) => T
) {
  type Callback = () => void;
  const initCtx = () => ({} as T);
  const initDep = () => {
    const fns = new Set<Callback>();
    return {
      sub: (fn: Callback) => (fns.add(fn), () => fns.delete(fn)),
      emit: () => fns.forEach((fn) => fn()),
    };
  };

  const Ctx = createContext({ current: initCtx() });
  const Dep = createContext({ current: initDep() });

  const Publish = memo((props?: P) => {
    const dep = useContext(Dep);
    const ctx = useContext(Ctx);
    const val = useHooks(props);
    useLayoutEffect(dep.current.emit, [(ctx.current = val)]);
    return null;
  });

  function useReselect<S extends readonly ((input: T) => unknown)[], R>(
    selectors: S,
    calc: (...args: { [Key in keyof S]: ReturnType<S[Key]> }) => R
  ) {
    const dep = useContext(Dep);
    const ctx = useContext(Ctx);
    const reselect = useMemo(() => reselectBy(() => ctx.current), []);
    const getSnapshot = reselect(selectors, calc);
    return useSyncExternalStore(dep.current.sub, getSnapshot);
  }

  function useCtx(): T;
  function useCtx<R>(selector: (state: T) => R): R;
  function useCtx<R>(selector?: (state: T) => R) {
    const old = useRef<T | R>({} as T);
    const dep = useContext(Dep);
    const ctx = useContext(Ctx);
    const getSnapshot = () => {
      const x = isFn(selector) ? selector(ctx.current) : ctx.current;
      if (!shallowEqual(old.current, x)) {
        old.current = x;
      }
      return old.current;
    };
    return useSyncExternalStore(dep.current.sub, getSnapshot);
  }

  function provider<Props extends object>(
    component: React.ComponentType<Props>
  ): React.ComponentType<Props>;
  function provider<Props extends object>(config: {
    connect: (props: Props) => P;
    component: React.ComponentType<Props>;
  }): React.ComponentType<Props>;
  function provider<Props extends object>(
    config:
      | { connect: (props: Props) => P; component: React.ComponentType<Props> }
      | React.ComponentType<Props>
  ): React.ComponentType<Props> {
    const [connect, Component] = isFn(config)
      ? [null, config]
      : [config.connect, config.component];

    return (props: Props) => {
      const refDep = useRef(useMemo(initDep, []));
      const refCtx = useRef(useMemo(initCtx, []));
      return (
        <Dep.Provider value={refDep}>
          <Ctx.Provider value={refCtx}>
            <Publish {...(connect?.(props) as P)} />
            <Component {...props} />
          </Ctx.Provider>
        </Dep.Provider>
      );
    };
  }

  return { useReselect, useCtx, provider };
}
