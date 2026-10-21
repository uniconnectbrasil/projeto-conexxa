import { Module } from '@nestjs/common'

/**
 * Módulo **Grupos**.
 *
 * Grupos de estudo: criação, busca, entrada e saída de participantes, papéis dentro do grupo.
 *
 * Regras deste módulo (valem para todos):
 * - Somente o que `index.ts` exporta forma a API do módulo; os arquivos de `internal/`
 *   não podem ser importados por outros módulos.
 * - Os dados do módulo ficam no schema `grupos` do PostgreSQL e só este módulo os acessa.
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
export class GruposModule {}