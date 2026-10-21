/**
 * Estudante identificado na requisição atual.
 *
 * Outros módulos devem guardar apenas o `id` — nunca copiar nome ou e-mail para as próprias tabelas.
 */
export interface UsuarioAutenticado {
  /** Identificador estável do estudante (UUID). */
  id: string
  /** Nome para exibição. */
  nome: string
  /** E-mail institucional. */
  email: string
}

/**
 * API pública do módulo Identidade: informa qual estudante fez a requisição atual.
 *
 * Use sempre esta classe para saber "quem está usando o sistema". Nunca leia cabeçalhos,
 * tokens ou sessões diretamente em outros módulos.
 *
 * ```ts
 * @Injectable()
 * class MeusGrupos {
 *   constructor(private readonly usuarioAtual: UsuarioAtual) {}
 *   ...
 *   const estudante = this.usuarioAtual.obter().id
 * }
 * ```
 */
export abstract class UsuarioAtual {
  /** @returns o estudante da requisição atual */
  abstract obter(): UsuarioAutenticado
}
