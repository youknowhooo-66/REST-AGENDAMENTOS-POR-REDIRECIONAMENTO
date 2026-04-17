# Docker Setup for Development and Debugging

Este projeto agora suporta Docker para facilitar o desenvolvimento e o debug.

## Requisitos
- Docker e Docker Compose instalados.
- VS Code (opcional, para debug).

## Como rodar a aplicação

1.  **Subir os containers:**
    ```bash
    docker compose up --build
    ```

2.  **Rodar migrações do banco de dados (na primeira vez ou após mudanças no schema):**
    Em um novo terminal, execute:
    ```bash
    docker compose exec backend npx prisma migrate dev
    ```

A aplicação estará disponível em:
- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:3000](http://localhost:3000)

## Como realizar o Debug

1.  O backend está rodando com o flag `--inspect=0.0.0.0:9229`.
2.  No VS Code, abra a aba de **Run and Debug** (Ctrl+Shift+D).
3.  Selecione a configuração **"Docker: Attach to Node"**.
4.  Clique no botão Play (ou F5).
5.  Agora você pode colocar breakpoints no código do backend dentro da pasta `back_/src` e o VS Code irá parar a execução quando eles forem atingidos.

## Observações
- Os volumes estão configurados para que as mudanças no código local sejam refletidas automaticamente nos containers (Hot Reload).
- O banco de dados PostgreSQL é persistido no volume `postgres_data`.
