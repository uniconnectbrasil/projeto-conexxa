import 'reflect-metadata'
import type { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach } from 'vitest'
import { AppModule } from '../../src/app.module.js'
import { configurarAplicacao } from '../../src/modulos/comum/index.js'
import { esvaziarTabelas } from './banco-de-teste.js'

/** Cabeçalho que escolhe o estudante simulado da requisição. */
export const CABECALHO_DO_USUARIO_SIMULADO = 'X-Connexa-Usuario-Simulado'

/**
 * Prepara um arquivo de testes de aceitação no nível da API.
 *
 * - Sobe a aplicação inteira, com a mesma configuração do `main.ts`.
 * - Usa o banco `connexa_teste`, recriado antes da suíte pelas migrações.
 * - Antes de cada teste, todas as tabelas são esvaziadas: um teste nunca vê os dados de outro.
 *
 * Convenção: um arquivo por história (`<historia>.aceitacao.test.ts`), um `describe` com o nome
 * da funcionalidade e um `it('Cenário: <nome exato do cenário>')` por cenário Gherkin.
 *
 * ```ts
 * describe('Funcionalidade: ...', () => {
 *   const { api } = usarTesteDeAceitacao()
 *   it('Cenário: ...', async () => {
 *     const resposta = await api().get('/api/...').set(CABECALHO_DO_USUARIO_SIMULADO, 'bento')
 *     expect(resposta.status).toBe(200)
 *   })
 * })
 * ```
 */
export function usarTesteDeAceitacao(): { api: () => ReturnType<typeof request> } {
  let aplicacao: INestApplication

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({ imports: [AppModule] }).compile()
    aplicacao = configurarAplicacao(modulo.createNestApplication({ logger: false }))
    await aplicacao.init()
  })

  beforeEach(async () => {
    await esvaziarTabelas()
  })

  afterAll(async () => {
    await aplicacao?.close()
  })

  return { api: () => request(aplicacao.getHttpServer()) }
}
