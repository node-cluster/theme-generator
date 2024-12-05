import { existsSync } from 'node:fs'
import path from 'node:path'
import { createCommand } from '../../cliUtils/createCommand'
import { log } from '../../log'
import { file } from 'bun'
import inquirer from 'inquirer'
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
import { changeLightness } from '../../utils/changeLightness'

const hexColorToColorGradients = (color: string): ColorGradients => ({
  '100': changeLightness(color, -80),
  '200': changeLightness(color, -60),
  '300': changeLightness(color, -40),
  '400': changeLightness(color, -20),
  '500': color,
  '600': changeLightness(color, 20),
  '700': changeLightness(color, 40),
  '800': changeLightness(color, 60),
  '900': changeLightness(color, 80),
})

const createResult = (colors: GenerateCommandConfigColors): GenerateCommandResult => ({
  canvas: colors.canvas,
  section: changeLightness(colors.canvas, 10),
  sectionHighlight: changeLightness(colors.canvas, 20),
  outline: changeLightness(colors.canvas, 30),

  type: colors.type,
  typeBody: changeLightness(colors.type, -15),
  typeDemote: changeLightness(colors.type, -30),

  red: hexColorToColorGradients(colors.red),
  blue: hexColorToColorGradients(colors.blue),
  green: hexColorToColorGradients(colors.green),
  yellow: hexColorToColorGradients(colors.yellow),
  purple: hexColorToColorGradients(colors.purple),
  orange: hexColorToColorGradients(colors.orange),
  pink: hexColorToColorGradients(colors.pink),
  slate: hexColorToColorGradients(colors.slate),
  turquoise: hexColorToColorGradients(colors.turquoise),
  grey: hexColorToColorGradients(colors.grey),
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
      grey: responses.grey,
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
            grey: configJsonParsed.colors.grey.toUpperCase(),
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
        'Color Value': typeof colorValue === 'string' ? colorValue : Object.values(colorValue).join(','),
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
