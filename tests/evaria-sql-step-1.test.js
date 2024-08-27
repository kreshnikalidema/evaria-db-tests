const DatabaseManager = require('../src/database-manager');

describe('eVaria SQL Tests for Step 1', () => {
    let connection;
    let generatedPvNumber;

    beforeAll(async () => {
        connection = await DatabaseManager.getConnection();
    });

    afterAll(async () => {
        if (connection) {
            await connection.close();
        }
    });

    test('should generate pv_number using pcmt_generate_pv_number function', async () => {
        const query = `
            SELECT PCMT_GENERATE_PV_NUMBER(:project_id, :cost_type, :user_email) AS pv_number FROM dual
        `;
        try {
            const result = await connection.execute(query, {
                project_id: 'd8830',
                cost_type: 'd7777',
                user_email: 'default_email@example.com'
            });

            const resultObjects = DatabaseManager.resultToObjects(result);
            generatedPvNumber = resultObjects[0].pv_number;

            expect(generatedPvNumber).toMatch(/^d8830-PV-d7777-\d{4}$/);
        } catch (error) {
            console.error('Error generating PV number:', error);
            throw error;
        }
    });

    test('should insert into pcmt_master and verify fields', async () => {
        const insertQuery = `
            INSERT INTO pcmt_master (pv_number, project_id, rev_no, discipline_id, user_insert, dt_insert, data_json)
            VALUES (:pv_number, :project_id, :rev_no, :discipline_id, :user_insert, :dt_insert, :data_json)
        `;

        // Ensure jsonData has appropriate values
        const jsonData = {
            impacts: [
                { impact: 'z05', impact_name: 'client hours', impact_value: null },
                { impact: 'z10', impact_name: 'kbr hours', impact_value: null }
            ],
            variance: [
                { variance: '1010', variance_name: 'omitted from design basis' }
            ],
            actions: [
                {
                    action_key: 0,
                    description_text: 'asdf',
                    from_email: 'erion.krasniqi@kbr.com',
                    rev_no: 1,
                    saved_log_flag: 0,
                    status_id: 1,
                    to_email: null,
                    user_insert: 'test_user'
                }
            ]
        };

        // Insert data into pcmt_master table
        await connection.execute(insertQuery, {
            pv_number: generatedPvNumber,
            project_id: 'd8830',
            rev_no: 1,
            discipline_id: 'disc01',
            user_insert: 'test_user',
            dt_insert: new Date(),
            data_json: JSON.stringify(jsonData)
        });

        // Verify the inserted data
        const verifyQuery = `
            SELECT * FROM pcmt_master
            WHERE pv_number = :pv_number
        `;
        const verifyResult = await connection.execute(verifyQuery, {
            pv_number: generatedPvNumber
        });

        const verifyResultObjects = DatabaseManager.resultToObjects(verifyResult);

        expect(verifyResultObjects).toHaveLength(1);
        expect(verifyResultObjects[0].pv_number).toBe(generatedPvNumber);
        expect(verifyResultObjects[0].project_id).toBe('d8830');
        expect(verifyResultObjects[0].rev_no).toBe(1);
        expect(verifyResultObjects[0].discipline_id).toBe('disc01');
        expect(verifyResultObjects[0].user_insert).toBe('test_user');
        expect(verifyResultObjects[0].data_json).toBe(JSON.stringify(jsonData));
    });

    test('should handle empty insert into pcmt_master', async () => {
        const emptyInsertQuery = `
            INSERT INTO pcmt_master (pv_number, project_id, rev_no, discipline_id, user_insert, dt_insert, data_json)
            VALUES (:pv_number, :project_id, :rev_no, :discipline_id, :user_insert, :dt_insert, :data_json)
        `;

        await connection.execute(emptyInsertQuery, {
            pv_number: 'test-empty',
            project_id: 'empty_project',
            rev_no: 0,
            discipline_id: 'empty_discipline',
            user_insert: 'empty_user@example.com',
            dt_insert: new Date(),
            data_json: JSON.stringify({})
        });

        const selectQuery = `
            SELECT pv_number, project_id, rev_no, discipline_id, user_insert, dt_insert, data_json
            FROM pcmt_master
            WHERE pv_number = :pv_number
        `;
        const result = await connection.execute(selectQuery, {
            pv_number: 'test-empty'
        });

        const resultObjects = DatabaseManager.resultToObjects(result);

        expect(resultObjects).toHaveLength(1);
        const row = resultObjects[0];

        expect(row.pv_number).toBe('test-empty');
        expect(row.project_id).toBe('empty_project');
        expect(row.rev_no).toBe(0);
        expect(row.discipline_id).toBe('empty_discipline');
        expect(row.user_insert).toBe('empty_user@example.com');
        expect(row.data_json).toBe(JSON.stringify({}));
    });

    test('should handle deletion from pcmt_master', async () => {
        const insertQuery = `
            INSERT INTO pcmt_master (pv_number, project_id, rev_no, discipline_id, user_insert, dt_insert, data_json)
            VALUES (:pv_number, :project_id, :rev_no, :discipline_id, :user_insert, :dt_insert, :data_json)
        `;

        await connection.execute(insertQuery, {
            pv_number: 'test-delete',
            project_id: 'delete_project',
            rev_no: 2,
            discipline_id: 'delete_discipline',
            user_insert: 'delete_user@example.com',
            dt_insert: new Date(),
            data_json: JSON.stringify({})
        });

        const deleteQuery = `
            DELETE FROM pcmt_master
            WHERE pv_number = :pv_number
        `;

        await connection.execute(deleteQuery, {
            pv_number: 'test-delete'
        });

        const selectQuery = `
            SELECT pv_number
            FROM pcmt_master
            WHERE pv_number = :pv_number
        `;
        const result = await connection.execute(selectQuery, {
            pv_number: 'test-delete'
        });

        const resultObjects = DatabaseManager.resultToObjects(result);

        expect(resultObjects).toHaveLength(0);
    });
});
