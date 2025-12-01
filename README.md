# Sistema de Atendimento Médico com Neo4j

Este projeto modela um sistema de atendimento médico utilizando Neo4j, conforme descrito no arquivo `ATIVIDADE.md`.

## Visão Geral

O projeto consiste em um banco de dados Neo4j populado com dados de médicos, pacientes, hospitais, especialidades, planos de saúde e consultas. Scripts em Node.js são fornecidos para popular o banco de dados e para executar uma série de consultas pré-definidas.

## Diagrama do Modelo de Dados

A imagem abaixo representa o modelo de dados criado no Neo4j, mostrando as relações entre os diferentes atores do sistema.

![Diagrama do Modelo de Dados](screenshots/bloom-visualisation.png)

## Estrutura do Projeto

- `docker-compose.yml`: Arquivo para iniciar um container Neo4j com as configurações necessárias.
- `seeds.js`: Script para popular o banco de dados com os dados iniciais.
- `queries.js`: Script que contém e executa todas as consultas solicitadas na atividade.
- `package.json`: Arquivo de configuração do projeto Node.js.

## Como Executar

### Pré-requisitos

- Docker e Docker Compose instalados.
- Node.js e npm instalados.

### Passos

1. **Iniciar o container Neo4j:**

   ```bash
   docker-compose up -d
   ```

2. **Instalar as dependências do Node.js:**

   ```bash
   npm install
   ```

3. **Popular o banco de dados:**

   Execute o script de seeds para criar os nós e relacionamentos no banco de dados.

   ```bash
   npm run seed
   ```

4. **Executar as consultas:**

   Execute o script de queries para ver o resultado das consultas no console.

   ```bash
   npm run queries
   ```

5. **Acessar o Neo4j Browser:**

   Para visualizar o grafo e executar consultas manualmente, acesse `http://localhost:7474` em seu navegador.

   - **Usuário:** `neo4j`
   - **Senha:** `password`

## Consultas Implementadas

O script `queries.js` implementa as seguintes consultas:

- Listar médicos de uma especialidade específica.
- Encontrar médicos que aceitam um determinado plano de saúde.
- Listar hospitais e os médicos que atendem neles.
- Obter todas as consultas de um paciente.
- Listar especialidades disponíveis em determinado hospital.
- Listar todos os médicos que podem atender ao plano de saúde de um paciente.
- Exibir o total de consultas realizadas por médico.
