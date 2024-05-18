import { GenerateCommandResult } from '../generate.types'

export type Output = (result: GenerateCommandResult) => Promise<void>

export type OutputName = 'typescript'
