import { hexToRgb } from './hexToRgb'
import { rgbToHex } from './rgbToHex'

const darken = (component: number, percent: number): number => Math.max(0, Math.floor(component * (1 - percent / 100)))

export const darkenHexColor = (hex: string, percent: number): string => {
  const { r, g, b } = hexToRgb(hex)

  const newR = darken(r, percent)
  const newG = darken(g, percent)
  const newB = darken(b, percent)

  return rgbToHex(newR, newG, newB)
}
