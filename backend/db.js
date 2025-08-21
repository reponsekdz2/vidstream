import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

// Configure lowdb to use a JSON file for storage
const adapter = new JSONFile('db.json');
export const db = new Low(adapter, {});

// Read data from db.json
await db.read();
