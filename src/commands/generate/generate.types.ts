import { OutputName } from './output/output.types'

export type GenerateCommandOptions = { verbose: boolean; configPath?: string }

export type GenerateCommandConfigColors = {
  canvas: string
  typeLight: string
  type: string
} & Record<ColorName, string>

export type GenerateCommandConfig = {
  theme: 'dark' | 'light'
  colors: GenerateCommandConfigColors
  outputs: OutputName[]
}

export type ColorGradient = '10' | '15' | '20' | '25' | '30' | '40' | '50' | '60' | '70' | '80' | '90'

export type ColorAlias = '' | 'Dark' | 'Demote' | 'Bright' | 'Section'

export const COLOR_ALIASES: ColorAlias[] = ['', 'Dark', 'Demote', 'Bright', 'Section']

export const COLOR_ALIAS_TO_GRADIENT: Record<ColorAlias, ColorGradient> = {
  '': '50',
  Dark: '30',
  Demote: '40',
  Bright: '60',
  Section: '80',
}

export type ColorGradients = Record<ColorGradient, string>

export type ColorName =
  | 'red'
  | 'green'
  | 'blue'
  | 'yellow'
  | 'orange'
  | 'purple'
  | 'pink'
  | 'slate'
  | 'turquoise'
  | 'grey'

export const COLOR_NAMES: ColorName[] = [
  'red',
  'green',
  'blue',
  'yellow',
  'orange',
  'purple',
  'pink',
  'slate',
  'turquoise',
  'grey',
]

export type GenerateCommandResult = {
  canvas: string
  section: string
  sectionHighlight: string
  outline: string

  type: string
  typeBody: string
  typeDemote: string

  typeLight: string
  typeBodyLight: string
  typeDemoteLight: string
} & Record<ColorName, ColorGradients>
