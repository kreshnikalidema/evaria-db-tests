BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE pcmt_master CASCADE CONSTRAINTS';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -942 THEN
            RAISE;
        END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE pcmt_co_details CASCADE CONSTRAINTS';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -942 THEN
            RAISE;
        END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE pcmt_values_change_type CASCADE CONSTRAINTS';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -942 THEN
            RAISE;
        END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE pcmt_action_logs CASCADE CONSTRAINTS';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -942 THEN
            RAISE;
        END IF;
END;
/

-- Create tables
CREATE TABLE pcmt_master (
    pv_number VARCHAR2(50) PRIMARY KEY,
    project_id VARCHAR2(50),
    rev_no NUMBER,
    discipline_id VARCHAR2(50),
    user_insert VARCHAR2(100),
    dt_insert DATE,
    data_json CLOB
);

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
);

CREATE TABLE pcmt_values_change_type (
    pv_number VARCHAR2(50),
    category_id VARCHAR2(50),
    category_name CLOB,
    status_id NUMBER,
    is_valid NUMBER(1),
    load_key VARCHAR2(50),
    rev_no NUMBER
);

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
);


-- Create sequence
CREATE SEQUENCE pcmt_pv_number_seq
  START WITH 1
  INCREMENT BY 1
  NOCACHE
  NOCYCLE;


-- Create function
CREATE OR REPLACE FUNCTION PCMT_GENERATE_PV_NUMBER(
    p_project_id VARCHAR2,
    p_cost_type VARCHAR2
) RETURN VARCHAR2 IS
    v_pv_number VARCHAR2(50);
    v_next_number NUMBER;
BEGIN
    SELECT pcmt_pv_number_seq.NEXTVAL INTO v_next_number FROM dual;
    
    v_pv_number := p_project_id || '-PV-' || p_cost_type || '-' || LPAD(v_next_number , 4, '0');
    
    RETURN v_pv_number;
END;
/


-- Create trigger
CREATE OR REPLACE TRIGGER trg_before_insert_pcmt_master
BEFORE INSERT ON pcmt_master
FOR EACH ROW
BEGIN
    :NEW.pv_number := PCMT_GENERATE_PV_NUMBER(
        p_project_id => :NEW.project_id,
        p_cost_type => :NEW.discipline_id
    );
END;
/
