import js from '@eslint/js'
import boundaries from 'eslint-plugin-boundaries'
import globals from 'globals'
import tseslint from 'typescript-eslint'

// Fronteiras do back-end: cada pasta em src/modulos/ é um módulo.
// De fora de um módulo, só se importa o index.ts dele; o módulo comum não usa módulos de negócio.
// O teste src/arquitetura-modular.test.ts confere as mesmas regras em todo build.
const fronteirasEntreModulos = {
  plugins: { boundaries },
  settings: {
    'import/resolver': { typescript: { project: './tsconfig.json' } },
    'boundaries/elements': [
      { type: 'comum', pattern: 'src/modulos/comum' },
      { type: 'modulo', pattern: 'src/modulos/*', capture: ['nome'] },
      { type: 'gerado', pattern: 'src/generated' },
      { type: 'aplicacao', pattern: 'src' },
      { type: 'apoio-de-teste', pattern: 'test' },
    ],
  },
  rules: {
    'boundaries/dependencies': [
      'error',
      {
        default: 'allow',
        policies: [
          {
            disallow: { to: { element: { types: ['modulo', 'comum'] } } },
            message:
              'Importe outro módulo apenas pelo seu index.ts (por exemplo, "../../grupos/index.js"). Os arquivos internos de um módulo são privados.',
          },
          { allow: { to: { element: { types: ['modulo', 'comum'], fileInternalPath: 'index.ts' } } } },
          { allow: { dependency: { relationship: { to: 'internal' } } } },
          {
            from: { element: { type: 'comum' } },
            disallow: { to: { element: { type: 'modulo' } } },
            message: 'O módulo comum não pode conter regra de negócio nem usar outros módulos.',
          },
        ],
      },
    ],
  },
}

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'src/generated'] },
  {
    files: ['**/*.ts'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.node,
    },
    ...fronteirasEntreModulos,
  },
)
