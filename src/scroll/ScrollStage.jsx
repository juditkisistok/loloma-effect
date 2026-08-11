import { useCallback, useEffect, useMemo, useRef } from "react";
import { StageContext } from "./stageContext";
import { scrollProgressBetween, scrollProgressOf } from "../lib/math";


export function ScrollStage({ children }) {
  const wrapRef = useRef(null);
  const sectionsRef = useRef(new Map());
  const subsRef = useRef(new Set());

  const registerSection = useCallback((name, el) => {
    if (!el) return undefined;
    sectionsRef.current.set(name, el);
    return () => sectionsRef.current.delete(name);
  }, []);

  const subscribe = useCallback((fn) => {
    subsRef.current.add(fn);
    return () => subsRef.current.delete(fn);
  }, []);

  useEffect(() => {
    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    const loop = (now) => {
      const sections = sectionsRef.current;
      const frame = {
        p: scrollProgressOf(wrapRef.current),
        act: (name) => scrollProgressOf(sections.get(name)),
        span: (startName, endName) =>
          scrollProgressBetween(sections.get(startName), sections.get(endName)),
        t: reduced ? 0 : now / 1000,
        reduced,
      };
      subsRef.current.forEach((fn) => fn(frame));
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const api = useMemo(
    () => ({ wrapRef, registerSection, subscribe }),
    [registerSection, subscribe],
  );

  return <StageContext.Provider value={api}>{children}</StageContext.Provider>;
}
