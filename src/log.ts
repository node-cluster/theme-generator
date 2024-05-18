import { createLogger } from './cliUtils/createLogger'

export const state: { verbose: boolean } = { verbose: false }

export const log = createLogger<{ verbose?: boolean }>(undefined, [
  options => (state.verbose ? true : !options.options.data?.verbose),
])
