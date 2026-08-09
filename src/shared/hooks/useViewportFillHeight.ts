import { useLayoutEffect, useRef, useState } from 'react';


export function useViewportFillHeight<T extends HTMLElement>(bottomGap = 0) {
  const ref = useRef<T>(null);
  const [height, setHeight] = useState<number>();

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const update = () => {
      const top = element.getBoundingClientRect().top;
      let candidate = Math.max(320, window.innerHeight - top - bottomGap);
      
      
      
      
      
      
      
      
      element.style.height = `${candidate}px`;
      const overflow = document.documentElement.scrollHeight - window.innerHeight;
      if (overflow > 0) {
        candidate = Math.max(320, candidate - overflow);
        element.style.height = `${candidate}px`;
      }
      setHeight(candidate);
    };

    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    const observer = new ResizeObserver(update);
    observer.observe(document.body);

    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
      observer.disconnect();
    };
  }, [bottomGap]);

  return { ref, height };
}
