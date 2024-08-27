const oracledb = require('oracledb');
const tables = require('./database-tables');

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

    static async createTables(connection) {
        for (const table of tables) {
            try {
                const query = `SELECT COUNT(*) AS count FROM ${table.name}`;
                await connection.execute(query);
                console.log(`Table ${table.name} already exists`);
            } catch (error) {
                if (error.errorNum === 942) { // ORA-00942: table or view does not exist
                    console.log(`Table ${table.name} does not exist, creating...`);
                    try {
                        await connection.execute(table.createSQL);
                        console.log(`Table ${table.name} created successfully`);
                    } catch (createError) {
                        console.error(`Error creating table ${table.name}:`, createError);
                        throw createError;
                    }
                } else {
                    console.error(`Error checking table ${table.name}:`, error);
                    throw error;
                }
            }
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
