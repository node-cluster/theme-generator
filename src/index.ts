import { createProgram } from './cliUtils/createProgram'
import { generateCommand } from './commands/generate/generate'

const program = createProgram({
  name: 'stg',
  description: 'Site Theme Generator CLI',
  commands: [generateCommand],
})

program.execute()
