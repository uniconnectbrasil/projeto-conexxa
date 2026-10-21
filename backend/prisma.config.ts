// Configuração da CLI do Prisma (migrações e geração do cliente).
// A conexão vem das variáveis CONNEXA_DB_*, com os mesmos padrões do back-end.
import { defineConfig } from 'prisma/config'

function urlDoBanco(): string {
  const variavel = (nome: string, padrao: string) => process.env[nome] || padrao
  const usuario = encodeURIComponent(variavel('CONNEXA_DB_USUARIO', 'connexa'))
  const senha = encodeURIComponent(variavel('CONNEXA_DB_SENHA', 'connexa'))
  const host = variavel('CONNEXA_DB_HOST', 'localhost')
  const porta = variavel('CONNEXA_DB_PORTA', '5432')
  const banco = variavel('CONNEXA_DB_NOME', 'connexa')
  return `postgresql://${usuario}:${senha}@${host}:${porta}/${banco}`
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: urlDoBanco(),
  },
})
