import { existsSync } from 'node:fs'
import path from 'node:path'
import { createCommand } from '../../cliUtils/createCommand'
import { log } from '../../log'
import { file } from 'bun'
import inquirer from 'inquirer'
import { lightenHexColor } from '../utils/lighten'
import { darkenHexColor } from '../utils/darken'
import { GenerateCommandConfig, GenerateCommandResult, GenerateCommandOptions } from './generate.types'
import { typescriptOutput } from './output/typescript'

const createResult = (config: GenerateCommandConfig): GenerateCommandResult => ({
  canvas: config.canvas,
  section: lightenHexColor(config.canvas, 10),
  sectionHighlight: lightenHexColor(config.canvas, 20),
  outline: lightenHexColor(config.canvas, 30),

  typeDemote: darkenHexColor(config.type, 20),
  typeBody: darkenHexColor(config.type, 10),
  type: config.type,

  redDemote: darkenHexColor(config.red, 20),
  red: config.red,
  redSection: lightenHexColor(config.red, 50),

  greenDemote: darkenHexColor(config.green, 20),
  green: config.green,
  greenSection: lightenHexColor(config.green, 50),

  blueDemote: darkenHexColor(config.blue, 20),
  blue: config.blue,
  blueSection: lightenHexColor(config.blue, 50),

  yellowDemote: darkenHexColor(config.yellow, 20),
  yellow: config.yellow,
  yellowSection: lightenHexColor(config.yellow, 50),
})

const getConfigViaInput = async (): Promise<GenerateCommandConfig> => {
  const responses = await inquirer.prompt([
    { name: 'canvas', message: 'Canvas color (darkest background):', type: 'input' },
    { name: 'type', message: 'Type color (lightest text):', type: 'input' },
    { name: 'red', message: 'Base red color:', type: 'input' },
    { name: 'green', message: 'Base green color:', type: 'input' },
    { name: 'blue', message: 'Base blue color:', type: 'input' },
    { name: 'yellow', message: 'Base yellow color:', type: 'input' },
  ])

  return {
    canvas: responses.canvas,
    type: responses.type,
    red: responses.red,
    green: responses.green,
    blue: responses.blue,
    yellow: responses.yellow,
  }
}

export const generateCommand = createCommand<GenerateCommandOptions>({
  action: async ({ configPath }, startTimer) => {
    let timerStarted = false

    let config: GenerateCommandConfig
    if (configPath) {
      startTimer()
      timerStarted = true
      log.step(
        f => `--config provided; getting config from ${f.blue(f.underline(configPath))} (${path.resolve(configPath)})`
      )
      if (!existsSync(configPath)) {
        throw new Error(`File does not exist at path: ${configPath}.`)
      }
      log.success('Config file exists.')
      log.step('Reading config file.')
      const configJson = await file(configPath).text()
      log.success('Read config file.')
      try {
        log.step('Parsing config JSON.')
        const configJsonParsed: GenerateCommandConfig = JSON.parse(configJson)
        config = {
          canvas: configJsonParsed.canvas.toUpperCase(),
          type: configJsonParsed.type.toUpperCase(),
          red: configJsonParsed.red.toUpperCase(),
          green: configJsonParsed.green.toUpperCase(),
          blue: configJsonParsed.blue.toUpperCase(),
          yellow: configJsonParsed.yellow.toUpperCase(),
        }
        log.success('Parsed config JSON.')
      } catch (e) {
        throw new Error(`Could not parse config at ${configPath}.\n\nError: ${e}`)
      }
    } else {
      log.step(f => `--config not provided; getting config via input.`)
      config = await getConfigViaInput()
    }

    if (!timerStarted) {
      startTimer()
    }

    log.spacer()
    log.log(f => f.italic('Color configuration:'))
    log.table(
      Object.entries(config).map(([colorName, colorValue]) => ({
        'Color Name': colorName,
        'Color Value': colorValue,
      }))
    )
    log.spacer()

    log.step('Generating theme.')
    const result = createResult(config)
    log.success('Generated theme.')

    log.spacer()
    log.log(f => f.italic('Color results:'))
    log.table(
      Object.entries(result).map(([colorName, colorValue]) => ({
        'Color Name': colorName,
        'Color Value': colorValue,
      }))
    )

    await typescriptOutput(result)
  },
  configureCommander: program =>
    program.command('generate').description('Generates the .').option('-c, --config <PATH>', 'Specify config'),
  transformOptions: optionsFromCommander => ({
    verbose: optionsFromCommander.verbose ?? false,
    configPath: optionsFromCommander.config,
  }),
})
