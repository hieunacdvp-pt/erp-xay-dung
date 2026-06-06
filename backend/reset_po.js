const Database = require('better-sqlite3');
const db = new Database('dev.db', { verbose: console.log });

const stmt = db.prepare("UPDATE PurchaseOrder SET status = 'DIRECTOR_APPROVED'");
const info = stmt.run();

console.log(`Updated ${info.changes} rows.`);
db.close();
