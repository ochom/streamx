import { Database } from "bun:sqlite";
import moment from "moment";

class ClientCount {
  date_time: string;
  client_count: number;

  constructor(date_time: string, client_count: number) {
    this.date_time = date_time;
    this.client_count = client_count;
  }
}

const db = new Database("./data/streamx.db");

// Initialize the database schema
db.run(`
  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY,
    date_time TEXT,
    client_count INTEGER
  )
`);

// make time unique index to prevent duplicates
db.run(`
  CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_time ON clients (date_time)
`);

// Create message counter table
db.run(`
  CREATE TABLE IF NOT EXISTS message_counts (
    id INTEGER PRIMARY KEY,
    date_time TEXT,
    message_count INTEGER
  )
`);

// make time unique index to prevent duplicates
db.run(`
  CREATE UNIQUE INDEX IF NOT EXISTS idx_message_counts_time ON message_counts (date_time)
`);

// AddClient sets the current client count in the database
export async function AddClient(count: number) {
  const time = moment().format("YYYY-MM-DD HH:mm:ss");
  const stmt = db.query(
    `INSERT INTO clients (date_time, client_count) VALUES (?, ?)
        ON CONFLICT(date_time) DO UPDATE SET client_count = ?
    `,
  );
  stmt.run(time, count, count);
}

// AddMessageCount sets the current message count in the database
export async function AddMessageCount() {
  const time = moment().format("YYYY-MM-DD HH:mm");
  const stmt = db.query(
    `INSERT INTO message_counts (date_time, message_count) VALUES (?, ?)
        ON CONFLICT(date_time) DO UPDATE SET message_count = message_count+1
    `,
  );
  stmt.run(time, 1);
}

// GetClients returns client count from the given time
export async function GetClients(hours: number) {
  const startTime = moment()
    .subtract(hours, "hours")
    .format("YYYY-MM-DD HH:mm:ss");
  const stmt = db
    .query(
      `SELECT 
        strftime('%Y-%m-%d %H:%M', date_time) as date_time, 
        MAX(client_count) as client_count 
      FROM clients WHERE date_time >= ? 
      GROUP BY strftime('%Y-%m-%d %H:%M', date_time) 
      ORDER BY date_time ASC`,
    )
    .as(ClientCount);
  const resp = stmt.all(startTime);
  return resp;
}

// CountClients returns the total client count in the database
export async function CountClients(hours: number) {
  const stmt = db.query(
    `SELECT Max(client_count) as total FROM clients WHERE date_time >= ?`,
  );
  const startTime = moment()
    .subtract(hours, "hours")
    .format("YYYY-MM-DD HH:mm");
  const result = stmt.get(startTime) as any;
  return result.total || 0;
}

// CountMessages returns the total message count in the database
export async function CountMessages(hours: number) {
  const stmt = db.query(
    `SELECT SUM(message_count) as total FROM message_counts WHERE date_time >= ?`,
  );
  const startTime = moment()
    .subtract(hours, "hours")
    .format("YYYY-MM-DD HH:mm");
  const result = stmt.get(startTime) as any;
  return result.total || 0;
}
