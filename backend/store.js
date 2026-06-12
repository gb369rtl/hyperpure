import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { seed, content as seedContent, defaultRoles } from './seedData.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

function ensure() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_PATH)) atomicWrite(seed());
}

// Crash-safe write: write to a temp file, then atomically rename over the target.
// Prevents a half-written / corrupted db.json if the process dies mid-write.
function atomicWrite(db) {
  const tmp = `${DB_PATH}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_PATH);
}

export function read() {
  ensure();
  const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  db.leads ??= [];
  db.orders ??= [];
  db.categories ??= [];
  db.products ??= [];
  db.users ??= [];
  db.content = { ...seedContent, ...(db.content || {}) };
  // Merge default roles: keep any custom roles, but ensure system roles are always present.
  if (!db.roles || db.roles.length === 0) {
    db.roles = defaultRoles;
  } else {
    for (const def of defaultRoles) {
      if (!db.roles.find((r) => r.id === def.id)) db.roles.push(def);
    }
  }
  return db;
}

// Node executes each handler's read→mutate→write synchronously (no await between),
// so the event loop never interleaves two writers — this is effectively atomic.
export function write(db) {
  ensure();
  atomicWrite(db);
}

// Convenience transaction helper for read-modify-write in one synchronous step.
export function update(mutator) {
  const db = read();
  const result = mutator(db);
  write(db);
  return result ?? db;
}

export function reset() {
  atomicWrite(seed());
  return read();
}
