import { Global, Module } from '@nestjs/common'
import { BancoDeDados } from './banco-de-dados.js'
import { SituacaoController } from './internal/situacao.controller.js'

/**
 * Módulo **Comum**: infraestrutura compartilhada, **sem regra de negócio**.
 *
 * Contém o padrão de erros da API (`ErroDeNegocio`), o acesso ao banco (`BancoDeDados`),
 * a validação de entrada, a consulta de situação do sistema e a documentação OpenAPI.
 *
 * Não coloque aqui entidades, serviços ou regras de nenhum território do Connexa.
 * "Pode ser útil para outros módulos no futuro" não é motivo para algo morar em `comum`.
 */
@Global()
@Module({
  controllers: [SituacaoController],
  providers: [BancoDeDados],
  exports: [BancoDeDados],
})
export class ComumModule {}
