import {
  type ArgumentsHost,
  BadRequestException,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import type { ValidationError } from 'class-validator'
import type { Response } from 'express'
import { STATUS_CODES } from 'node:http'
import { ErroDeNegocio } from '../erro-de-negocio.js'

export const DADOS_INVALIDOS = 'DADOS_INVALIDOS'

/** Erro de validação da entrada, com a primeira mensagem de cada campo inválido. */
export class ErroDeDadosInvalidos extends BadRequestException {
  constructor(readonly campos: Record<string, string>) {
    super('Um ou mais campos estão inválidos.')
  }
}

/** Converte os erros do class-validator no mapa `campos` (campo → primeira mensagem). */
export function paraCampos(erros: ValidationError[], prefixo = ''): Record<string, string> {
  const campos: Record<string, string> = {}
  for (const erro of erros) {
    const nome = prefixo ? `${prefixo}.${erro.property}` : erro.property
    const mensagem = Object.values(erro.constraints ?? {})[0]
    if (mensagem && !(nome in campos)) campos[nome] = mensagem
    Object.assign(campos, paraCampos(erro.children ?? [], nome))
  }
  return campos
}

/**
 * Converte erros em respostas no formato *Problem Detail* (RFC 9457), com a propriedade
 * `codigo` quando o erro é conhecido.
 *
 * - `ErroDeNegocio`: status e código definidos por quem lançou o erro.
 * - Falha de validação: 400, código `DADOS_INVALIDOS` e `campos` com a mensagem de cada campo.
 * - Demais erros HTTP do Nest (por exemplo, rota inexistente): status do erro, sem `codigo`.
 */
@Catch()
export class TratamentoDeErros implements ExceptionFilter {
  private readonly registro = new Logger(TratamentoDeErros.name)

  catch(erro: unknown, host: ArgumentsHost): void {
    const resposta = host.switchToHttp().getResponse<Response>()
    const { status, corpo } = this.problema(erro)
    resposta.status(status).type('application/problem+json').json(corpo)
  }

  private problema(erro: unknown): { status: number; corpo: Record<string, unknown> } {
    if (erro instanceof ErroDeNegocio) {
      return problema(erro.status, erro.message, { codigo: erro.codigo })
    }
    if (erro instanceof ErroDeDadosInvalidos) {
      return problema(HttpStatus.BAD_REQUEST, erro.message, { codigo: DADOS_INVALIDOS, campos: erro.campos })
    }
    if (erro instanceof HttpException) {
      return problema(erro.getStatus(), erro.message)
    }
    this.registro.error(erro)
    return problema(HttpStatus.INTERNAL_SERVER_ERROR, 'Ocorreu um erro inesperado no servidor.')
  }
}

function problema(status: number, detail: string, extras: Record<string, unknown> = {}) {
  return { status, corpo: { status, title: STATUS_CODES[status] ?? 'Erro', detail, ...extras } }
}
