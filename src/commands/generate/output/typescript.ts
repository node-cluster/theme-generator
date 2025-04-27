import {
  COLOR_ALIAS_TO_GRADIENT,
  COLOR_ALIASES,
  COLOR_NAMES,
  GenerateCommandResult,
  THEME_COLOR_NAMES,
  THEME_NAMES,
  ThemeName,
} from '../generate.types'
import { Output } from './output.types'
import { write } from 'bun'

const colorGradientEntryName = (colorName: string, grad: string | number) => `${colorName}${grad}`

const createColorsConst = (result: GenerateCommandResult) => {
  return `export const COLORS = {
${COLOR_NAMES.flatMap(colorName =>
  Object.entries(result.colors[colorName]).map(
    ([grad, color]) => `  ${colorGradientEntryName(colorName, grad)}: '${color}'`
  )
).join(',\n')},
}`
}

const createColorConsts = (result: GenerateCommandResult) => {
  return COLOR_NAMES.map(
    colorName => `export const ${colorName.toUpperCase()}S = [
${Object.keys(result.colors[colorName])
  .map(grad => `  COLORS.${colorGradientEntryName(colorName, grad)}`)
  .join(',\n')},
]`
  ).join('\n\n')
}

const createColorEntriesConsts = (result: GenerateCommandResult) => {
  return COLOR_NAMES.map(
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
  ).join('\n\n')
}

const createAllColorEntriesConst = () => {
  return `export const COLOR_ENTRIES = [
${COLOR_NAMES.map(colorName => `  ${colorName.toUpperCase()}_ENTRIES`).join(',\n')},
]`
}

const createPaletteConstPart = (colorName: string) => {
  return `// -- ${colorName[0].toUpperCase()}${colorName.slice(1)}s
${Object.entries(COLOR_ALIAS_TO_GRADIENT)
  .map(([alias, grad]) => `  ${colorName}${alias}: COLORS.${colorGradientEntryName(colorName, grad)}`)
  .join(',\n')},`
}

const createPaletteConst = (result: GenerateCommandResult, theme: ThemeName) => {
  return `export const ${theme.toUpperCase()}_PALETTE = {
  // -- Backgrounds
  canvas: '${result.themes[theme].canvas}',
  section: '${result.themes[theme].section}',
  sectionHighlight: '${result.themes[theme].sectionHighlight}',
  outline: '${result.themes[theme].outline}',
  // -- Foregrounds
  type: '${result.themes[theme].type}',
  typeBody: '${result.themes[theme].typeBody}',
  typeDemote: '${result.themes[theme].typeDemote}',
  ${COLOR_NAMES.map(createPaletteConstPart).join('\n  ')}
}`
}

const createPaletteType = () => {
  return `export type Palette = {
  ${THEME_COLOR_NAMES.map(colorName => `${colorName}: string`).join(',\n  ')}
  ${COLOR_NAMES.map(colorName => COLOR_ALIASES.map(alias => `${colorName}${alias}: string`))
    .flat()
    .join(',\n  ')}
}`
}

export const typescriptOutput: Output = async result => {
  const colorsConst = createColorsConst(result)
  const colorConstants = createColorConsts(result)
  const colorEntriesConstants = createColorEntriesConsts(result)
  const allColorEntriesConstant = createAllColorEntriesConst()
  const paletteConsts = THEME_NAMES.map(theme => createPaletteConst(result, theme)).join('\n\n')
  const paletteType = createPaletteType()

  await write(
    './palette.ts',
    [colorsConst, colorConstants, colorEntriesConstants, allColorEntriesConstant, paletteConsts, paletteType].join(
      '\n\n'
    ) + '\n'
  )
}
