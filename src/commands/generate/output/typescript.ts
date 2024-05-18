import { Output } from './output.types'
import { write } from 'bun'

export const typescriptOutput: Output = async result => {
  const content = `export enum Palette {
  // -- Section
  Canvas = '${result.canvas}',
  Section = '${result.section}',
  SectionHighlight = '${result.sectionHighlight}',
  Outline = '${result.outline}',

  // -- Type
  Type = '${result.typeBody}',
  TypeHighlight = '${result.type}',
  TypeDemote = '${result.typeDemote}',

  // -- Status
  // Ember (red)
  Ember = '${result.red}',
  EmberDemote = '${result.redDemote}',
  EmberSection = '${result.redSection}',
  // Frog (green)
  Frog = '${result.green}',
  FrogDemote = '${result.greenDemote}',
  FrogSection = '${result.greenSection}',
  // Rain (blue)
  Rain = '${result.blue}',
  RainDemote = '${result.blueDemote}',
  RainSection = '${result.blueSection}',
  // Bolt (yellow)
  Bolt = '${result.yellow}',
  BoltDemote = '${result.yellowDemote}',
  BoltSection = '${result.yellowSection}',
}`

  await write('./typescript.ts', content)
}
