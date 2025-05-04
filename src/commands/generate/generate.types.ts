import { OutputName } from './output/output.types'

export const COLOR_GRADIENTS = [
  5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95,
] as const satisfies number[]

export type ColorGradient = (typeof COLOR_GRADIENTS)[number]

export type ColorAliases = Record<string, ColorGradient>

export type ColorGradients = Record<ColorGradient, string>

export const THEME_BASE_COLOR_NAMES = ['canvas', 'type'] as const satisfies string[]

export type ThemeBaseColorName = (typeof THEME_BASE_COLOR_NAMES)[number]

export const THEME_COLOR_NAMES = [
  ...THEME_BASE_COLOR_NAMES,
  'section',
  'sectionHighlight',
  'outline',
  'typeBody',
  'typeDemote',
] as const satisfies string[]

export type ThemeColorName = (typeof THEME_COLOR_NAMES)[number]

export const THEME_NAMES = ['dark', 'light'] as const satisfies string[]

export type ThemeName = (typeof THEME_NAMES)[number]

export type GenerateCommandOptions = { verbose: boolean; configPath?: string }

export type ThemeConfig = Record<ThemeBaseColorName, string> & {
  aliases: ColorAliases
}

export type GeneratedThemeConfig = { colors: Record<ThemeColorName, string>; aliases: ColorAliases }

export type GenerateCommandConfig = {
  themes: Record<ThemeName, ThemeConfig>
  colors: Record<string, string>
  outputs: OutputName[]
}

export type GenerateCommandResult = {
  themes: Record<ThemeName, GeneratedThemeConfig>
  colors: Record<string, ColorGradients>
}
