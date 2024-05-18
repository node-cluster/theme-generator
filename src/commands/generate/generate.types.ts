import { OutputName } from './output/output.types'

export type GenerateCommandOptions = { verbose: boolean; configPath?: string }

export type GenerateCommandConfigColors = {
  canvas: string
  type: string
  red: string
  green: string
  blue: string
  yellow: string
}

export type GenerateCommandConfig = {
  colors: GenerateCommandConfigColors
  outputs: OutputName[]
}

export type GenerateCommandResult = {
  canvas: string
  section: string
  sectionHighlight: string
  outline: string

  typeDemote: string
  typeBody: string
  type: string

  redDemote: string
  red: string
  redSection: string

  greenDemote: string
  green: string
  greenSection: string

  blueDemote: string
  blue: string
  blueSection: string

  yellowDemote: string
  yellow: string
  yellowSection: string
}
