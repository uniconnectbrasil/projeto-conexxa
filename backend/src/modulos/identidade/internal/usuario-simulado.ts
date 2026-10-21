import { HttpStatus, Injectable, type NestMiddleware } from '@nestjs/common'
import type { NextFunction, Request, Response } from 'express'
import { AsyncLocalStorage } from 'node:async_hooks'
import { ErroDeNegocio } from '../../comum/index.js'
import { UsuarioAtual, type UsuarioAutenticado } from '../usuario-atual.js'
import { ESTUDANTES_SIMULADOS, type EstudanteSimulado } from './estudantes-simulados.js'

export const CABECALHO = 'X-Connexa-Usuario-Simulado'
export const USUARIO_SIMULADO_INEXISTENTE = 'USUARIO_SIMULADO_INEXISTENTE'

/** Chave do estudante simulado informada na requisição em andamento. */
const requisicaoAtual = new AsyncLocalStorage<string | undefined>()

/** Guarda o cabeçalho de cada requisição para que `UsuarioSimulado` o encontre. */
@Injectable()
export class ContextoDaRequisicao implements NestMiddleware {
  use(requisicao: Request, _resposta: Response, proximo: NextFunction): void {
    const valor = requisicao.header(CABECALHO)?.trim()
    requisicaoAtual.run(valor ? valor : undefined, proximo)
  }
}

/**
 * Implementação temporária de `UsuarioAtual` para a Sprint 1.
 *
 * O estudante é escolhido pelo cabeçalho `X-Connexa-Usuario-Simulado`, cujo valor é a chave
 * de um estudante simulado. Sem o cabeçalho, vale o primeiro estudante da lista. Isso permite
 * testar cenários com mais de um estudante (por exemplo, um cria o grupo e outro entra nele).
 *
 * Será substituída pela autenticação real em uma sprint futura.
 */
@Injectable()
export class UsuarioSimulado extends UsuarioAtual {
  obter(): UsuarioAutenticado {
    const { id, nome, email } = this.estudanteDaRequisicao()
    return { id, nome, email }
  }

  /** @returns o estudante simulado da requisição atual, com a sua chave */
  estudanteDaRequisicao(): EstudanteSimulado {
    const chave = requisicaoAtual.getStore()
    return chave === undefined ? ESTUDANTES_SIMULADOS[0] : this.buscarPelaChave(chave)
  }

  todos(): readonly EstudanteSimulado[] {
    return ESTUDANTES_SIMULADOS
  }

  private buscarPelaChave(chave: string): EstudanteSimulado {
    const estudante = ESTUDANTES_SIMULADOS.find((candidato) => candidato.chave === chave)
    if (!estudante) {
      throw new ErroDeNegocio(
        HttpStatus.BAD_REQUEST,
        USUARIO_SIMULADO_INEXISTENTE,
        `Não existe estudante simulado com a chave '${chave}'.`,
      )
    }
    return estudante
  }
}
