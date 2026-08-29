import { clamp } from "../lib/math";

export function stickyFigureProgress(
  element,
  {
    desktopTop = 0.08,
    mobileTop = 0.05,
    hold = 0.14,
  } = {},
) {
  if (!element) return 0;

  const topRatio = window.innerWidth <= 760 ? mobileTop : desktopTop;
  const stickyTop = Math.max(18, window.innerHeight * topRatio);
  const stickyHeight = element.firstElementChild?.offsetHeight ?? 0;
  const travel = Math.max(element.offsetHeight - stickyHeight - stickyTop, 1);
  const revealTravel = Math.max(travel * (1 - hold), 1);

  return clamp(
    (stickyTop - element.getBoundingClientRect().top) / revealTravel,
    0,
    1,
  );
}
