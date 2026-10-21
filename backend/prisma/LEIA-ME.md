# Migrações do banco (Prisma Migrate)

O esquema do banco muda **somente** por migrações. Nunca altere tabelas à mão nem use `prisma db push`.

## Primeira tabela de um módulo

1. Declare o model em `prisma/schema.prisma`, no schema do módulo, com nomes de tabela e coluna em `snake_case`:
   ```prisma
   model Grupo {
     id        String   @id @db.Uuid
     nome      String
     criadoPor String   @map("criado_por") @db.Uuid
     criadoEm  DateTime @default(now()) @map("criado_em")

     @@map("grupo")
     @@schema("grupos")
   }
   ```
2. Crie a migração e confira o SQL gerado antes do commit:
   ```bash
   npm run banco:nova-migracao -- cria_tabela_grupo
   ```
3. Aplique-a no banco de desenvolvimento com `npm run banco:migrar` (o `npm run dev` também aplica). Os testes aplicam todas as migrações no banco de teste antes da suíte.

- O Prisma Migrate cria a pasta `prisma/migrations/<AAAAMMDDHHMMSS>_<nome>/migration.sql`. A data e a hora evitam que duas pessoas criem a mesma migração em branches diferentes.
- O cliente do Prisma é gerado em `src/generated/prisma` (`npm install` e `npm run verificar` geram de novo). Essa pasta não é versionada.

## O que não fazer

- Não edite uma migração que já foi integrada no `main`. Para mudar algo, crie uma nova migração.
- Não crie relação (`@relation`) com model de outro módulo. Guarde apenas o identificador (por exemplo, `estudanteId String @map("estudante_id") @db.Uuid`). O `arquitetura-modular.test.ts` confere.
- Não leia nem escreva models de outro módulo pelo `BancoDeDados`.

Os schemas de todos os módulos já existem: a migração `00000000000000_schemas_dos_modulos` os cria.
