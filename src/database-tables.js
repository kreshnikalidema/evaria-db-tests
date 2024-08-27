const tables = [
    {
        name: 'PCMT_MASTER',
        createSQL: `
            CREATE TABLE pcmt_master (
                pv_number VARCHAR2(50) PRIMARY KEY,
                project_id VARCHAR2(50),
                rev_no NUMBER,
                discipline_id VARCHAR2(50),
                user_insert VARCHAR2(100),
                dt_insert DATE,
                data_json CLOB
            )
        `
    },
    {
        name: 'PCMT_CO_DETAILS',
        createSQL: `
            CREATE TABLE pcmt_co_details (
                project_id VARCHAR2(50),
                pv_number VARCHAR2(50),
                category_id VARCHAR2(50),
                category_desc CLOB,
                discipline VARCHAR2(50),
                operating_center_id VARCHAR2(50),
                is_valid NUMBER(1),
                basis VARCHAR2(50),
                rev_no NUMBER,
                status_id NUMBER,
                load_key VARCHAR2(50),
                is_deleted NUMBER(1),
                stage_id VARCHAR2(50),
                wbs_code_1 VARCHAR2(50),
                wbs_code_2 VARCHAR2(50),
                cbs_code VARCHAR2(50),
                business_unit VARCHAR2(50),
                bill_type VARCHAR2(50),
                mandatory_discipline_flag NUMBER(1),
                kbr_workhours NUMBER,
                client_workhours NUMBER,
                schedule_impact VARCHAR2(1),
                schedule_impact_value NUMBER,
                schedule_impact_notes CLOB,
                variance_number VARCHAR2(50)
            )
        `
    },
    {
        name: 'PCMT_VALUES_CHANGE_TYPE',
        createSQL: `
            CREATE TABLE pcmt_values_change_type (
                pv_number VARCHAR2(50),
                category_id VARCHAR2(50),
                category_name CLOB,
                status_id NUMBER,
                is_valid NUMBER(1),
                load_key VARCHAR2(50),
                rev_no NUMBER
            )
        `
    },
    {
        name: 'PCMT_ACTION_LOGS',
        createSQL: `
            CREATE TABLE pcmt_action_logs (
                pv_number VARCHAR2(50),
                status_id NUMBER,
                from_email VARCHAR2(100),
                to_email VARCHAR2(100),
                description_text CLOB,
                rev_no NUMBER,
                saved_log_flag NUMBER(1),
                dt_insert_utc DATE,
                skip_flag NUMBER(1),
                coments CLOB,
                budget_impact NUMBER,
                baseline_start_date_utc DATE,
                baseline_end_date_utc DATE,
                forecast_start_date_utc DATE,
                forecast_end_date_utc DATE,
                contract_type VARCHAR2(50)
            )
        `
    }
];

module.exports = tables;
