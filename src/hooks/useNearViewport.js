import { useEffect, useState } from "react";

export function useNearViewport(ref, rootMargin = "150% 0px") {
  const [isNear, setIsNear] = useState(false);

  useEffect(() => {
    if (isNear) return undefined;
    const node = ref.current;
    if (!node) return undefined;

    if (!("IntersectionObserver" in window)) {
      setIsNear(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsNear(true);
        observer.disconnect();
      },
      { rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [isNear, ref, rootMargin]);

  return isNear;
}
