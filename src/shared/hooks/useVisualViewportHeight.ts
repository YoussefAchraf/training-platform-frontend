import { useEffect, useState } from 'react';


export function useVisualViewportHeight(): number | undefined {
  const [height, setHeight] = useState<number | undefined>(() =>
    typeof window === 'undefined' ? undefined : (window.visualViewport?.height ?? window.innerHeight),
  );

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return undefined;

    const update = () => setHeight(viewport.height);
    update();
    viewport.addEventListener('resize', update);
    viewport.addEventListener('scroll', update);
    return () => {
      viewport.removeEventListener('resize', update);
      viewport.removeEventListener('scroll', update);
    };
  }, []);

  return height;
}
