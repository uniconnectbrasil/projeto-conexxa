# modulos/encontros/internal

Tudo o que é privado do módulo **Encontros**: controllers, serviços, DTOs e testes de aceitação.

- Outros módulos não podem importar nada daqui (o lint e o teste de arquitetura conferem).
- O que outro módulo precisar é exportado em `../index.ts`.
