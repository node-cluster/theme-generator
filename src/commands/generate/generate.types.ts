import { OutputName } from './output/output.types'

export type GenerateCommandOptions = { verbose: boolean; configPath?: string }

export type GenerateCommandConfigColors = {
  canvas: string
  type: string
} & Record<ColorName, string>

export type GenerateCommandConfig = {
  colors: GenerateCommandConfigColors
  outputs: OutputName[]
}

export type ColorGradient = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900

export type ColorGradients = Record<ColorGradient, string>

export type ColorName = 'red' | 'green' | 'blue' | 'yellow' | 'orange' | 'purple' | 'pink' | 'slate' | 'turquoise'

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
]

export type GenerateCommandResult = {
  canvas: string
  section: string
  sectionHighlight: string
  outline: string

  type: string
  typeDemote: string
  typeBright: string

  colorGradients: Record<ColorName, ColorGradients>
} & Record<`${ColorName}${Capitalize<'' | 'demote' | 'bright' | 'section'>}`, string>
