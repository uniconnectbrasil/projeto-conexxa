ADR-001 — Arquitetura e tecnologias do projeto

- *Situação:* Proposta
- *Data:* 2026-10-23
- *Participantes:* Eric, Guilherme, Juliano, Kauã, Paulo e Pedro

Contexto

O projeto Connexa precisa de uma arquitetura que facilite o desenvolvimento, a manutenção e a organização do código, permitindo que os integrantes da equipe trabalhem em diferentes partes do sistema. Por isso, é necessário definir tecnologias e padrões comuns para orientar o desenvolvimento.

Decisão

Adotar uma arquitetura com frontend separado do tipo SPA (*Single Page Application*) e backend desenvolvido com NestJS e TypeScript.

O frontend utilizará React com TypeScript, enquanto o backend utilizará NestJS com TypeScript. O backend será organizado em módulos para separar responsabilidades, facilitar a manutenção e permitir a evolução do sistema.

O banco de dados e as ferramentas de migração serão definidos conforme os padrões acordados pela equipe.

Alternativas consideradas

*1. Backend com Java e Spring Boot*

Não foi adotado nesta proposta, que prioriza NestJS e TypeScript para o backend.

*2. Arquitetura de microsserviços*

Adicionaria complexidade de infraestrutura e comunicação entre serviços para o escopo atual do projeto.

*3. JavaScript sem TypeScript*

Não foi escolhido porque o TypeScript oferece verificação de tipos, ajudando a identificar erros durante o desenvolvimento.

Consequências

- *Positivas:* melhor organização do código, separação de responsabilidades, uso de TypeScript no frontend e backend e maior facilidade para manter os módulos organizados.
- *Negativas:* a equipe precisará aprender e manter as tecnologias escolhidas e respeitar a separação de responsabilidades entre os módulos.
- *Como verificar:* executar as verificações automatizadas e a CI do repositório, incluindo testes do backend, lint, testes e build do frontend.