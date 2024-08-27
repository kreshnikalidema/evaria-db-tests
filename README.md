# evaria-db-tests

```bash
sqlplus SYS/StrongPassword123@//localhost:1521/ORCLPDB1 as SYSDBA @src/database-init.sql
```

```bash
sqlplus myuser/mypassword@//localhost:1521/ORCLPDB1 @src/database-script.sql
```