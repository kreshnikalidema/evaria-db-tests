const oracledb = require('oracledb');

// Set fetchAsString option for CLOBs
oracledb.fetchAsString = [oracledb.CLOB];

class DatabaseManager {
    static async getConnection() {
        try {
            const connection = await oracledb.getConnection({
                user: 'evariauser',
                password: 'evariapass',
                connectString: 'localhost:1521/ORCLPDB2'
            });
            console.log('Database connection established');
            return connection;
        } catch (error) {
            console.error('Error getting connection:', error);
            throw error;
        }
    }

    static async executeQuery(connection, query, params) {
        try {
            const result = await connection.execute(query, params, {
                outFormat: oracledb.OUT_FORMAT_OBJECT, 
                autoCommit: true
            });
            return result;
        } catch (error) {
            console.error('Error executeQuery:', error);
            throw error;
        }
    }
}

module.exports = DatabaseManager;
