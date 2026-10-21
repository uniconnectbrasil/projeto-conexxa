/**
 * Endereço do PostgreSQL, montado a partir das variáveis CONNEXA_DB_*.
 * Os padrões funcionam com o PostgreSQL do docker-compose.yml e do Codespaces.
 * O mesmo cálculo está em prisma.config.ts, usado pela CLI do Prisma.
 */
export function urlDoBanco(): string {
  const variavel = (nome: string, padrao: string) => process.env[nome] || padrao
  const usuario = encodeURIComponent(variavel('CONNEXA_DB_USUARIO', 'connexa'))
  const senha = encodeURIComponent(variavel('CONNEXA_DB_SENHA', 'connexa'))
  const host = variavel('CONNEXA_DB_HOST', 'localhost')
  const porta = variavel('CONNEXA_DB_PORTA', '5432')
  const banco = variavel('CONNEXA_DB_NOME', 'connexa')
  return `postgresql://${usuario}:${senha}@${host}:${porta}/${banco}`
}
