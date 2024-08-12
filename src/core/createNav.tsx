import { memo, useEffect, useSyncExternalStore } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  type Location,
  type NavigateOptions,
  type Params,
  type To,
} from "react-router-dom";

type VoidFn = () => void;
type Update = { location: Location; params: Readonly<Params<string>> };
type Navigate = (to: To, options?: NavigateOptions) => void;
type Listener = (update: Update) => void;
type Snapshot = undefined | Parameters<Navigate>;

type Nav = {
  listen: (listener: Listener) => VoidFn;
  go: Navigate;
};

export const createNav = () => {
  const ref: {
    snapshot: Snapshot;
    listeners: Set<Listener>;
    subscribes: Set<VoidFn>;
  } = {
    snapshot: undefined,
    listeners: new Set(),
    subscribes: new Set(),
  };

  const fx: {
    subscribe: (x: VoidFn) => VoidFn;
    snapshot: () => Snapshot;
  } = {
    subscribe(subscribe) {
      ref.subscribes.add(subscribe);
      return () => ref.subscribes.delete(subscribe);
    },
    snapshot() {
      return ref.snapshot;
    },
  };

  const nav: Nav = {
    listen(fn) {
      ref.listeners.add(fn);
      return () => ref.listeners.delete(fn);
    },
    go(to, opt) {
      if (typeof to === "string") {
        const url = new URL(to, globalThis.location.origin);
        to = url.pathname + url.search + url.hash;
      }
      ref.snapshot = [to, opt];
      ref.subscribes.forEach((sub) => sub());
    },
  };

  const Nav = memo(() => {
    const to = useSyncExternalStore(fx.subscribe, fx.snapshot);

    const params = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
      Array.isArray(to) && navigate(...to);
    }, [to]);

    useEffect(() => {
      ref.listeners.forEach((listener) => listener({ location, params }));
    }, [location.pathname, location.search, location.hash]);

    return null;
  });

  return { nav, Nav };
};
