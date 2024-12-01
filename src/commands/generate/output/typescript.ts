import { Output } from './output.types'
import { write } from 'bun'

const colorGradientEntryName = (colorName: string, grad: string) =>
  `${colorName[0].toUpperCase()}${colorName.slice(1)}${grad}`

export const typescriptOutput: Output = async result => {
  const colorsEnum = `export enum Colors {
  ${Object.entries(result.colorGradients)
    .flatMap(([colorName, gradients]) =>
      Object.entries(gradients).map(([grad, color]) => `${colorGradientEntryName(colorName, grad)} = '${color}'`)
    )
    .join(',\n  ')}
}`

  const colorsConstants = Object.entries(result.colorGradients)
    .map(
      ([colorName, gradients]) =>
        `export const ${colorName.toUpperCase()}S = [
${Object.keys(gradients)
  .map(grad => `  Colors.${colorGradientEntryName(colorName, grad)}`)
  .join(',\n')},
]`
    )
    .join('\n\n')

  const colorEntriesConstants = Object.entries(result.colorGradients)
    .map(
      ([colorName, gradients]) =>
        `export const ${colorName.toUpperCase()}_ENTRIES = [
${Object.keys(gradients)
  .map(
    grad =>
      `  { name: '${colorGradientEntryName(colorName, grad)}', color: Colors.${colorGradientEntryName(
        colorName,
        grad
      )} }`
  )
  .join(',\n')},
]`
    )
    .join('\n\n')

  const allColorEntriesConstant = `export const COLOR_ENTRIES = [
${Object.keys(result.colorGradients)
  .map(colorName => `  ${colorName.toUpperCase()}_ENTRIES`)
  .join(',\n')}
]`

  const createPaletteEnumPart = (colorName: string) => {
    const colorNameCapitalized = `${colorName[0].toUpperCase()}${colorName.slice(1)}`

    return `// ${colorNameCapitalized}
  ${colorNameCapitalized} = Colors.${colorGradientEntryName(colorName, '500')},
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
  TypeBright = '${result.typeBright}',
  TypeDemote = '${result.typeDemote}',

  // -- Status
  ${createPaletteEnumPart('red')}
  ${createPaletteEnumPart('green')}
  ${createPaletteEnumPart('blue')}
  ${createPaletteEnumPart('yellow')}
  ${createPaletteEnumPart('purple')}
  ${createPaletteEnumPart('orange')}
  ${createPaletteEnumPart('pink')}
  ${createPaletteEnumPart('slate')}
  ${createPaletteEnumPart('turquoise')}
}`

  await write(
    './palette.ts',
    [colorsEnum, colorsConstants, colorEntriesConstants, allColorEntriesConstant, paletteEnum].join('\n\n') + '\n'
  )
}
