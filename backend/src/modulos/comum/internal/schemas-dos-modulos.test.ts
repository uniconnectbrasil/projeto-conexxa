// Garante que o banco tem um schema para cada módulo (regra: cada módulo é dono dos seus dados).
import { describe, expect, it } from 'vitest'
import { executarNoBancoDeTeste } from '../../../../test/apoio/banco-de-teste.js'

const MODULOS = ['identidade', 'perfil', 'grupos', 'encontros', 'acompanhamento', 'painel', 'materiais']

describe('Arquitetura: um schema por módulo', () => {
  it('cada módulo tem o seu schema no banco', async () => {
    const { rows } = await executarNoBancoDeTeste('select schema_name from information_schema.schemata')
    const schemas = rows.map((linha: { schema_name: string }) => linha.schema_name)

    expect(schemas).toEqual(expect.arrayContaining(MODULOS))
  })
})
