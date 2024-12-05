import { COLOR_NAMES } from '../generate.types'
import { Output } from './output.types'
import { write } from 'bun'

const colorGradientEntryName = (colorName: string, grad: string) =>
  `${colorName[0].toUpperCase()}${colorName.slice(1)}${grad}`

export const typescriptOutput: Output = async result => {
  const colorsEnum = `export enum Colors {
${COLOR_NAMES.flatMap(colorName =>
  Object.entries(result[colorName]).map(([grad, color]) => `  ${colorGradientEntryName(colorName, grad)} = '${color}'`)
).join(',\n')}
}`

  const colorsConstants = COLOR_NAMES.map(
    colorName => `export const ${colorName.toUpperCase()}S = [
${Object.keys(result[colorName])
  .map(grad => `  Colors.${colorGradientEntryName(colorName, grad)}`)
  .join(',\n')},
]`
  ).join('\n\n')

  const colorEntriesConstants = COLOR_NAMES.map(
    colorName =>
      `export const ${colorName.toUpperCase()}_ENTRIES = [
${Object.keys(result[colorName])
  .map(
    grad =>
      `  { name: '${colorGradientEntryName(colorName, grad)}', color: Colors.${colorGradientEntryName(
        colorName,
        grad
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

    return `// ${colorNameCapitalized}
  ${colorNameCapitalized} = Colors.${colorGradientEntryName(colorName, '500')},
  ${colorNameCapitalized}Dark = Colors.${colorGradientEntryName(colorName, '300')},
  ${colorNameCapitalized}Demote = Colors.${colorGradientEntryName(colorName, '400')},
  ${colorNameCapitalized}Bright = Colors.${colorGradientEntryName(colorName, '600')},
  ${colorNameCapitalized}Section = Colors.${colorGradientEntryName(colorName, '800')},`
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

  // -- Status
  ${COLOR_NAMES.map(colorName => createPaletteEnumPart(colorName)).join('\n  ')}
}`

  await write(
    './palette.ts',
    [colorsEnum, colorsConstants, colorEntriesConstants, allColorEntriesConstant, paletteEnum].join('\n\n') + '\n'
  )
}
