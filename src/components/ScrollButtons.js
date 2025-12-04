import React from 'react';

export default function ScrollButtons({ selector }) {
  function scroll(dir = 'right') {
    if (typeof document === 'undefined') return;

    const el = document.querySelector(selector);
    if (!el) return;

    const amount = el.clientWidth * 0.6;
    el.scrollBy({
      left: dir === 'right' ? amount : -amount,
      behavior: 'smooth',
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => scroll('left')}
        aria-label="Scroll left"
        className="hidden md:inline-flex absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur p-2 rounded-full shadow"
      >
        ◀
      </button>
      <button
        type="button"
        onClick={() => scroll('right')}
        aria-label="Scroll right"
        className="hidden md:inline-flex absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur p-2 rounded-full shadow"
      >
        ▶
      </button>
    </>
  );
}
