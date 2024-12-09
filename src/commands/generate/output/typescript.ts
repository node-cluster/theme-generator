import { COLOR_ALIAS_TO_GRADIENT, COLOR_ALIASES, COLOR_NAMES, ColorGradient } from '../generate.types'
import { Output } from './output.types'
import { write } from 'bun'

const colorGradientEntryName = (colorName: string, grad: ColorGradient) =>
  `${colorName[0].toUpperCase()}${colorName.slice(1)}${grad}`

export const typescriptOutput: Output = async result => {
  const colorsEnum = `export enum Colors {
${COLOR_NAMES.flatMap(colorName =>
  Object.entries(result[colorName]).map(
    ([grad, color]) => `  ${colorGradientEntryName(colorName, grad as ColorGradient)} = '${color}'`
  )
).join(',\n')}
}`

  const colorsConstants = COLOR_NAMES.map(
    colorName => `export const ${colorName.toUpperCase()}S = [
${Object.keys(result[colorName])
  .map(grad => `  Colors.${colorGradientEntryName(colorName, grad as ColorGradient)}`)
  .join(',\n')},
]`
  ).join('\n\n')

  const colorEntriesConstants = COLOR_NAMES.map(
    colorName =>
      `export const ${colorName.toUpperCase()}_ENTRIES = [
${Object.keys(result[colorName])
  .map(
    grad =>
      `  { name: '${colorGradientEntryName(colorName, grad as ColorGradient)}', color: Colors.${colorGradientEntryName(
        colorName,
        grad as ColorGradient
      )} }`
  )
  .join(',\n')},
]`
  ).join('\n\n')

  const allColorEntriesConstant = `export const COLOR_ENTRIES = [
${COLOR_NAMES.map(colorName => `  ${colorName.toUpperCase()}_ENTRIES`).join(',\n')},
]`

  const createPaletteEnumPart = (colorName: string) => {
    const colorNameCapitalized = `${colorName[0].toUpperCase()}${colorName.slice(1)}`

    return `// -- ${colorNameCapitalized}
  ${Object.entries(COLOR_ALIAS_TO_GRADIENT)
    .map(([alias, grad]) => `${colorNameCapitalized}${alias} = Colors.${colorGradientEntryName(colorName, grad)}`)
    .join(',\n  ')},`
  }

  const paletteEnum = `export enum Palette {
  // -- Section
  Canvas = '${result.canvas}',
  Section = '${result.section}',
  SectionHighlight = '${result.sectionHighlight}',
  Outline = '${result.outline}',

  // -- Type
  Type = '${result.type}',
  TypeBody = '${result.typeBody}',
  TypeDemote = '${result.typeDemote}',

  // -- Type (light)
  TypeLight = '${result.typeLight}',
  TypeBodyLight = '${result.typeBodyLight}',
  TypeDemoteLight = '${result.typeDemoteLight}',

  ${COLOR_NAMES.map(colorName => createPaletteEnumPart(colorName)).join('\n  ')}
}`

  await write(
    './palette.ts',
    [colorsEnum, colorsConstants, colorEntriesConstants, allColorEntriesConstant, paletteEnum].join('\n\n') + '\n'
  )
}
