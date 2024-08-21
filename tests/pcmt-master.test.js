const oracledb = require('oracledb');

const dbConfig = {
  user: 'sys',
  password: 'StrongPassword123',
  connectString: 'localhost:1521/ORCLPDB1',
  privilege: oracledb.SYSDBA
};

describe('Inserting a new project into pcmt_master table', () => {
  let connection;

  beforeAll(async () => {
    connection = await oracledb.getConnection(dbConfig);
  });

  afterAll(async () => {
    if (connection) {
      await connection.close();
    }
  });

  test('should insert a new project into the master table', async () => {
    const projectData = {
      project_id: 1001,
      project_name: 'Test Project',
      client: 'Test Client',
      initiation_date: new Date('2024-01-01'),
      cost_type: 'Fixed',
      pv_number: 'PV001',
      pv_title: 'Test Project PV Title',
      description_of_variance: 'Test description',
      contractual_currency: 'USD'
    };

    const insertQuery = `
      INSERT INTO pcmt_master 
      (project_id, project_name, client, initiation_date, cost_type, pv_number, pv_title, description_of_variance, contractual_currency)
      VALUES (:project_id, :project_name, :client, :initiation_date, :cost_type, :pv_number, :pv_title, :description_of_variance, :contractual_currency)
    `;

    const result = await connection.execute(insertQuery, projectData, { autoCommit: true });

    expect(result.rowsAffected).toBe(1);

    const selectQuery = `SELECT * FROM pcmt_master WHERE project_id = :project_id`;
    const selectResult = await connection.execute(selectQuery, { project_id: projectData.project_id });

    expect(selectResult.rows.length).toBe(1);
    const insertedProject = selectResult.rows[0];

    expect(insertedProject.PROJECT_NAME).toBe(projectData.project_name);
    expect(insertedProject.CLIENT).toBe(projectData.client);
    expect(new Date(insertedProject.INITIATION_DATE).toISOString()).toBe(projectData.initiation_date.toISOString());
    expect(insertedProject.COST_TYPE).toBe(projectData.cost_type);
    expect(insertedProject.PV_NUMBER).toBe(projectData.pv_number);
    expect(insertedProject.PV_TITLE).toBe(projectData.pv_title);
    expect(insertedProject.DESCRIPTION_OF_VARIANCE).toBe(projectData.description_of_variance);
    expect(insertedProject.CONTRACTUAL_CURRENCY).toBe(projectData.contractual_currency);
  });
});
