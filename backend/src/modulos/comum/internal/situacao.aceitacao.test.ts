// Exemplo do modelo — cenários em docs/exemplo/situacao-do-sistema.feature.
import { describe, expect, it } from 'vitest'
import { usarTesteDeAceitacao } from '../../../../test/apoio/teste-de-aceitacao.js'
import { DISPONIVEL } from './situacao.controller.js'

describe('Funcionalidade: situação do sistema', () => {
  const { api } = usarTesteDeAceitacao()

  it('Cenário: aplicação e banco disponíveis', async () => {
    const resposta = await api().get('/api/situacao')

    expect(resposta.status).toBe(200)
    expect(resposta.body.aplicacao).toBe(DISPONIVEL)
    expect(resposta.body.banco).toBe(DISPONIVEL)
    expect(resposta.body.versao).toMatch(/\S/)
  })
})
