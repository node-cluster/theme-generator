import { Command as CommanderCommand } from 'commander'

import { Command } from './createCommand'

export type CreateProgramOptions = {
  name: string
  description: string
  version?: string
  commands: Command[]
}

export type Program = {
  execute: () => void
}

export const createProgram = (options: CreateProgramOptions): Program => {
  const program = new CommanderCommand()

  program.name(options.name).description(options.description)

  if (options.version != null) {
    program.version(options.version)
  }

  options.commands.forEach(c => c.addToCommander(program))

  return {
    execute: () => program.parse(),
  }
}
