/**
 * Icon — Centralized icon renderer for the HMS project
 * ─────────────────────────────────────────────────────────────────────────────
 * Wraps every Lucide icon with consistent sizing, coloring, and safe fallbacks.
 *
 * Props:
 *   name        — key from ICON_CATALOG (required)
 *   size        — 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'  (default: 'md')
 *   color       — semantic key from ICON_COLORS OR any valid CSS color string
 *   className   — extra CSS classes
 *   strokeWidth — SVG stroke width (default: 2)
 *   fill        — if true, fills the icon with the color (default: false)
 *   style       — inline styles (merged after defaults)
 *   ...rest     — forwarded to the Lucide SVG element (e.g. aria-label)
 *
 * Examples:
 *   <Icon name="pharmacy"  size="lg"  color="primary" />
 *   <Icon name="delete"    size="md"  color="error"   aria-label="Delete medicine" />
 *   <Icon name="success"   size="sm"  color="success" />
 *   <Icon name="settings"  color="#7c3aed" />
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { ICON_CATALOG, ICON_SIZES, ICON_COLORS } from '../utils/icons';

export const Icon = ({
  name,
  size = 'md',
  color = 'secondary',
  className = '',
  strokeWidth = 2,
  fill = false,
  style = {},
  ...rest
}) => {
  const IconComponent = ICON_CATALOG[name];

  // Graceful fallback — never crash, warn in dev only
  if (!IconComponent) {
    if (import.meta.env?.DEV) {
      console.warn(`[Icon] Unknown icon name: "${name}". Add it to ICON_CATALOG in utils/icons.js`);
    }
    return null;
  }

  // Resolve size: use scale or fall back to raw number
  const sizePixels = typeof size === 'number' ? size : (ICON_SIZES[size] ?? ICON_SIZES.md);

  // Resolve color: semantic token → hex, or pass through raw CSS value
  const colorValue = ICON_COLORS[color] ?? color;

  return (
    <IconComponent
      width={sizePixels}
      height={sizePixels}
      color={colorValue}
      fill={fill ? colorValue : 'none'}
      strokeWidth={strokeWidth}
      className={className}
      style={{ flexShrink: 0, ...style }}
      {...rest}
    />
  );
};

export default Icon;
