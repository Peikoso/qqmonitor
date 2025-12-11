import express from 'express';
import cors from 'cors';
import process from 'process';
import routes from './routers/index.js';
import { AuthMiddleware } from './middleware/auth-middleware.js';
import { ErrorMiddleware } from './middleware/error-middleware.js';
import { ValidateBodyMiddleware } from './middleware/validate-body-middleware.js';
import { config } from './config/index.js';
import dbSetup from './config/db-setup.js';
import helmet from 'helmet';
import { redact } from './utils/redact.js';


const app = express();

app.use(helmet({
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
  },
  frameguard: {
    action: 'deny'
  },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  referrerPolicy: {
    policy: 'no-referrer'
  }
}));

app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}));

app.use(express.json());
app.use(AuthMiddleware);  // Comente para desativar a Auth (Vai quebrar praticamente todos endpoints, sendo necessarios alterações para funcionar sem Auth..)
app.use(ValidateBodyMiddleware)

const PORT = config.PORT || 8000;

// Iniciar o banco (criação de tabelas, inserção de dados e usuário admin)
(async () => {
  await dbSetup.initDB();
  //await dbSetup.insertDefaultData();
  await dbSetup.createAdminUser();
})();

app.get('/', async(req, res) => {
    res.json('Bem Vindo ao QQMonitor');
});

app.use('/api/v1', routes);
app.use(ErrorMiddleware);

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', redact(reason));
});

process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', redact(err));
  // Em produção pode ser desejável reiniciar o processo  
}); // sem esses handlers, a aplicação pode morrer sem logs claros, com eles você pelo menos registra o erro.

// Start
app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});