import { Command as CommanderCommand } from 'commander'

import { log, state } from '../log'

export type CreateCommandOptions<TOptions extends { verbose: boolean } = { verbose: boolean }> = {
  configureCommander: (program: CommanderCommand) => CommanderCommand
  transformOptions: (optionsFromCommander: any) => TOptions
  action: (options: TOptions, startTimer: () => void) => Promise<void>
}

export type Command = {
  addToCommander: (program: CommanderCommand) => void
}

const onFatalError = (e: any) => {
  log.error('An error occurred.')
  console.error(e)
  process.exit(1)
}

export const createCommand = <TOptions extends { verbose: boolean } = { verbose: boolean }>(
  options: CreateCommandOptions<TOptions>,
): Command => {
  const action = async (optionsFromCommander: any) => {
    state.verbose = optionsFromCommander.verbose ?? false
    const _options = options.transformOptions(optionsFromCommander)
    let start: number
    try {
      start = Date.now()

      await options.action(_options, () => (start = Date.now()))

      log.spacer()
      log.success(f => `${f.green('Done')}  ${f.blue(`[${(Date.now() - start) / 1000}s]`)}`)
      process.exit(0)
    } catch (e) {
      onFatalError(e)
    }
  }

  return {
    addToCommander: program => {
      options.configureCommander(program).action(async optionsFromCommander => {
        await action(optionsFromCommander)
      })
    },
  }
}
