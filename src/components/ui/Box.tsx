import { createElement, useState } from 'react';
import type { CSSProperties, ElementType, ReactNode } from 'react';
import { css } from '../../lib/css';

type BoxProps = {
  as?: ElementType;
  /** Style de base sous forme de chaîne CSS (transcription fidèle du prototype). */
  sx?: string;
  /** Style appliqué au survol (équivalent `style-hover` du prototype). */
  hover?: string;
  /** Style additionnel sous forme d'objet React. */
  style?: CSSProperties;
  children?: ReactNode;
  [key: string]: unknown;
};

/**
 * Primitive de mise en page. Reproduit le système de styles inline + hover
 * du prototype `.dc.html` en supportant `style-hover` via un état local.
 */
export function Box({ as = 'div', sx = '', hover, style, children, ...rest }: BoxProps) {
  const [hovered, setHovered] = useState(false);

  const computed: CSSProperties = {
    ...css(sx),
    ...(hovered && hover ? css(hover) : {}),
    ...style,
  };

  const hoverHandlers = hover
    ? {
        onMouseEnter: () => setHovered(true),
        onMouseLeave: () => setHovered(false),
      }
    : {};

  return createElement(as, { style: computed, ...hoverHandlers, ...rest }, children);
}
