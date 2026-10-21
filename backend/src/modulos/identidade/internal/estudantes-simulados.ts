/** Estudante fictício usado enquanto a autenticação real não existe. */
export interface EstudanteSimulado {
  /** Identificador curto usado no cabeçalho X-Connexa-Usuario-Simulado. */
  chave: string
  id: string
  nome: string
  email: string
}

/**
 * Estudantes simulados disponíveis. O primeiro é o padrão; os outros são escolhidos
 * pelo cabeçalho `X-Connexa-Usuario-Simulado: <chave>`.
 */
export const ESTUDANTES_SIMULADOS: readonly EstudanteSimulado[] = [
  {
    chave: 'alice',
    id: '00000000-0000-0000-0000-00000000a11c',
    nome: 'Alice Prado',
    email: 'alice.prado@instituicao.example',
  },
  {
    chave: 'bento',
    id: '00000000-0000-0000-0000-00000000be70',
    nome: 'Bento Ramos',
    email: 'bento.ramos@instituicao.example',
  },
  {
    chave: 'cecilia',
    id: '00000000-0000-0000-0000-0000000ce011',
    nome: 'Cecília Torres',
    email: 'cecilia.torres@instituicao.example',
  },
]
