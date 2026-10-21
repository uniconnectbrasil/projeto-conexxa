/**
 * Verificação automática das fronteiras entre módulos.
 *
 * O lint (eslint-plugin-boundaries) aponta as importações proibidas no editor; este teste
 * confere as mesmas regras em todo build, mais o que o lint não alcança:
 *
 * - de fora de um módulo, só se importa o `index.ts` dele — nunca arquivos internos;
 * - o módulo `comum` não depende de nenhum módulo de negócio;
 * - não há dependência circular entre módulos;
 * - todo model e enum do Prisma pertence ao schema de um módulo, sem relação com models de outro.
 *
 * **Nunca desative, ignore ou altere este teste para o build passar.**
 * Se ele falhar, a mudança precisa ser refeita respeitando as fronteiras.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const SRC = dirname(fileURLToPath(import.meta.url))
const MODULOS_DIR = join(SRC, 'modulos')
const MODULOS = readdirSync(MODULOS_DIR).filter((nome) => statSync(join(MODULOS_DIR, nome)).isDirectory())

interface Importacao {
  arquivo: string
  destino: string
}

function arquivosTs(pasta: string): string[] {
  return readdirSync(pasta).flatMap((nome) => {
    const caminho = join(pasta, nome)
    if (statSync(caminho).isDirectory()) return nome === 'generated' ? [] : arquivosTs(caminho)
    return caminho.endsWith('.ts') ? [caminho] : []
  })
}

function importacoesLocais(arquivo: string): Importacao[] {
  const codigo = readFileSync(arquivo, 'utf8')
  const padrao = /(?:import|export)\s[^'"]*?from\s*['"]([^'"]+)['"]|import\s*\(\s*['"]([^'"]+)['"]\s*\)|import\s+['"]([^'"]+)['"]/g
  return [...codigo.matchAll(padrao)]
    .map((encontrado) => encontrado[1] ?? encontrado[2] ?? encontrado[3])
    .filter((especificador) => especificador.startsWith('.'))
    .map((especificador) => ({
      arquivo,
      destino: resolve(dirname(arquivo), especificador).replace(/\.js$/, '.ts'),
    }))
}

function moduloDe(caminho: string): string | undefined {
  const partes = relative(MODULOS_DIR, caminho).split(sep)
  return partes[0] && partes[0] !== '..' ? partes[0] : undefined
}

const nomeRelativo = (caminho: string) => relative(SRC, caminho).split(sep).join('/')
const importacoes = arquivosTs(SRC).flatMap(importacoesLocais)

describe('Arquitetura: monolito modular', () => {
  it('cada módulo tem index.ts (API pública) e <modulo>.module.ts', () => {
    for (const modulo of MODULOS) {
      const arquivos = readdirSync(join(MODULOS_DIR, modulo))
      expect(arquivos, `Módulo ${modulo}`).toContain('index.ts')
      expect(arquivos, `Módulo ${modulo}`).toContain(`${modulo}.module.ts`)
    }
  })

  it('de fora de um módulo, só se importa o index.ts dele', () => {
    const violacoes = importacoes
      .filter(({ arquivo, destino }) => {
        const alvo = moduloDe(destino)
        return alvo !== undefined && moduloDe(arquivo) !== alvo && destino !== join(MODULOS_DIR, alvo, 'index.ts')
      })
      .map(({ arquivo, destino }) => `${nomeRelativo(arquivo)} → ${nomeRelativo(destino)}`)

    expect(violacoes, 'Importe outro módulo apenas pelo seu index.ts').toEqual([])
  })

  it('o módulo comum não depende de nenhum módulo de negócio', () => {
    const violacoes = importacoes
      .filter(({ arquivo, destino }) => moduloDe(arquivo) === 'comum' && moduloDe(destino) !== undefined && moduloDe(destino) !== 'comum')
      .map(({ arquivo, destino }) => `${nomeRelativo(arquivo)} → ${nomeRelativo(destino)}`)

    expect(violacoes, 'O módulo comum não pode conter regra de negócio nem usar outros módulos').toEqual([])
  })

  it('os módulos não têm dependências circulares', () => {
    const grafo = new Map<string, Set<string>>(MODULOS.map((modulo) => [modulo, new Set<string>()]))
    for (const { arquivo, destino } of importacoes) {
      const origem = moduloDe(arquivo)
      const alvo = moduloDe(destino)
      if (origem && alvo && origem !== alvo) grafo.get(origem)?.add(alvo)
    }

    const ciclos: string[] = []
    const visitar = (modulo: string, caminho: string[]) => {
      for (const proximo of grafo.get(modulo) ?? []) {
        if (proximo === caminho[0]) ciclos.push([...caminho, proximo].join(' → '))
        else if (!caminho.includes(proximo)) visitar(proximo, [...caminho, proximo])
      }
    }
    MODULOS.forEach((modulo) => visitar(modulo, [modulo]))

    expect(ciclos, 'Dependência circular entre módulos').toEqual([])
  })

  it('todo model e enum do Prisma pertence ao schema de um módulo, sem relação com models de outro', () => {
    const esquema = readFileSync(join(SRC, '..', 'prisma', 'schema.prisma'), 'utf8')
    const blocos = [...esquema.matchAll(/^(model|enum)\s+(\w+)\s*\{([\s\S]*?)^\}/gm)].map(([, tipo, nome, corpo]) => ({
      tipo,
      nome,
      corpo,
      schema: /@@schema\("(\w+)"\)/.exec(corpo)?.[1],
    }))
    const schemaDe = new Map(blocos.map((bloco) => [bloco.nome, bloco.schema]))

    const violacoes = blocos.flatMap(({ tipo, nome, corpo, schema }) => {
      if (!schema || !MODULOS.includes(schema)) return [`${tipo} ${nome}: declare @@schema("<modulo>")`]
      if (tipo !== 'model') return []
      return corpo
        .split('\n')
        .map((linha) => /^\s*\w+\s+(\w+)/.exec(linha)?.[1])
        .filter((tipoDoCampo): tipoDoCampo is string => !!tipoDoCampo && schemaDe.has(tipoDoCampo))
        .filter((tipoDoCampo) => schemaDe.get(tipoDoCampo) !== schema)
        .map((tipoDoCampo) => `model ${nome} (${schema}) referencia ${tipoDoCampo} (${schemaDe.get(tipoDoCampo)})`)
    })

    expect(violacoes, 'Cada módulo é dono dos seus dados; guarde só o identificador de outro módulo').toEqual([])
  })
})
