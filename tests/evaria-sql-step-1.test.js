const DatabaseManager = require('../src/database-manager');

describe('eVaria SQL Tests', () => {
    let connection;
    let generatedPvNumber; // Variable to store the generated pv_number

    beforeAll(async () => {
        connection = await DatabaseManager.getConnection();
    });

    afterAll(async () => {
        if (connection) {
            await connection.close();
        }
    });

    test('should insert into pcmt_master, and verify generated pv_number', async () => {
        const insertQuery = `
            INSERT INTO pcmt_master (project_id, rev_no, discipline_id, user_insert, dt_insert, data_json)
            VALUES (:project_id, :rev_no, :discipline_id, :user_insert, SYSDATE, :data_json)
        `;

        const bindParams = {
            project_id: 'PROJ123',
            rev_no: 1,
            discipline_id: 'DISC01',
            user_insert: 'user123',
            data_json: JSON.stringify({})
        };

        const result = await DatabaseManager.executeQuery(connection, insertQuery, bindParams);
        expect(result.rowsAffected).toBe(1);

        const selectQuery = `
            SELECT pv_number, project_id, rev_no, discipline_id, user_insert, data_json
            FROM pcmt_master
            WHERE project_id = :project_id AND rev_no = :rev_no
        `;

        const selectParams = {
            project_id: 'PROJ123',
            rev_no: 1
        };

        const selectResult = await DatabaseManager.executeQuery(connection, selectQuery, selectParams);
        const row = selectResult.rows[0];

        // Store the generated pv_number for later tests
        generatedPvNumber = row.PV_NUMBER;

        expect(generatedPvNumber).toMatch(/PROJ123-PV-DISC01-\d{4}/);
        expect(row.PROJECT_ID).toBe('PROJ123');
        expect(row.REV_NO).toBe(1);
        expect(row.DISCIPLINE_ID).toBe('DISC01');
        expect(row.USER_INSERT).toBe('user123');
        expect(row.DATA_JSON).toBe('{}');
    });

    test('should update the record in pcmt_master and verify changes', async () => {
        const updateQuery = `
            UPDATE pcmt_master
            SET discipline_id = :discipline_id, user_insert = :user_insert
            WHERE pv_number = :pv_number
        `;

        const updateParams = {
            pv_number: generatedPvNumber,
            discipline_id: 'DISC02',
            user_insert: 'user456'
        };

        const updateResult = await DatabaseManager.executeQuery(connection, updateQuery, updateParams);
        expect(updateResult.rowsAffected).toBe(1);

        const selectQuery = `
            SELECT pv_number, project_id, rev_no, discipline_id, user_insert
            FROM pcmt_master
            WHERE pv_number = :pv_number
        `;

        const selectParams = {
            pv_number: generatedPvNumber
        };

        const selectResult = await DatabaseManager.executeQuery(connection, selectQuery, selectParams);
        const row = selectResult.rows[0];

        expect(row.DISCIPLINE_ID).toBe('DISC02');
        expect(row.USER_INSERT).toBe('user456');
    });

    test('should delete the record from pcmt_master and verify deletion', async () => {
        const deleteQuery = `
            DELETE FROM pcmt_master
            WHERE pv_number = :pv_number
        `;

        const deleteParams = {
            pv_number: generatedPvNumber
        };

        const deleteResult = await DatabaseManager.executeQuery(connection, deleteQuery, deleteParams);
        expect(deleteResult.rowsAffected).toBe(1);

        const selectQuery = `
            SELECT COUNT(*) AS count
            FROM pcmt_master
            WHERE pv_number = :pv_number
        `;

        const selectParams = {
            pv_number: generatedPvNumber
        };

        const selectResult = await DatabaseManager.executeQuery(connection, selectQuery, selectParams);
        const rowCount = selectResult.rows[0].COUNT;

        expect(rowCount).toBe(0);
    });
});
