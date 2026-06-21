import type { CSSProperties } from 'react';

/**
 * Convertit une chaîne CSS ("color: red; padding: 4px") en objet de style React.
 * Permet de transcrire fidèlement les styles inline du prototype `.dc.html`.
 */
export function css(input: string): CSSProperties {
  const style: Record<string, string> = {};
  for (const decl of input.split(';')) {
    const idx = decl.indexOf(':');
    if (idx === -1) continue;
    const prop = decl.slice(0, idx).trim();
    const value = decl.slice(idx + 1).trim();
    if (!prop || !value) continue;
    const key = prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    style[key] = value;
  }
  return style as CSSProperties;
}

/** Fusionne plusieurs chaînes / objets de style. */
export function sx(...parts: Array<string | CSSProperties | undefined | false>): CSSProperties {
  let out: CSSProperties = {};
  for (const p of parts) {
    if (!p) continue;
    out = { ...out, ...(typeof p === 'string' ? css(p) : p) };
  }
  return out;
}
