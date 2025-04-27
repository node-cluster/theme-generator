import { OutputName } from './output/output.types'

export const COLOR_GRADIENTS = [
  5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95,
] as const satisfies number[]

export type ColorGradient = (typeof COLOR_GRADIENTS)[number]

export const COLOR_ALIASES = ['', 'Dark', 'Demote', 'Bright', 'Section'] as const satisfies string[]

export type ColorAlias = (typeof COLOR_ALIASES)[number]

export const COLOR_ALIAS_TO_GRADIENT: Record<ColorAlias, ColorGradient> = {
  '': 50,
  Dark: 30,
  Demote: 40,
  Bright: 60,
  Section: 80,
}

export type ColorGradients = Record<ColorGradient, string>

export const COLOR_NAMES = [
  'red',
  'green',
  'blue',
  'yellow',
  'orange',
  'purple',
  'pink',
  'slate',
  'cyan',
  'teal',
  'grey',
] as const satisfies string[]

export type ColorName = (typeof COLOR_NAMES)[number]

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

export type GenerateCommandConfig = {
  themes: Record<ThemeName, Record<ThemeBaseColorName, string>>
  colors: Record<ColorName, string>
  outputs: OutputName[]
}

export type GenerateCommandResult = {
  themes: Record<ThemeName, Record<ThemeColorName, string>>
  colors: Record<ColorName, ColorGradients>
}
