const neo4j = require('neo4j-driver');

const driver = neo4j.driver(
  'neo4j://localhost',
  neo4j.auth.basic('neo4j', 'password')
);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const waitForNeo4j = async (retries = 10, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Attempting to connect to Neo4j (attempt ${i + 1}/${retries})...`);
      const session = driver.session();
      await session.run('RETURN 1');
      await session.close();
      console.log('Successfully connected to Neo4j!');
      return true;
    } catch (error) {
      console.warn(
        `Failed to connect to Neo4j: ${error.message}. Retrying in ${delay / 1000} seconds...`
      );
      await sleep(delay);
    }
  }
  console.error('Failed to connect to Neo4j after multiple retries.');
  return false;
};

const createData = async () => {
  const session = driver.session();
  try {
    console.log('Clearing existing data...');
    await session.run('MATCH (n) DETACH DELETE n');
    console.log('Existing data cleared.');

    const query = `
      // Especialidades
      CREATE (esp1:Especialidade {nome: "Cardiologista"})
      CREATE (esp2:Especialidade {nome: "Pediatra"})
      CREATE (esp3:Especialidade {nome: "Oftalmologista"})

      // Médicos
      CREATE (m1:Medico {nome: "Dr. Ricardo Almeida"})
      CREATE (m2:Medico {nome: "Dra. Fernanda Soares"})
      CREATE (m3:Medico {nome: "Dr. Marcelo Oliveira"})
      CREATE (m4:Medico {nome: "Dra. Patrícia Lopes"})
      CREATE (m5:Medico {nome: "Dr. André Lima"})
      CREATE (m6:Medico {nome: "Dra. Juliana Martins"})

      // Hospitais (Top SP)
      CREATE (h1:Hospital {nome: "Hospital Israelita Albert Einstein"})
      CREATE (h2:Hospital {nome: "Hospital Sírio-Libanês"})
      CREATE (h3:Hospital {nome: "Hospital do Coração (HCor)"})
      CREATE (h4:Hospital {nome: "Hospital Alemão Oswaldo Cruz"})
      CREATE (h5:Hospital {nome: "Hospital Samaritano Paulista"})

      // Planos de Saúde
      CREATE (p1:Plano {nome: "Amil"})
      CREATE (p2:Plano {nome: "Bradesco Saúde"})
      CREATE (p3:Plano {nome: "SulAmérica"})

      // Pacientes
      CREATE (pac1:Paciente {nome: "Laura Monteiro"})
      CREATE (pac2:Paciente {nome: "Pedro Henrique Alves"})
      CREATE (pac3:Paciente {nome: "Lucas Carvalho"})
      CREATE (pac4:Paciente {nome: "Isabela Rocha"})
      CREATE (pac5:Paciente {nome: "Gustavo Ribeiro"})

      // Relacionamento Especialidades por Médico
      WITH esp1, esp2, esp3,
           m1, m2, m3, m4, m5, m6,
           h1, h2, h3, h4, h5,
           p1, p2, p3,
           pac1, pac2, pac3, pac4, pac5

      CREATE (m1)-[:TEM_ESPECIALIDADE]->(esp1)
      CREATE (m2)-[:TEM_ESPECIALIDADE]->(esp1)
      CREATE (m3)-[:TEM_ESPECIALIDADE]->(esp2)
      CREATE (m4)-[:TEM_ESPECIALIDADE]->(esp2)
      CREATE (m5)-[:TEM_ESPECIALIDADE]->(esp3)
      CREATE (m6)-[:TEM_ESPECIALIDADE]->(esp3)

      // Médicos trabalham em Hospitais
      CREATE (m1)-[:TRABALHA_EM]->(h1)
      CREATE (m2)-[:TRABALHA_EM]->(h4)
      CREATE (m3)-[:TRABALHA_EM]->(h2)
      CREATE (m4)-[:TRABALHA_EM]->(h2)
      CREATE (m5)-[:TRABALHA_EM]->(h3)
      CREATE (m6)-[:TRABALHA_EM]->(h5)

      // Médicos aceitam Planos de Saúde
      CREATE (m1)-[:ACEITA_PLANO]->(p1)
      CREATE (m1)-[:ACEITA_PLANO]->(p3)
      CREATE (m2)-[:ACEITA_PLANO]->(p2)
      CREATE (m3)-[:ACEITA_PLANO]->(p1)
      CREATE (m4)-[:ACEITA_PLANO]->(p1)
      CREATE (m5)-[:ACEITA_PLANO]->(p2)
      CREATE (m6)-[:ACEITA_PLANO]->(p2)

      // Pacientes possuem plano
      CREATE (pac1)-[:TEM_PLANO]->(p1)
      CREATE (pac2)-[:TEM_PLANO]->(p1)
      CREATE (pac3)-[:TEM_PLANO]->(p2)
      CREATE (pac4)-[:TEM_PLANO]->(p2)
      CREATE (pac5)-[:TEM_PLANO]->(p3)

      // Consultas
      CREATE (c1:Consulta {data: "2025-01-10"})
      CREATE (c2:Consulta {data: "2025-01-11"})
      CREATE (c3:Consulta {data: "2025-01-12"})
      CREATE (c4:Consulta {data: "2025-01-13"})
      CREATE (c5:Consulta {data: "2025-01-14"})
      CREATE (c6:Consulta {data: "2025-01-15"})
      CREATE (c7:Consulta {data: "2025-02-01"})
      CREATE (c8:Consulta {data: "2025-02-02"})
      CREATE (c9:Consulta {data: "2025-02-03"})
      CREATE (c10:Consulta {data: "2025-02-04"})

      // Associações Médico–Consulta–Paciente
      WITH m1, m2, m3, m4, m5, m6,
           pac1, pac2, pac3, pac4, pac5,
           c1, c2, c3, c4, c5, c6, c7, c8, c9, c10

      // 1) m1 x pac1
      CREATE (m1)-[:REALIZOU_CONSULTA]->(c1)
      CREATE (pac1)-[:FOI_CONSULTADO_EM]->(c1)

      // 2) m3 x pac2
      CREATE (m3)-[:REALIZOU_CONSULTA]->(c2)
      CREATE (pac2)-[:FOI_CONSULTADO_EM]->(c2)

      // 3) m4 x pac2
      CREATE (m4)-[:REALIZOU_CONSULTA]->(c3)
      CREATE (pac2)-[:FOI_CONSULTADO_EM]->(c3)

      // 4) m5 x pac3
      CREATE (m5)-[:REALIZOU_CONSULTA]->(c4)
      CREATE (pac3)-[:FOI_CONSULTADO_EM]->(c4)

      // 5) m6 x pac4
      CREATE (m6)-[:REALIZOU_CONSULTA]->(c5)
      CREATE (pac4)-[:FOI_CONSULTADO_EM]->(c5)

      // 6) m2 x pac5
      CREATE (m2)-[:REALIZOU_CONSULTA]->(c6)
      CREATE (pac5)-[:FOI_CONSULTADO_EM]->(c6)

      // 7) m1 x pac1 (de novo)
      CREATE (m1)-[:REALIZOU_CONSULTA]->(c7)
      CREATE (pac1)-[:FOI_CONSULTADO_EM]->(c7)

      // 8) m3 x pac2
      CREATE (m3)-[:REALIZOU_CONSULTA]->(c8)
      CREATE (pac2)-[:FOI_CONSULTADO_EM]->(c8)

      // 9) m4 x pac1
      CREATE (m4)-[:REALIZOU_CONSULTA]->(c9)
      CREATE (pac1)-[:FOI_CONSULTADO_EM]->(c9)

      // 10) m6 x pac4
      CREATE (m6)-[:REALIZOU_CONSULTA]->(c10)
      CREATE (pac4)-[:FOI_CONSULTADO_EM]->(c10)
    `;

    console.log('Creating graph data...');
    await session.run(query);
    console.log('Data successfully created!');
  } catch (error) {
    console.error('Error while creating data in Neo4j:', error);
  } finally {
    await session.close();
  }
};

const main = async () => {
  const connected = await waitForNeo4j();
  if (connected) {
    await createData();
  }
  await driver.close();
};

main();
