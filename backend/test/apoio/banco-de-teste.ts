import pg from 'pg'

/**
 * Banco usado pelos testes: `connexa_teste`, separado do banco de desenvolvimento.
 * Só existe no código de teste: o banco de desenvolvimento nunca é apagado.
 */
export const NOME_DO_BANCO_DE_TESTE = process.env.CONNEXA_DB_TESTE || 'connexa_teste'

function conexao(): pg.Client {
  const variavel = (nome: string, padrao: string) => process.env[nome] || padrao
  return new pg.Client({
    host: variavel('CONNEXA_DB_HOST', 'localhost'),
    port: Number(variavel('CONNEXA_DB_PORTA', '5432')),
    user: variavel('CONNEXA_DB_USUARIO', 'connexa'),
    password: variavel('CONNEXA_DB_SENHA', 'connexa'),
    database: NOME_DO_BANCO_DE_TESTE,
    connectionTimeoutMillis: 5000,
  })
}

export async function executarNoBancoDeTeste(sql: string): Promise<pg.QueryResult> {
  const cliente = conexao()
  await cliente.connect()
  try {
    return await cliente.query(sql)
  } finally {
    await cliente.end()
  }
}

/** Apaga todos os schemas criados pelas migrações e o histórico do Prisma. */
export function apagarSchemas(): Promise<pg.QueryResult> {
  return executarNoBancoDeTeste(`
    do $$
    declare s record;
    begin
      for s in select schema_name from information_schema.schemata
               where schema_name not in ('public', 'information_schema')
                 and schema_name not like 'pg\\_%'
      loop
        execute format('drop schema %I cascade', s.schema_name);
      end loop;
      drop table if exists public._prisma_migrations;
    end $$;`)
}

/** Esvazia todas as tabelas, menos o histórico de migrações: um teste nunca vê os dados de outro. */
export function esvaziarTabelas(): Promise<pg.QueryResult> {
  return executarNoBancoDeTeste(`
    do $$
    declare t record;
    begin
      for t in select table_schema, table_name from information_schema.tables
               where table_type = 'BASE TABLE'
                 and table_schema not in ('information_schema')
                 and table_schema not like 'pg\\_%'
                 and table_name <> '_prisma_migrations'
      loop
        execute format('truncate table %I.%I cascade', t.table_schema, t.table_name);
      end loop;
    end $$;`)
}
