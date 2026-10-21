// Ponto de entrada do back-end do Connexa.
import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module.js'
import { configurarAplicacao } from './modulos/comum/index.js'

const aplicacao = configurarAplicacao(await NestFactory.create(AppModule))
await aplicacao.listen(Number(process.env.CONNEXA_PORTA || 8080), '0.0.0.0')
