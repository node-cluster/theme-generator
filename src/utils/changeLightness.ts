import { darkenHexColor } from './darken'
import { lightenHexColor } from './lighten'

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
