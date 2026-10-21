-- Cria um schema para cada módulo: cada módulo é dono dos seus dados.
-- Primeira migração do modelo; não a altere. Novos módulos ganham schema em uma nova migração.
CREATE SCHEMA IF NOT EXISTS "identidade";
CREATE SCHEMA IF NOT EXISTS "perfil";
CREATE SCHEMA IF NOT EXISTS "grupos";
CREATE SCHEMA IF NOT EXISTS "encontros";
CREATE SCHEMA IF NOT EXISTS "acompanhamento";
CREATE SCHEMA IF NOT EXISTS "painel";
CREATE SCHEMA IF NOT EXISTS "materiais";
