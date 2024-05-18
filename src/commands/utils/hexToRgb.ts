export const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  hex = hex.replace(/^#/, '')
  const bigint = parseInt(hex, 16)

  if (hex.length === 3) {
    const r = ((bigint >> 8) & 0xf) * 17
    const g = ((bigint >> 4) & 0xf) * 17
    const b = (bigint & 0xf) * 17
    return { r, g, b }
  } else if (hex.length === 6) {
    const r = (bigint >> 16) & 255
    const g = (bigint >> 8) & 255
    const b = bigint & 255
    return { r, g, b }
  } else {
    throw new Error('Invalid hex color')
  }
}
