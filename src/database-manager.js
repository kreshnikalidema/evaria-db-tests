const oracledb = require('oracledb');

// Set fetchAsString option for CLOBs
oracledb.fetchAsString = [oracledb.CLOB];

class DatabaseManager {
    static async getConnection() {
        try {
            const connection = await oracledb.getConnection({
                user: 'SYS',
                password: 'StrongPassword123',
                connectString: 'localhost:1521/ORCLPDB1',
                privilege: oracledb.SYSDBA
            });
            console.log('Database connection established');
            return connection;
        } catch (error) {
            console.error('Error getting connection:', error);
            throw error;
        }
    }

    static resultToObjects(result) {
        const rows = result.rows;
        const columns = result.metaData.map(col => col.name.toLowerCase());

        return rows.map(row => {
            const obj = {};
            row.forEach((val, index) => {
                obj[columns[index]] = val;
            });
            return obj;
        });
    }
}

module.exports = DatabaseManager;
