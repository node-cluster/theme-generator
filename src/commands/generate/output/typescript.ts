import { log } from '../../../log'
import { ColorAliases, GenerateCommandResult, THEME_COLOR_NAMES, THEME_NAMES, ThemeName } from '../generate.types'
import { Output } from './output.types'
import { write } from 'bun'
import { resolve } from 'path'

const colorGradientEntryName = (colorName: string, grad: string | number) => `${colorName}${grad}`

const capitalize = (s: string) => (s.length > 0 ? `${s[0].toUpperCase()}${s.slice(1)}` : '')

const createColorsConst = (result: GenerateCommandResult) => {
  return `export const COLORS = {
${Object.keys(result.colors)
  .flatMap(colorName =>
    Object.entries(result.colors[colorName]).map(
      ([grad, color]) => `  ${colorGradientEntryName(colorName, grad)}: '${color}'`
    )
  )
  .join(',\n')},
}`
}

const createColorConsts = (result: GenerateCommandResult) => {
  return Object.keys(result.colors)
    .map(
      colorName => `export const ${colorName.toUpperCase()}S = [
${Object.keys(result.colors[colorName])
  .map(grad => `  COLORS.${colorGradientEntryName(colorName, grad)}`)
  .join(',\n')},
]`
    )
    .join('\n\n')
}

const createColorEntriesConsts = (result: GenerateCommandResult) => {
  return Object.keys(result.colors)
    .map(
      colorName =>
        `export const ${colorName.toUpperCase()}_ENTRIES = [
${Object.keys(result.colors[colorName])
  .map(
    grad =>
      `  { name: '${colorGradientEntryName(colorName, grad)}', color: COLORS.${colorGradientEntryName(
        colorName,
        grad
      )} }`
  )
  .join(',\n')},
]`
    )
    .join('\n\n')
}

const createAllColorEntriesConst = (result: GenerateCommandResult) => {
  return `export const COLOR_ENTRIES = [
${Object.keys(result.colors)
  .map(colorName => `  ${colorName.toUpperCase()}_ENTRIES`)
  .join(',\n')},
]`
}

const createPaletteConstPart = (colorName: string, aliases: ColorAliases) => {
  return `// -- ${colorName[0].toUpperCase()}${colorName.slice(1)}s
${Object.entries(aliases)
  .map(([alias, grad]) => `  ${colorName}${capitalize(alias)}: COLORS.${colorGradientEntryName(colorName, grad)}`)
  .join(',\n')},`
}

const createPaletteConst = (result: GenerateCommandResult, theme: ThemeName) => {
  return `export const ${theme.toUpperCase()}_PALETTE = {
  // -- Backgrounds
  canvas: '${result.themes[theme].colors.canvas}',
  section: '${result.themes[theme].colors.section}',
  sectionHighlight: '${result.themes[theme].colors.sectionHighlight}',
  outline: '${result.themes[theme].colors.outline}',
  // -- Foregrounds
  type: '${result.themes[theme].colors.type}',
  typeBody: '${result.themes[theme].colors.typeBody}',
  typeDemote: '${result.themes[theme].colors.typeDemote}',
  ${Object.keys(result.colors)
    .map(colorName => createPaletteConstPart(colorName, result.themes[theme].aliases))
    .join('\n  ')}
} as const satisfies Palette`
}

const createPaletteType = (result: GenerateCommandResult) => {
  return `export type Palette = {
  ${THEME_COLOR_NAMES.map(colorName => `${colorName}: string`).join(',\n  ')}
  ${Object.keys(result.colors)
    .map(colorName => Object.keys(result.themes.dark.aliases).map(alias => `${colorName}${capitalize(alias)}: string`))
    .flat()
    .join(',\n  ')}
}`
}

const createPaletteNameType = () => {
  return 'export type PaletteName = keyof Palette'
}

export const typescriptOutput: Output = async result => {
  const filePath = './palette.ts'
  log.step(f => `Writing results to ${f.cyan(filePath)} ${f.grey(f.italic(`(${resolve(filePath)})`))}`)
  await write(
    filePath,
    [
      createColorsConst(result),
      createColorConsts(result),
      createColorEntriesConsts(result),
      createAllColorEntriesConst(result),
      createPaletteType(result),
      createPaletteNameType(),
      THEME_NAMES.map(theme => createPaletteConst(result, theme)).join('\n\n'),
    ].join('\n\n') + '\n'
  )
}
