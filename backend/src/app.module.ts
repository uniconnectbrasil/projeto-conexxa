import { Module } from '@nestjs/common'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { AcompanhamentoModule } from './modulos/acompanhamento/index.js'
import { ComumModule } from './modulos/comum/index.js'
import { EncontrosModule } from './modulos/encontros/index.js'
import { GruposModule } from './modulos/grupos/index.js'
import { IdentidadeModule } from './modulos/identidade/index.js'
import { MateriaisModule } from './modulos/materiais/index.js'
import { PainelModule } from './modulos/painel/index.js'
import { PerfilModule } from './modulos/perfil/index.js'

/**
 * Monta a aplicação a partir dos módulos. Não coloque regra de negócio aqui.
 *
 * Cada pasta de `src/modulos/` é um módulo. As fronteiras entre eles são verificadas pelo
 * lint (eslint-plugin-boundaries) e pelo teste `arquitetura-modular.test.ts` em todo build.
 */
@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ComumModule,
    IdentidadeModule,
    PerfilModule,
    GruposModule,
    EncontrosModule,
    AcompanhamentoModule,
    PainelModule,
    MateriaisModule,
  ],
})
export class AppModule {}
