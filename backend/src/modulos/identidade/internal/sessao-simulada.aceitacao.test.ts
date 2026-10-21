// Exemplo do modelo — cenários em docs/exemplo/sessao-simulada.feature.
//
// Repare: um `it` por cenário, com o nome do cenário; cada teste verifica o resultado observável
// descrito no cenário, incluindo o `codigo` do erro — e não apenas o status HTTP.
import { describe, expect, it } from 'vitest'
import { CABECALHO_DO_USUARIO_SIMULADO, usarTesteDeAceitacao } from '../../../../test/apoio/teste-de-aceitacao.js'
import { USUARIO_SIMULADO_INEXISTENTE } from './usuario-simulado.js'

describe('Funcionalidade: sessão do estudante simulado', () => {
  const { api } = usarTesteDeAceitacao()

  it('Cenário: sem indicação, a sessão é do primeiro estudante simulado', async () => {
    const resposta = await api().get('/api/identidade/sessao')

    expect(resposta.status).toBe(200)
    expect(resposta.body.chave).toBe('alice')
    expect(resposta.body.nome).toBe('Alice Prado')
    expect(resposta.body.simulado).toBe(true)
  })

  it('Cenário: estudante simulado escolhido pelo cabeçalho', async () => {
    const resposta = await api().get('/api/identidade/sessao').set(CABECALHO_DO_USUARIO_SIMULADO, 'bento')

    expect(resposta.status).toBe(200)
    expect(resposta.body.chave).toBe('bento')
    expect(resposta.body.nome).toBe('Bento Ramos')
  })

  it('Cenário: estudante simulado inexistente', async () => {
    const resposta = await api().get('/api/identidade/sessao').set(CABECALHO_DO_USUARIO_SIMULADO, 'zeca')

    expect(resposta.status).toBe(400)
    expect(resposta.body.codigo).toBe(USUARIO_SIMULADO_INEXISTENTE)
  })

  it('Cenário: lista dos estudantes simulados disponíveis', async () => {
    const resposta = await api().get('/api/identidade/usuarios-simulados')

    expect(resposta.status).toBe(200)
    expect(resposta.body).toHaveLength(3)
    expect(resposta.body[0].chave).toBe('alice')
  })
})
