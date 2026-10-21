import { Controller, Get, HttpStatus, Res } from '@nestjs/common'
import { ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger'
import type { Response } from 'express'
import { BancoDeDados } from '../banco-de-dados.js'
import { versaoDaAplicacao } from './versao.js'

export const DISPONIVEL = 'disponivel'
export const INDISPONIVEL = 'indisponivel'

export class Situacao {
  @ApiProperty({ enum: [DISPONIVEL, INDISPONIVEL] }) aplicacao: string
  @ApiProperty({ enum: [DISPONIVEL, INDISPONIVEL] }) banco: string
  @ApiProperty() versao: string
}

/**
 * Fatia de exemplo do modelo: informa se a aplicação e o banco estão disponíveis.
 *
 * Não é uma funcionalidade do Connexa. Existe para mostrar, de ponta a ponta, o caminho que
 * toda fatia percorre: endpoint, teste de aceitação com o nome do cenário e tela no front-end.
 */
@ApiTags('comum')
@Controller('api/situacao')
export class SituacaoController {
  constructor(private readonly banco: BancoDeDados) {}

  @Get()
  @ApiResponse({ status: HttpStatus.OK, type: Situacao })
  @ApiResponse({ status: HttpStatus.SERVICE_UNAVAILABLE, type: Situacao })
  async consultar(@Res({ passthrough: true }) resposta: Response): Promise<Situacao> {
    const bancoDisponivel = await this.bancoResponde()
    resposta.status(bancoDisponivel ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE)
    return { aplicacao: DISPONIVEL, banco: bancoDisponivel ? DISPONIVEL : INDISPONIVEL, versao: versaoDaAplicacao }
  }

  private async bancoResponde(): Promise<boolean> {
    try {
      const [linha] = await this.banco.$queryRaw<{ um: number }[]>`select 1 as um`
      return linha?.um === 1
    } catch {
      return false
    }
  }
}
