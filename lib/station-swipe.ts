// Require a deliberate horizontal gesture; leave vertical scrolling and taps alone.
export function stationSwipeDirection(dx: number, dy: number, width: number): -1 | 0 | 1 {
  const threshold = Math.max(45, Math.min(90, width * .09));
  if (Math.abs(dx) < threshold || Math.abs(dx) < Math.abs(dy) * 1.4) return 0;
  return dx < 0 ? 1 : -1;
}
