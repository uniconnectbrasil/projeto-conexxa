import swc from 'unplugin-swc'
import { defineConfig } from 'vitest/config'

// O SWC compila os testes preservando os metadados dos decorators, dos quais a
// injeção de dependências do NestJS precisa.
export default defineConfig({
  plugins: [swc.vite({ module: { type: 'es6' } })],
  test: {
    include: ['src/**/*.test.ts'],
    globalSetup: ['./test/preparar-banco-de-teste.ts'],
    // Os testes de aceitação compartilham o banco de teste e, por isso, não rodam em paralelo.
    fileParallelism: false,
    env: {
      CONNEXA_DB_NOME: process.env.CONNEXA_DB_TESTE || 'connexa_teste',
    },
  },
})
