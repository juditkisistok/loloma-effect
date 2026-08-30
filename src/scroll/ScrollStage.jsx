import { useCallback, useEffect, useMemo, useRef } from "react";
import { StageContext } from "./stageContext";
import { scrollProgressBetween, scrollProgressOf } from "../lib/math";


export function ScrollStage({ children }) {
  const wrapRef = useRef(null);
  const sectionsRef = useRef(new Map());
  const subsRef = useRef(new Set());
  const requestFrameRef = useRef(() => {});

  const registerSection = useCallback((name, el) => {
    if (!el) return undefined;
    sectionsRef.current.set(name, el);
    return () => sectionsRef.current.delete(name);
  }, []);

  const subscribe = useCallback((fn) => {
    subsRef.current.add(fn);
    requestFrameRef.current();
    return () => subsRef.current.delete(fn);
  }, []);

  useEffect(() => {
    let raf = 0;
    let scheduled = false;
    const reducedQuery = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    );

    const publish = (now) => {
      scheduled = false;
      const sections = sectionsRef.current;
      const frame = {
        p: scrollProgressOf(wrapRef.current),
        act: (name) => scrollProgressOf(sections.get(name)),
        span: (startName, endName) =>
          scrollProgressBetween(sections.get(startName), sections.get(endName)),
        t: reducedQuery?.matches ? 0 : now / 1000,
        reduced: reducedQuery?.matches ?? false,
      };
      subsRef.current.forEach((fn) => fn(frame));
    };

    const requestFrame = () => {
      if (scheduled) return;
      scheduled = true;
      raf = requestAnimationFrame(publish);
    };

    requestFrameRef.current = requestFrame;
    window.addEventListener("scroll", requestFrame, { passive: true });
    window.addEventListener("resize", requestFrame);
    window.addEventListener("orientationchange", requestFrame);
    window.visualViewport?.addEventListener("resize", requestFrame);
    reducedQuery?.addEventListener("change", requestFrame);
    requestFrame();

    return () => {
      requestFrameRef.current = () => {};
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", requestFrame);
      window.removeEventListener("resize", requestFrame);
      window.removeEventListener("orientationchange", requestFrame);
      window.visualViewport?.removeEventListener("resize", requestFrame);
      reducedQuery?.removeEventListener("change", requestFrame);
    };
  }, []);

  const api = useMemo(
    () => ({ wrapRef, registerSection, subscribe }),
    [registerSection, subscribe],
  );

  return <StageContext.Provider value={api}>{children}</StageContext.Provider>;
}
