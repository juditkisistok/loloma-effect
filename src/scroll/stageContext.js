import { createContext, useContext, useEffect, useRef } from "react";

export const StageContext = createContext(null);

export function useStage() {
  const ctx = useContext(StageContext);
  if (!ctx) throw new Error("useStage must be used inside <ScrollStage>");
  return ctx;
}


export function useFrame(fn) {
  const { subscribe } = useStage();
  const fnRef = useRef(fn);
  fnRef.current = fn;
  useEffect(() => subscribe((frame) => fnRef.current(frame)), [subscribe]);
}
