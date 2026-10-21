// Testes de unidade da conversão dos erros de validação no mapa `campos`.
import 'reflect-metadata'
import { plainToInstance } from 'class-transformer'
import { IsInt, IsNotEmpty, Max, Min, ValidateNested, validate } from 'class-validator'
import { Type } from 'class-transformer'
import { describe, expect, it } from 'vitest'
import { paraCampos } from './tratamento-de-erros.js'

class Encontro {
  @IsNotEmpty({ message: 'Informe o local.' })
  local: string
}

class NovoGrupo {
  @IsNotEmpty({ message: 'Informe o nome.' })
  nome: string

  @IsInt({ message: 'Informe um número inteiro de vagas.' })
  @Min(2, { message: 'O grupo deve ter de 2 a 6 vagas.' })
  @Max(6, { message: 'O grupo deve ter de 2 a 6 vagas.' })
  vagas: number

  @ValidateNested()
  @Type(() => Encontro)
  primeiroEncontro: Encontro
}

async function camposDe(corpo: object) {
  return paraCampos(await validate(plainToInstance(NovoGrupo, corpo)))
}

describe('Validação da entrada', () => {
  it('aceita dados válidos', async () => {
    expect(await camposDe({ nome: 'Cálculo I', vagas: 4, primeiroEncontro: { local: 'Biblioteca' } })).toEqual({})
  })

  it('aponta cada campo inválido com uma única mensagem', async () => {
    const campos = await camposDe({ nome: '', vagas: 9, primeiroEncontro: { local: 'Biblioteca' } })

    expect(campos).toEqual({ nome: 'Informe o nome.', vagas: expect.any(String) })
  })

  it('aponta campos inválidos de objetos aninhados pelo caminho completo', async () => {
    const campos = await camposDe({ nome: 'Cálculo I', vagas: 4, primeiroEncontro: { local: '' } })

    expect(campos).toEqual({ 'primeiroEncontro.local': 'Informe o local.' })
  })
})
