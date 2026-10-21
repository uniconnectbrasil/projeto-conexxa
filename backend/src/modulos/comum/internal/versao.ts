import { readFileSync } from 'node:fs'

/** Versão da aplicação, lida do package.json do back-end. */
export const versaoDaAplicacao: string = (
  JSON.parse(readFileSync(new URL('../../../../package.json', import.meta.url), 'utf8')) as { version: string }
).version
