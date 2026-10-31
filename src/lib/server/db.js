// Connexion à la base SQLite du prof, avec le module SQLite intégré à Node (rien à installer).

import { DatabaseSync } from 'node:sqlite';
import { resolve } from 'node:path';

const DB_PATH = process.env.DATABASE_PATH ?? resolve('src/tastemap.db');

/** @type {DatabaseSync | undefined} */
let db;

/** Ouvre la base au premier appel (en lecture seule), puis réutilise la même connexion. */
export function getDb() {
	db ??= new DatabaseSync(DB_PATH, { readOnly: true });
	return db;
}
