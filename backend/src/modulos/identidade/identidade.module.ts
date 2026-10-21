import { type MiddlewareConsumer, Module, type NestModule, RequestMethod } from '@nestjs/common'
import { UsuarioAtual } from './usuario-atual.js'
import { SessaoSimuladaController } from './internal/sessao-simulada.controller.js'
import { ContextoDaRequisicao, UsuarioSimulado } from './internal/usuario-simulado.js'

/**
 * Módulo **Identidade**: quem é o estudante que está usando o Connexa.
 *
 * **Sprint 1 — autenticação simulada.** A autenticação real (cadastro, comprovação de e-mail,
 * senha) está fora da Sprint 1. Até lá, a API pública deste módulo (`UsuarioAtual`) devolve
 * um estudante simulado, definido em `internal/estudantes-simulados.ts`.
 *
 * Os outros módulos dependem apenas de `UsuarioAtual`. Quando a autenticação real chegar,
 * só a implementação interna deste módulo muda — nenhum outro módulo precisa ser alterado.
 */
@Module({
  controllers: [SessaoSimuladaController],
  providers: [UsuarioSimulado, { provide: UsuarioAtual, useExisting: UsuarioSimulado }],
  exports: [UsuarioAtual],
})
export class IdentidadeModule implements NestModule {
  configure(consumidor: MiddlewareConsumer): void {
    consumidor.apply(ContextoDaRequisicao).forRoutes({ path: '{*caminho}', method: RequestMethod.ALL })
  }
}
