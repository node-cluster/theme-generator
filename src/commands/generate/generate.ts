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
  '10': changeLightness(color, -80),
  '15': changeLightness(color, -70),
  '20': changeLightness(color, -60),
  '25': changeLightness(color, -50),
  '30': changeLightness(color, -40),
  '40': changeLightness(color, -20),
  '50': color,
  '60': changeLightness(color, 20),
  '70': changeLightness(color, 40),
  '80': changeLightness(color, 60),
  '90': changeLightness(color, 80),
})

const createResult = (colors: GenerateCommandConfigColors, theme: 'dark' | 'light'): GenerateCommandResult => {
  const hueCentralizationCoefficient = theme === 'dark' ? 1 : -1

  return {
    canvas: colors.canvas,
    section: changeLightness(colors.canvas, hueCentralizationCoefficient * 10),
    sectionHighlight: changeLightness(colors.canvas, hueCentralizationCoefficient * 20),
    outline: changeLightness(colors.canvas, hueCentralizationCoefficient * 30),

    type: colors.type,
    typeBody: changeLightness(colors.type, -hueCentralizationCoefficient * 15),
    typeDemote: changeLightness(colors.type, -hueCentralizationCoefficient * 30),

    typeLight: colors.typeLight,
    typeBodyLight: changeLightness(colors.type, -15),
    typeDemoteLight: changeLightness(colors.type, -30),

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
  }
}

const getConfigViaInput = async (): Promise<GenerateCommandConfig> => {
  const responses = await inquirer.prompt([
    { name: 'theme', message: 'Theme:', type: 'checkbox', choices: ['dark', 'light'], default: 'dark' },
    { name: 'canvas', message: 'Canvas color (background):', type: 'input' },
    { name: 'type', message: 'Type color (text):', type: 'input' },
    ...COLOR_NAMES.map(name => ({ name, message: `Base ${name} color:`, type: 'input' })),
    {
      name: 'outputs',
      message: 'InterOutputs:',
      type: 'checkbox',
      choices: OUTPUT_NAMES,
    },
  ])

  return {
    theme: responses.theme,
    colors: {
      canvas: responses.canvas,
      type: responses.type,
      typeLight: responses.typeLight,
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
          theme: configJsonParsed.theme,
          colors: {
            canvas: configJsonParsed.colors.canvas.toUpperCase(),
            type: configJsonParsed.colors.type.toUpperCase(),
            typeLight: configJsonParsed.colors.typeLight.toUpperCase(),
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
    const result = createResult(config.colors, config.theme)
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
