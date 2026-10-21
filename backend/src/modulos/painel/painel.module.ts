import { Module } from '@nestjs/common'

/**
 * Módulo **Painel**.
 *
 * Visão consolidada para o estudante e para a coordenação, montada a partir dos dados publicados pelos outros módulos.
 *
 * Regras deste módulo (valem para todos):
 * - Somente o que `index.ts` exporta forma a API do módulo; os arquivos de `internal/`
 *   não podem ser importados por outros módulos.
 * - Os dados do módulo ficam no schema `painel` do PostgreSQL e só este módulo os acessa.
 * - Reações a fatos de outros módulos acontecem por eventos, nunca por acesso direto aos dados.
 *
 * O módulo começa vazio. As fatias verticais são criadas a partir das Tasks do Azure Boards.
 */
@Module({
  // Registre aqui os controllers e os serviços de internal/, por exemplo:
  //   controllers: [MinhaFatiaController],
  //   providers: [MinhaFatia],
  controllers: [],
  providers: [],
  exports: [],
})
export class PainelModule {}