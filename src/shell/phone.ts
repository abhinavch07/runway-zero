// The phone layout (small screens): the same media query as the end of style.css.
export const PHONE = window.matchMedia("(max-width: 760px), (max-height: 500px)");

/**
 * The smallest zoom a panel may shrink to when it is fitted to the screen. On a phone panels stay
 * big enough to tap, and the panel scrolls instead.
 */
export const minZoom = (desktop: number) => (PHONE.matches ? 0.85 : desktop);

/** A touch screen with no mouse or trackpad (a phone or tablet). */
export const TOUCH_ONLY = window.matchMedia("(pointer: coarse)").matches && !window.matchMedia("(any-pointer: fine)").matches;
