/**
 * Violação de uma regra de negócio que deve chegar ao cliente como resposta de erro.
 *
 * É convertida em um *Problem Detail* (RFC 9457) com a propriedade `codigo`, que os testes
 * de aceitação e o front-end usam para identificar o erro sem depender do texto da mensagem.
 *
 * ```ts
 * throw new ErroDeNegocio(HttpStatus.UNPROCESSABLE_ENTITY,
 *   'GRUPO_LOTADO', 'O grupo já atingiu o número máximo de participantes.')
 * ```
 *
 * Convenções: `codigo` em MAIÚSCULAS_COM_SUBLINHADO; 404 para recurso inexistente,
 * 409 para conflito de estado, 422 para regra de negócio violada.
 */
export class ErroDeNegocio extends Error {
  constructor(
    readonly status: number,
    readonly codigo: string,
    mensagem: string,
  ) {
    super(mensagem)
    this.name = 'ErroDeNegocio'
  }
}
