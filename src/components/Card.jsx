import { useRef } from "react";
import { useFrame } from "../scroll/stageContext";
import { clamp } from "../lib/math";
import styles from "./Card.module.css";


export function Card({ className = "", children }) {
  const ref = useRef(null);

  useFrame(() => {
    const el = ref.current;
    if (!el) return;
    const b = el.getBoundingClientRect();
    const centre = b.top + b.height / 2;
    const dist = Math.abs(centre - window.innerHeight / 2) / window.innerHeight;
    const o = clamp(1 - (dist - 0.14) / 0.34, 0, 1);
    el.style.opacity = o.toFixed(2);
    el.style.transform = `translateY(${((1 - o) * 26).toFixed(1)}px)`;
  });

  return (
    <div ref={ref} className={`${styles.card} ${className}`}>
      {children}
    </div>
  );
}
