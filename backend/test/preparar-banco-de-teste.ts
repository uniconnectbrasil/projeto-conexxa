import { execSync } from 'node:child_process'
import { apagarSchemas, NOME_DO_BANCO_DE_TESTE } from './apoio/banco-de-teste.js'

/**
 * Executado uma vez, antes da suíte: apaga os schemas do banco de teste e aplica todas as
 * migrações do zero. Assim, sobras de execuções anteriores (ou de outro branch) nunca
 * interferem no resultado.
 */
export default async function prepararBancoDeTeste(): Promise<void> {
  await apagarSchemas()
  execSync('npx prisma migrate deploy', {
    stdio: 'pipe',
    env: { ...process.env, CONNEXA_DB_NOME: NOME_DO_BANCO_DE_TESTE },
  })
}
