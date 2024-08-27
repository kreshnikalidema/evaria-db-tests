-- Drop the user if it exists
BEGIN
    EXECUTE IMMEDIATE 'DROP USER myuser CASCADE';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -01918 THEN -- Error code for "user does not exist"
            RAISE;
        END IF;
END;
/

CREATE USER myuser IDENTIFIED BY mypassword;

GRANT ALL PRIVILEGES TO myuser;

COMMIT;
