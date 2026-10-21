import { type INestApplication, ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { ErroDeDadosInvalidos, paraCampos, TratamentoDeErros } from './tratamento-de-erros.js'
import { versaoDaAplicacao } from './versao.js'

/**
 * Configuração comum da aplicação HTTP, usada pelo main.ts e pelos testes de aceitação:
 * validação da entrada, formato dos erros e documentação OpenAPI.
 *
 * Contrato em JSON: `/v3/api-docs` · Interface navegável: `/swagger-ui`.
 */
export function configurarAplicacao(aplicacao: INestApplication): INestApplication {
  aplicacao.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (erros) => new ErroDeDadosInvalidos(paraCampos(erros)),
    }),
  )
  aplicacao.useGlobalFilters(new TratamentoDeErros())

  const documento = new DocumentBuilder()
    .setTitle('Connexa — API')
    .setVersion(versaoDaAplicacao)
    .setDescription('API do Connexa. Cada operação pertence a um módulo; o prefixo da rota indica qual.')
    .build()
  SwaggerModule.setup('swagger-ui', aplicacao, () => SwaggerModule.createDocument(aplicacao, documento), {
    jsonDocumentUrl: 'v3/api-docs',
  })

  return aplicacao
}
