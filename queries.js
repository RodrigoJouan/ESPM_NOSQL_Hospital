const neo4j = require('neo4j-driver');

const driver = neo4j.driver(
  'neo4j://localhost',
  neo4j.auth.basic('neo4j', 'password')
);

// 1) Listar médicos de uma especialidade específica
const listDoctorsBySpecialty = async (specialtyName) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (m:Medico)-[:TEM_ESPECIALIDADE]->(e:Especialidade {nome: $specialtyName})
      RETURN m.nome AS medicoNome
      ORDER BY medicoNome
      `,
      { specialtyName }
    );

    console.log(`\n=== Médicos da especialidade: ${specialtyName} ===`);
    if (result.records.length === 0) {
      console.log('Nenhum médico encontrado.');
    } else {
      result.records.forEach((record) => {
        console.log(record.get('medicoNome'));
      });
    }
  } catch (error) {
    console.error(`Erro em listDoctorsBySpecialty: ${error}`);
  } finally {
    await session.close();
  }
};

// 2) Encontrar médicos que aceitam um determinado plano de saúde
const findDoctorsByHealthPlan = async (planName) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (m:Medico)-[:ACEITA_PLANO]->(p:Plano {nome: $planName})
      RETURN m.nome AS medicoNome
      ORDER BY medicoNome
      `,
      { planName }
    );

    console.log(`\n=== Médicos que aceitam o plano: ${planName} ===`);
    if (result.records.length === 0) {
      console.log('Nenhum médico encontrado.');
    } else {
      result.records.forEach((record) => {
        console.log(record.get('medicoNome'));
      });
    }
  } catch (error) {
    console.error(`Erro em findDoctorsByHealthPlan: ${error}`);
  } finally {
    await session.close();
  }
};

// 3) Listar hospitais e os médicos que atendem neles
const listHospitalsAndDoctors = async () => {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (m:Medico)-[:TRABALHA_EM]->(h:Hospital)
      RETURN h.nome AS hospital, COLLECT(m.nome) AS medicos
      ORDER BY hospital
      `
    );

    console.log('\n=== Hospitais e seus médicos ===');
    if (result.records.length === 0) {
      console.log('Nenhum hospital/médico encontrado.');
    } else {
      result.records.forEach((record) => {
        console.log(`\nHospital: ${record.get('hospital')}`);
        console.log('Médicos:');
        record.get('medicos').forEach((nome) => console.log(`  - ${nome}`));
      });
    }
  } catch (error) {
    console.error(`Erro em listHospitalsAndDoctors: ${error}`);
  } finally {
    await session.close();
  }
};

// 4) Obter todas as consultas de um paciente
const getPatientConsultations = async (patientName) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (p:Paciente {nome: $patientName})-[:FOI_CONSULTADO_EM]->(c:Consulta)
            <-[:REALIZOU_CONSULTA]-(m:Medico)
      RETURN c.data AS data, m.nome AS medico
      ORDER BY data
      `,
      { patientName }
    );

    console.log(`\n=== Consultas do paciente: ${patientName} ===`);
    if (result.records.length === 0) {
      console.log('Nenhuma consulta encontrada.');
    } else {
      result.records.forEach((record) => {
        console.log(`Data: ${record.get('data')} | Médico: ${record.get('medico')}`);
      });
    }
  } catch (error) {
    console.error(`Erro em getPatientConsultations: ${error}`);
  } finally {
    await session.close();
  }
};

// 5) Listar especialidades disponíveis em determinado hospital
const listHospitalSpecialties = async (hospitalName) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (h:Hospital {nome: $hospitalName})<-[:TRABALHA_EM]-(m:Medico)
            -[:TEM_ESPECIALIDADE]->(e:Especialidade)
      RETURN DISTINCT e.nome AS especialidade
      ORDER BY especialidade
      `,
      { hospitalName }
    );

    console.log(`\n=== Especialidades no hospital: ${hospitalName} ===`);
    if (result.records.length === 0) {
      console.log('Nenhuma especialidade encontrada para este hospital.');
    } else {
      result.records.forEach((record) => {
        console.log(record.get('especialidade'));
      });
    }
  } catch (error) {
    console.error(`Erro em listHospitalSpecialties: ${error}`);
  } finally {
    await session.close();
  }
};

// 6) Listar todos os médicos que podem atender ao plano de saúde de um paciente
const listDoctorsForPatient = async (patientName) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (p:Paciente {nome: $patientName})-[:TEM_PLANO]->(plan:Plano)
      MATCH (m:Medico)-[:ACEITA_PLANO]->(plan)
      RETURN DISTINCT m.nome AS medico, plan.nome AS plano
      ORDER BY medico
      `,
      { patientName }
    );

    console.log(`\n=== Médicos que podem atender o plano do paciente: ${patientName} ===`);
    if (result.records.length === 0) {
      console.log('Nenhum médico encontrado para o plano deste paciente.');
    } else {
      result.records.forEach((record) => {
        console.log(`Médico: ${record.get('medico')} | Plano: ${record.get('plano')}`);
      });
    }
  } catch (error) {
    console.error(`Erro em listDoctorsForPatient: ${error}`);
  } finally {
    await session.close();
  }
};

// 7) Exibir o total de consultas realizadas por médico
const countConsultationsByDoctor = async () => {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (m:Medico)-[:REALIZOU_CONSULTA]->(c:Consulta)
      RETURN m.nome AS medico, COUNT(c) AS totalConsultas
      ORDER BY totalConsultas DESC, medico
      `
    );

    console.log('\n=== Total de consultas por médico ===');
    if (result.records.length === 0) {
      console.log('Nenhuma consulta encontrada.');
    } else {
      result.records.forEach((record) => {
        console.log(
          `Médico: ${record.get('medico')} | Total de consultas: ${record.get('totalConsultas')}`
        );
      });
    }
  } catch (error) {
    console.error(`Erro em countConsultationsByDoctor: ${error}`);
  } finally {
    await session.close();
  }
};

// Função principal para rodar todas as consultas de exemplo
const main = async () => {
  try {
    await listDoctorsBySpecialty('Pediatra');
    await findDoctorsByHealthPlan('Amil');
    await listHospitalsAndDoctors();
    await getPatientConsultations('Laura Monteiro');
    await listHospitalSpecialties('Hospital Israelita Albert Einstein');
    await listDoctorsForPatient('Pedro Henrique Alves');
    await countConsultationsByDoctor();
  } catch (err) {
    console.error('Erro na execução das consultas:', err);
  } finally {
    await driver.close();
  }
};

main();
