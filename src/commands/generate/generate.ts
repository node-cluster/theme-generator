import { existsSync } from 'node:fs'
import path from 'node:path'
import { createCommand } from '../../cliUtils/createCommand'
import { log } from '../../log'
import { file } from 'bun'
import { GenerateCommandConfig, GenerateCommandResult, GenerateCommandOptions, ColorGradients } from './generate.types'
import { typescriptOutput } from './output/typescript'
import { changeLightness } from '../../utils/changeLightness'

const hexColorToColorGradients = (color: string): ColorGradients => ({
  5: changeLightness(color, -90),
  10: changeLightness(color, -80),
  15: changeLightness(color, -70),
  20: changeLightness(color, -60),
  25: changeLightness(color, -50),
  30: changeLightness(color, -40),
  35: changeLightness(color, -30),
  40: changeLightness(color, -20),
  45: changeLightness(color, -10),
  50: color,
  55: changeLightness(color, 10),
  60: changeLightness(color, 20),
  65: changeLightness(color, 30),
  70: changeLightness(color, 40),
  75: changeLightness(color, 50),
  80: changeLightness(color, 60),
  85: changeLightness(color, 70),
  90: changeLightness(color, 80),
  95: changeLightness(color, 90),
})

const createResult = ({ colors, themes }: GenerateCommandConfig): GenerateCommandResult => {
  const colorsResult: Record<string, ColorGradients> = {}
  Object.entries(colors).forEach(([colorName, colorHex]) => {
    colorsResult[colorName] = hexColorToColorGradients(colorHex)
  })

  return {
    themes: {
      dark: {
        colors: {
          canvas: themes.dark.canvas,
          section: changeLightness(themes.dark.canvas, 10),
          sectionHighlight: changeLightness(themes.dark.canvas, 20),
          outline: changeLightness(themes.dark.canvas, 30),
          type: themes.dark.type,
          typeBody: changeLightness(themes.dark.type, -15),
          typeDemote: changeLightness(themes.dark.type, -30),
        },
        aliases: themes.dark.aliases,
      },
      light: {
        colors: {
          canvas: themes.light.canvas,
          section: changeLightness(themes.light.canvas, -10),
          sectionHighlight: changeLightness(themes.light.canvas, -20),
          outline: changeLightness(themes.light.canvas, -30),
          type: themes.light.type,
          typeBody: changeLightness(themes.light.type, 15),
          typeDemote: changeLightness(themes.light.type, 30),
        },
        aliases: themes.light.aliases,
      },
    },
    colors: colorsResult,
  }
}

const mapKeys = (obj: Record<string, any>, map: (key: string) => string) => {
  const newObj: Record<string, any> = {}
  Object.keys(obj).forEach(key => (newObj[map(key)] = obj[key]))
  return newObj
}

export const generateCommand = createCommand<GenerateCommandOptions>({
  action: async ({ configPath = 'config.json' }, startTimer) => {
    log.step(f => `Getting config from ${f.blue(f.underline(configPath))} (${path.resolve(configPath)})`)
    if (!existsSync(configPath)) {
      throw new Error(`File does not exist at path: ${configPath}.`)
    }
    log.success('Config file exists.')
    log.step('Reading config file.')
    const configJson = await file(configPath).text()
    log.success('Read config file.')
    let config: GenerateCommandConfig
    try {
      log.step('Parsing config JSON.')
      const configJsonParsed: GenerateCommandConfig = JSON.parse(configJson)

      config = {
        themes: {
          dark: {
            canvas: configJsonParsed.themes.dark.canvas.toUpperCase(),
            type: configJsonParsed.themes.dark.type.toUpperCase(),
            aliases: configJsonParsed.themes.dark.aliases,
          },
          light: {
            canvas: configJsonParsed.themes.light.canvas.toUpperCase(),
            type: configJsonParsed.themes.light.type.toUpperCase(),
            aliases: configJsonParsed.themes.light.aliases,
          },
        },
        colors: {}, // Will set immediately below
        outputs: configJsonParsed.outputs ?? ['typescript'],
      }

      Object.entries(configJsonParsed.colors).forEach(([colorName, colorHex]) => {
        config.colors[colorName] = colorHex
      })

      log.success('Parsed config JSON.')
    } catch (e) {
      throw new Error(`Could not parse config at ${configPath}.\n\nError: ${e}`)
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
    const result = createResult(config)
    log.success('Generated theme.')
    log.spacer()
    log.divider()
    log.spacer()

    log.log(f => f.italic('Colors:'))
    log.table(
      Object.entries(result.colors).map(([colorName, colorGradients]) => ({
        'Color Name': colorName,
        ...mapKeys(colorGradients, k => `G-${k}`),
      }))
    )
    log.spacer()

    log.log(f => f.italic('Palettes:'))
    log.table(
      Object.entries(result.themes).map(([theme, colorsObj]) => ({
        Theme: theme,
        ...colorsObj.colors,
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
