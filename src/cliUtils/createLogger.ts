import verba, { OutletFilter, consoleTransport } from 'verba'

export const createLogger = <TData = any>(prefix?: string, outletFilters?: OutletFilter<any, TData>[]) =>
  verba<undefined, TData>({
    transports: [
      consoleTransport({
        deltaT: true,
        timePrefix: true,
        prefix,
        dataRenderer: false,
      }),
    ],
    outletFilters: outletFilters ?? [],
  })
