import { useEffect, useState } from "react";

export const useSyncProp = <T>(syncProp: T) => {
  const [state, setState] = useState(syncProp);
  useEffect(() => setState(syncProp), [syncProp]);
  return [state, setState] as const;
};
