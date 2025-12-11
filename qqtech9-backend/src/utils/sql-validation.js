import pkg from 'node-sql-parser';
const { Parser } = pkg;
import { redact } from './redact.js';

export function validateSQLQueryAST(query) {
    const parser = new Parser();
    let ast;

    try {
        ast = parser.astify(query, { database: 'postgresql' });
    } catch (err) {
        return { valid: false, error: `Invalid SQL syntax: ${redact(err.message)}` };
    }

    if(!ast) {
        return { valid: false, error: 'Unable to parse SQL query.' };
    }

    const allowedCommands = ['select'];

    const statements = Array.isArray(ast) ? ast : [ast];
    
    for (const statement of statements) {
        if (!allowedCommands.includes(statement.type.toLowerCase())) {
            return { valid: false, error: `SQL contains forbidden commands. Found: ${statement.type}` };
        }
    }

    return { valid: true };
};

export function validateSQLQueryRegex(sql) {
  // Regex para detectar comandos perigosos (case-insensitive, com bordas de palavra)
  const regexBloqueio = /\b(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE|REPLACE|GRANT|REVOKE|EXEC|EXECUTE|MERGE|CALL|LOCK|UNLOCK)\b/i;

  // Remove comentários e strings básicas para reduzir falsos positivos
  const sqlLimpo = sql
    .replace(/--.*$/gm, "")        // remove comentários de linha --
    .replace(/\/\*[\s\S]*?\*\//g, "") // remove comentários /* ... */
    .replace(/'(?:''|[^'])*'/g, "''") // remove strings simples
    .trim();

  // Testa se contém algum comando proibido
  const match = sqlLimpo.match(regexBloqueio);
  if (match) {
    return false;
  }

  return true;
}