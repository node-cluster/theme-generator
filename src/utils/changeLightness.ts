import { hexToRgb } from './hexToRgb'
import { rgbToHex } from './rgbToHex'

const darken = (component: number, percent: number): number => Math.max(0, Math.floor(component * (1 - percent / 100)))

const darkenHexColor = (hex: string, percent: number): string => {
  const { r, g, b } = hexToRgb(hex)

  const newR = darken(r, percent)
  const newG = darken(g, percent)
  const newB = darken(b, percent)

  return rgbToHex(newR, newG, newB)
}

const lighten = (component: number, percent: number): number =>
  Math.min(255, Math.floor(component + (255 - component) * (percent / 100)))

const lightenHexColor = (hex: string, percent: number): string => {
  const { r, g, b } = hexToRgb(hex)

  const newR = lighten(r, percent)
  const newG = lighten(g, percent)
  const newB = lighten(b, percent)

  return rgbToHex(newR, newG, newB)
}

/** Negative to darken, positive to lighten. */
export const changeLightness = (hex: string, percent: number): string => {
  if (percent < 0) {
    return darkenHexColor(hex, -percent)
  }
  if (percent > 0) {
    return lightenHexColor(hex, percent)
  }
  return hex
}
