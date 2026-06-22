import { useEffect, useState } from 'react';

/** Seuils de rupture (px). */
export const BP = { mobile: 768, tablet: 1024 } as const;

export interface Viewport {
  width: number;
  /** < 768px : téléphone — sidebar en tiroir, grilles empilées. */
  isMobile: boolean;
  /** 768–1023px : tablette. */
  isTablet: boolean;
}

/**
 * Suit la largeur de la fenêtre pour adapter la mise en page.
 * L'app utilisant des styles inline (pas de media queries possibles inline),
 * ce hook fournit les bascules structurelles (tiroir, paddings).
 */
export function useViewport(): Viewport {
  const [width, setWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1280,
  );

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return {
    width,
    isMobile: width < BP.mobile,
    isTablet: width >= BP.mobile && width < BP.tablet,
  };
}
