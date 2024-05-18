import { hexToRgb } from './hexToRgb'
import { rgbToHex } from './rgbToHex'

const lighten = (component: number, percent: number): number =>
  Math.min(255, Math.floor(component + (255 - component) * (percent / 100)))

export const lightenHexColor = (hex: string, percent: number): string => {
  const { r, g, b } = hexToRgb(hex)

  const newR = lighten(r, percent)
  const newG = lighten(g, percent)
  const newB = lighten(b, percent)

  return rgbToHex(newR, newG, newB)
}
