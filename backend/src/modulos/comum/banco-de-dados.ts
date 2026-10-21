import { Injectable, type OnModuleDestroy } from '@nestjs/common'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../generated/prisma/client.js'
import { urlDoBanco } from './internal/url-do-banco.js'

/**
 * Acesso ao PostgreSQL pelo Prisma. Injete `BancoDeDados` no serviço do módulo e use
 * apenas os models do schema do próprio módulo.
 *
 * ```ts
 * @Injectable()
 * class GruposDoEstudante {
 *   constructor(private readonly banco: BancoDeDados) {}
 *   listar(estudanteId: string) {
 *     return this.banco.grupo.findMany({ where: { criadoPor: estudanteId } })
 *   }
 * }
 * ```
 *
 * Cada módulo é dono dos seus dados: nenhum módulo lê ou escreve tabelas de outro.
 */
@Injectable()
export class BancoDeDados extends PrismaClient implements OnModuleDestroy {
  constructor() {
    super({ adapter: new PrismaPg({ connectionString: urlDoBanco(), connectionTimeoutMillis: 5000 }) })
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect()
  }
}
