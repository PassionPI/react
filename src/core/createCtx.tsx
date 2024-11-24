import { Calculator, pipe, ReadonlySelector, reselect } from "@passion_pi/fp";
import React, {
  createContext,
  memo,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import { identify, shallowMemo } from "../util/object";

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

  function useSelector<R>(selector: (state: T) => R): R {
    const dep = useContext(Dep);
    const ctx = useContext(Ctx);
    return useSyncExternalStore(dep.current.sub, () => selector(ctx.current));
  }

  function useReselect<S extends ReadonlySelector<T>, R>(
    selectors: S,
    calc: Calculator<T, S, R>
  ) {
    return useSelector(useMemo(() => reselect(selectors, calc), []));
  }

  function useShallow(): T;
  function useShallow<R>(selector: (state: T) => R): R;
  function useShallow<R>(selector?: (state: T) => R) {
    const shallow = useMemo(shallowMemo<T | R>, []);
    return useSelector(pipe(selector || identify, shallow));
  }

  function provider<Props extends object>(config: {
    connect?: (props: Props) => P;
    component: React.ComponentType<Props>;
  }): React.ComponentType<Props> {
    const connect = config.connect;
    const Component = config.component;

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

  return { useSelector, useReselect, useShallow, provider };
}
