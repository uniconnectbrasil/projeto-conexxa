import { Controller, Get } from '@nestjs/common'
import { ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger'
import type { EstudanteSimulado } from './estudantes-simulados.js'
import { UsuarioSimulado } from './usuario-simulado.js'

export class Sessao {
  @ApiProperty() chave: string
  @ApiProperty() id: string
  @ApiProperty() nome: string
  @ApiProperty() email: string
  @ApiProperty() simulado: boolean

  static de(estudante: EstudanteSimulado): Sessao {
    return { ...estudante, simulado: true }
  }
}

/**
 * Endpoints de apoio à simulação: qual estudante está "logado" e quais podem ser escolhidos.
 * O front-end usa estes endpoints no seletor de estudante simulado.
 */
@ApiTags('identidade')
@Controller('api/identidade')
export class SessaoSimuladaController {
  constructor(private readonly usuarioSimulado: UsuarioSimulado) {}

  @Get('sessao')
  @ApiResponse({ status: 200, type: Sessao })
  sessao(): Sessao {
    return Sessao.de(this.usuarioSimulado.estudanteDaRequisicao())
  }

  @Get('usuarios-simulados')
  @ApiResponse({ status: 200, type: [Sessao] })
  usuariosSimulados(): Sessao[] {
    return this.usuarioSimulado.todos().map((estudante) => Sessao.de(estudante))
  }
}
