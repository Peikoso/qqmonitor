import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './index.js';
import { pool } from './database-conn.js';
import { admin } from './firebase.js'
import { Users } from '../models/users.js';

async function initDB() {
  try {
    // Transformar import.meta.url em __dirname
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // Caminho para o script.sql
    const sqlPath = path.join(__dirname, '../../script.sql');

    // Lê o arquivo SQL
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Executa o SQL no banco
    await pool.query(sql);
    console.log('Banco inicializado com sucesso!');
  } catch (error) {
    console.error('Erro ao inicializar o banco:', error);
  }
}

async function insertDefaultData() {
      try {
        // Transformar import.meta.url em __dirname
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        // Caminho para o script.sql
        const sqlPath = path.join(__dirname, '../../some-inserts.sql');

        // Lê o arquivo SQL
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Executa o SQL no banco
        await pool.query(sql);  
    console.log('Dados padrão inseridos com sucesso!');
  } catch (error) {
    console.error('Erro ao inserir dados padrão:', error);
  }

}

async function createAdminUser() {
    const adminUser = new Users({
        name: 'Admin User',
        matricula: 'ADMIN001',
        email: 'admin@example.com',
        profile: 'admin',
        pending: false
    });

    let fireBaseUser = await admin.auth().getUserByEmail(adminUser.email).catch(() => null);
    let createdNow = false;

    if(!fireBaseUser){
        fireBaseUser = await admin.auth().createUser({
            email: adminUser.email,
            displayName: adminUser.name,
            password: config.DEFAULT_PASSWORD
        });
        
        createdNow = true;
    }

    adminUser.firebaseId = fireBaseUser.uid;

    try{
        const insertAdminQuery = 
        `
        INSERT INTO users
        (firebase_id, name, matricula, email, profile, pending)
        SELECT d.firebase_id, d.name, d.matricula, d.email, d.profile, d.pending::boolean
        FROM (VALUES ($1, $2, $3, $4, $5, $6))
        AS d(firebase_id, name, matricula, email, profile, pending)
        WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = d.email or matricula = d.matricula)
        RETURNING *;
        `;

        const values = [
            adminUser.firebaseId,
            adminUser.name,
            adminUser.matricula,
            adminUser.email,
            adminUser.profile,
            adminUser.pending,
        ];
        
        const result = await pool.query(insertAdminQuery, values);

        if(!result.rows[0]){
            console.log('Usuário admin já existe no banco de dados.');
            return;
        }

        console.log('Admin user criado com sucesso:', new Users(result.rows[0]));
    } catch(error){
        console.error(error);

        if(createdNow){
            await admin.auth().deleteUser(fireBaseUser.uid);
        }
    }
          
}


export default {initDB, insertDefaultData, createAdminUser};