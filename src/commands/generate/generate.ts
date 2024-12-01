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
  ColorGradients,
  COLOR_NAMES,
} from './generate.types'
import { typescriptOutput } from './output/typescript'
import { OUTPUT_NAMES } from './output/output'

const hexColorToColorGradients = (color: string): ColorGradients => ({
  '100': darkenHexColor(color, 80),
  '200': darkenHexColor(color, 60),
  '300': darkenHexColor(color, 40),
  '400': darkenHexColor(color, 20),
  '500': color,
  '600': lightenHexColor(color, 20),
  '700': lightenHexColor(color, 40),
  '800': lightenHexColor(color, 60),
  '900': lightenHexColor(color, 80),
})

const createResult = (colors: GenerateCommandConfigColors): GenerateCommandResult => ({
  canvas: colors.canvas,
  section: lightenHexColor(colors.canvas, 10),
  sectionHighlight: lightenHexColor(colors.canvas, 20),
  outline: lightenHexColor(colors.canvas, 30),

  typeBright: colors.type,
  type: darkenHexColor(colors.type, 15),
  typeDemote: darkenHexColor(colors.type, 30),

  red: colors.red,
  redDemote: darkenHexColor(colors.red, 20),
  redBright: lightenHexColor(colors.red, 20),
  redSection: lightenHexColor(colors.red, 70),

  green: colors.green,
  greenDemote: darkenHexColor(colors.green, 20),
  greenBright: lightenHexColor(colors.green, 20),
  greenSection: lightenHexColor(colors.green, 70),

  blue: colors.blue,
  blueBright: lightenHexColor(colors.blue, 20),
  blueDemote: darkenHexColor(colors.blue, 20),
  blueSection: lightenHexColor(colors.blue, 70),

  yellow: colors.yellow,
  yellowDemote: darkenHexColor(colors.yellow, 20),
  yellowBright: lightenHexColor(colors.yellow, 20),
  yellowSection: lightenHexColor(colors.yellow, 70),

  purple: colors.purple,
  purpleDemote: darkenHexColor(colors.purple, 20),
  purpleBright: lightenHexColor(colors.purple, 20),
  purpleSection: lightenHexColor(colors.purple, 70),

  orange: colors.orange,
  orangeDemote: darkenHexColor(colors.orange, 20),
  orangeBright: lightenHexColor(colors.orange, 20),
  orangeSection: lightenHexColor(colors.orange, 70),

  pink: colors.pink,
  pinkDemote: darkenHexColor(colors.pink, 20),
  pinkBright: lightenHexColor(colors.pink, 20),
  pinkSection: lightenHexColor(colors.pink, 70),

  slate: colors.slate,
  slateDemote: darkenHexColor(colors.slate, 20),
  slateBright: lightenHexColor(colors.slate, 20),
  slateSection: lightenHexColor(colors.slate, 70),

  turquoise: colors.turquoise,
  turquoiseDemote: darkenHexColor(colors.turquoise, 20),
  turquoiseBright: lightenHexColor(colors.turquoise, 20),
  turquoiseSection: lightenHexColor(colors.turquoise, 70),

  colorGradients: {
    red: hexColorToColorGradients(colors.red),
    blue: hexColorToColorGradients(colors.blue),
    green: hexColorToColorGradients(colors.green),
    yellow: hexColorToColorGradients(colors.yellow),
    purple: hexColorToColorGradients(colors.purple),
    orange: hexColorToColorGradients(colors.orange),
    pink: hexColorToColorGradients(colors.pink),
    slate: hexColorToColorGradients(colors.slate),
    turquoise: hexColorToColorGradients(colors.turquoise),
  },
})

const getConfigViaInput = async (): Promise<GenerateCommandConfig> => {
  const responses = await inquirer.prompt([
    { name: 'canvas', message: 'Canvas color (darkest background):', type: 'input' },
    { name: 'type', message: 'Type color (lightest text):', type: 'input' },
    ...COLOR_NAMES.map(name => ({ name, message: `Base ${name} color:`, type: 'input' })),
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
      orange: responses.orange,
      purple: responses.purple,
      pink: responses.pink,
      slate: responses.slate,
      turquoise: responses.turquoise,
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
            orange: configJsonParsed.colors.orange.toUpperCase(),
            purple: configJsonParsed.colors.purple.toUpperCase(),
            pink: configJsonParsed.colors.pink.toUpperCase(),
            slate: configJsonParsed.colors.slate.toUpperCase(),
            turquoise: configJsonParsed.colors.turquoise.toUpperCase(),
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
