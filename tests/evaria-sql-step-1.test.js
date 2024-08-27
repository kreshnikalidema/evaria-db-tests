const DatabaseManager = require('../src/database-manager');

describe('eVaria SQL Tests for Step 1', () => {
    let connection;
    let generatedPvNumber = 'd8830-pv-d7777-001';

    beforeAll(async () => {
        connection = await DatabaseManager.getConnection();
        await DatabaseManager.createTables(connection);
    });

    afterAll(async () => {
        if (connection) {
            await connection.close();
        }
    });

    test('should insert into pcmt_master and capture pv_number', async () => {
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
                    user_insert: 'erion.krasniqi@kbr.com'
                }
            ],
            currentworkstatus: [
                { status: 'x10', status_name: 'baseline work partially performed, requires re-work' }
            ]
        };

        const insertQuery = `
            INSERT INTO pcmt_master(pv_number, project_id, rev_no, discipline_id, user_insert, dt_insert, data_json)
            VALUES(:pv_number, 'd8830', 1, 'd7777', 'manually', SYSDATE, :jsonData)
        `;

        await connection.execute(insertQuery, {
            pv_number: generatedPvNumber,
            jsonData: JSON.stringify(jsonData)
        });

        const selectQuery = `
            SELECT * FROM pcmt_master
            WHERE pv_number = :pv_number
        `;
        const result = await connection.execute(selectQuery, { pv_number: generatedPvNumber });
        const records = DatabaseManager.resultToObjects(result);
        const record = records[0];

        expect(record.project_id).toBe('d8830');
        expect(record.discipline_id).toBe('d7777');

        const dataJson = JSON.parse(record.data_json);
        expect(dataJson.impacts[0].impact).toBe('z05');
        expect(dataJson.actions[0].description_text).toBe('asdf');
    });

    test('should insert related data for pcmt_co_details, pcmt_values_change_type, and pcmt_action_logs', async () => {
        // Insert into pcmt_co_details
        const insertDetailsQuery = `
            INSERT INTO pcmt_co_details (
                project_id, pv_number, category_id, category_desc, discipline, 
                operating_center_id, is_valid, basis, rev_no, status_id, load_key, 
                is_deleted, stage_id, wbs_code_1, wbs_code_2, cbs_code, 
                business_unit, bill_type, mandatory_discipline_flag, kbr_workhours, 
                client_workhours, schedule_impact, schedule_impact_value, schedule_impact_notes, 
                variance_number
            ) VALUES (
                'd8830', :pv_number, 'd', 'description', 'discipline',
                'center', 1, 'basis', 1, 4, 'key', 
                0, 'stage', 'wbs1', 'wbs2', 'cbs',
                'unit', 'bill', 1, 120, 
                80, 'N', null, 'notes',
                'var001'
            )
        `;

        await connection.execute(insertDetailsQuery, {
            pv_number: generatedPvNumber
        });

        // Insert into pcmt_values_change_type
        const insertChangeTypeQuery = `
            INSERT INTO pcmt_values_change_type (
                pv_number, category_id, category_name, status_id, is_valid, 
                load_key, rev_no
            ) VALUES (
                :pv_number, 'd', 'category', 4, 1, 
                'key', 1
            )
        `;

        await connection.execute(insertChangeTypeQuery, {
            pv_number: generatedPvNumber
        });

        // Insert into pcmt_action_logs
        const insertActionLogsQuery = `
            INSERT INTO pcmt_action_logs (
                pv_number, status_id, from_email, to_email, description_text, 
                rev_no, saved_log_flag, dt_insert_utc, skip_flag, coments, 
                budget_impact, baseline_start_date_utc, baseline_end_date_utc, forecast_start_date_utc, 
                forecast_end_date_utc, contract_type
            ) VALUES (
                :pv_number, 4, 'from_email@test.com', 'to_email@test.com', 'updated description', 
                1, 1, SYSDATE, 0, 'comments', 
                500, SYSDATE, SYSDATE, SYSDATE, 
                SYSDATE, 'contract'
            )
        `;

        await connection.execute(insertActionLogsQuery, {
            pv_number: generatedPvNumber
        });
    });

    test('should select from pcmt_co_details using generated pv_number', async () => {
        const selectDetailsQuery = `
            SELECT * 
            FROM pcmt_co_details
            WHERE pv_number = :pv_number
            AND status_id = 4
        `;
        const result = await connection.execute(selectDetailsQuery, { pv_number: generatedPvNumber });
        const records = DatabaseManager.resultToObjects(result);

        expect(records.length).toBeGreaterThan(0);
        const record = records[0];
        expect(record.category_id).toBe('d');
        expect(record.kbr_workhours).toBe(120);
    });

    test('should select from pcmt_values_change_type using generated pv_number', async () => {
        const selectChangeTypeQuery = `
            SELECT * 
            FROM pcmt_values_change_type
            WHERE pv_number = :pv_number
            AND status_id = 4
        `;
        const result = await connection.execute(selectChangeTypeQuery, { pv_number: generatedPvNumber });
        const records = DatabaseManager.resultToObjects(result);

        expect(records.length).toBeGreaterThan(0);
        const record = records[0];
        expect(record.category_id).toBe('d');
        expect(record.status_id).toBe(4);
    });

    test('should select from pcmt_action_logs using generated pv_number', async () => {
        const selectActionsQuery = `
            SELECT * 
            FROM pcmt_action_logs
            WHERE pv_number = :pv_number
            AND status_id = 4
        `;
        const result = await connection.execute(selectActionsQuery, { pv_number: generatedPvNumber });
        const records = DatabaseManager.resultToObjects(result);

        expect(records.length).toBeGreaterThan(0);
        const record = records[0];
        expect(record.status_id).toBe(4);
        expect(record.description_text).toBe('updated description');
    });
});
