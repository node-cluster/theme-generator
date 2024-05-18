import { existsSync } from 'node:fs'
import path from 'node:path'
import { createCommand } from '../../cliUtils/createCommand'
import { log } from '../../log'
import { file } from 'bun'
import inquirer from 'inquirer'
import { lightenHexColor } from '../../utils/lighten'
import { darkenHexColor } from '../../utils/darken'
import {
  GenerateCommandConfig,
  GenerateCommandResult,
  GenerateCommandOptions,
  GenerateCommandConfigColors,
} from './generate.types'
import { typescriptOutput } from './output/typescript'
import { OUTPUT_NAMES } from './output/output'

const createResult = (colors: GenerateCommandConfigColors): GenerateCommandResult => ({
  canvas: colors.canvas,
  section: lightenHexColor(colors.canvas, 10),
  sectionHighlight: lightenHexColor(colors.canvas, 20),
  outline: lightenHexColor(colors.canvas, 30),

  type: colors.type,
  typeBody: darkenHexColor(colors.type, 15),
  typeDemote: darkenHexColor(colors.type, 30),

  red: colors.red,
  redDemote: darkenHexColor(colors.red, 30),
  redSection: lightenHexColor(colors.red, 70),

  green: colors.green,
  greenDemote: darkenHexColor(colors.green, 30),
  greenSection: lightenHexColor(colors.green, 70),

  blue: colors.blue,
  blueDemote: darkenHexColor(colors.blue, 30),
  blueSection: lightenHexColor(colors.blue, 70),

  yellow: colors.yellow,
  yellowDemote: darkenHexColor(colors.yellow, 30),
  yellowSection: lightenHexColor(colors.yellow, 70),
})

const getConfigViaInput = async (): Promise<GenerateCommandConfig> => {
  const responses = await inquirer.prompt([
    { name: 'canvas', message: 'Canvas color (darkest background):', type: 'input' },
    { name: 'type', message: 'Type color (lightest text):', type: 'input' },
    { name: 'red', message: 'Base red color:', type: 'input' },
    { name: 'green', message: 'Base green color:', type: 'input' },
    { name: 'blue', message: 'Base blue color:', type: 'input' },
    { name: 'yellow', message: 'Base yellow color:', type: 'input' },
    {
      name: 'outputs',
      message: 'InterOutputs:',
      type: 'checkbox',
      choices: OUTPUT_NAMES,
    },
  ])

  return {
    colors: {
      canvas: responses.canvas,
      type: responses.type,
      red: responses.red,
      green: responses.green,
      blue: responses.blue,
      yellow: responses.yellow,
    },
    outputs: responses.outputs,
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
          colors: {
            canvas: configJsonParsed.colors.canvas.toUpperCase(),
            type: configJsonParsed.colors.type.toUpperCase(),
            red: configJsonParsed.colors.red.toUpperCase(),
            green: configJsonParsed.colors.green.toUpperCase(),
            blue: configJsonParsed.colors.blue.toUpperCase(),
            yellow: configJsonParsed.colors.yellow.toUpperCase(),
          },
          outputs: configJsonParsed.outputs ?? ['typescript'],
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
      Object.entries(config.colors).map(([colorName, colorValue]) => ({
        'Color Name': colorName,
        'Color Value': colorValue,
      }))
    )
    log.spacer()

    log.step('Generating theme.')
    const result = createResult(config.colors)
    log.success('Generated theme.')

    log.spacer()
    log.log(f => f.italic('Color results:'))
    log.table(
      Object.entries(result).map(([colorName, colorValue]) => ({
        'Color Name': colorName,
        'Color Value': colorValue,
      }))
    )
    log.spacer()

    if (config.outputs.includes('typescript')) {
      log.step('Outputting results as Typescript.')
      await typescriptOutput(result)
      log.success('Outputted results as Typescript.')
    }
  },
  configureCommander: program =>
    program.command('generate').description('Generates the .').option('-c, --config <PATH>', 'Specify config'),
  transformOptions: optionsFromCommander => ({
    verbose: optionsFromCommander.verbose ?? false,
    configPath: optionsFromCommander.config,
  }),
})
