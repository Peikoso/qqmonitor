# QQMonitor Backend API

Sistema de monitoramento e execução automatizada de regras SQL com notificações em tempo real, escalonamento de incidentes e gestão de canais de comunicação.

**✨ Sprint 3 Completa**: Canais de notificação, Preferências de usuário, Políticas de escalonamento

## 📋 Pré-requisitos

- **Node.js** 20+ 
- **PostgreSQL** 16+
- **pnpm** (gerenciador de pacotes)
- **Firebase Admin SDK** configurado

## 🚀 Configuração Inicial

### 1. Instalar Dependências

```bash
pnpm install
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo `.env-example` para `.env`:

```bash
cp .env-example .env
```

Configure as variáveis no arquivo `.env`:

## API
DATABASE_URL=
PORT=
SERVICE_PATH=
DEFAULT_PASSWORD=
FIREBASE_API_KEY=
TOKEN_API=

# PostgreSQL
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=
POSTGRES_PORT=
DB_HOST=


### 3. Aplicar Migrations no Banco de Dados

A aplicação utiliza o arquivo `script.sql` para criar a estrutura do banco de dados.
em seguida, o arquivo `some-inserts.sql` para popular com dados de teste.

**manualmente:**
Execute os scripts SQL na seguinte ordem:

```bash
# 1. Criar estrutura do banco
psql -h localhost -U seu_usuario -d qqmonitor -f script.sql

# 2. Popular com dados de teste
psql -h localhost -U seu_usuario -d qqmonitor -f some-inserts.sql
```

**Ou via DATABASE_URL:**

```bash
psql $DATABASE_URL -f script.sql
psql $DATABASE_URL -f some-inserts.sql
```



### 4. Configurar Firebase Admin SDK

Coloque o arquivo JSON do Firebase Admin SDK na raiz do projeto com o nome:
```
plantao-monitor-firebase-adminsdk.json
```

## ▶️ Executar Aplicação

```bash
node src/main.js
```

A API estará disponível em: `http://localhost:8000`

## 🧪 Testar Endpoint /db-test

Use o endpoint `/api/v1/login` para efetuar login(email + senha) e obter um token JWT do Firebase.

Ao iniciar a aplicação, um usuário admin padrão é criado com as seguintes credenciais (caso não exista):
- Email: `admin@example.com`
- Senha: `senha_padrao` (Definida na variável `DEFAULT_PASSWORD` do `.env`)

Use o comando curl abaixo, substituindo `SEU_TOKEN_FIREBASE` pelo token válido do Firebase:
O usuário deve estar autenticado no Firebase e criado no banco de dados com profile = 'admin' para acessar este endpoint.

```bash
curl -H "Authorization: Bearer SEU_TOKEN_FIREBASE" http://localhost:8000/api/v1/db-test
```

### Resposta esperada:

```json
{
  "currentTime": "2025-11-28T03:58:42.451Z",
  "pgVersion": "PostgreSQL 17.4 on x86_64-windows, compiled by msvc-19.42.34436, 64-bit",
  "tableCounts": {
    "users": 5,
    "user_preferences": 3,
    "user_preferences_channels": 4,
    "channels": 4,
    "rules": 5,
    "rules_roles": 5,
    "roles": 5,
    "users_roles": 3,
    "incidents": 6,
    "schedules": 5,
    "incidents_events": 5,
    "runners": 5,
    "runner_queue": 33,
    "runner_logs": 94,
    "audit_logs": 5,
    "notifications": 5,
    "sql_test_logs": 5,
    "escalation_policy": 5,
    "app_settings": 5,
    "plantao_monitor": 1
  }
}
```

## 📁 Estrutura do Projeto

```
qqtech9-backend/
├── src/
│   ├── config/          # Configurações (DB, Firebase)
│   ├── controllers/     # Controladores das rotas
│   ├── dto/             # Data Transfer Objects
│   ├── middleware/      # Middlewares (Auth, Errors, Validação)
│   ├── models/          # Modelos de negócio
│   ├── repositories/    # Acesso a dados (SQL)
│   ├── routers/         # Definição de rotas
│   ├── services/        # Lógica de negócio
│   │   ├── notification-dispatcher.js  # Disparo de notificações ✨
│   │   └── notifications.js            # Lógica de notificações ✨
│   ├── utils/           # Utilitários
│   └── main.js          # Ponto de entrada
├── script.sql           # Migration principal
├── some-inserts.sql     # Dados de teste
└── package.json
```

## 🌐 Endpoints da API

Todos os endpoints estão sob o prefixo `/api/v1`

### Autenticação
```
POST   /login                          - Login com email e senha (retorna token Firebase)
```

### Usuários (`/users`)
```
GET    /users                          - Listar todos os usuários
GET    /users/basic-info               - Listar usuários com info básica
GET    /users/me                       - Obter dados do usuário autenticado
GET    /users/:id/name                 - Obter nome do usuário por ID
POST   /users                          - Criar usuário (admin)
POST   /users/register                 - Registrar novo usuário (autoregistro)
POST   /users/:userId/approve          - Aprovar usuário pendente
PATCH  /users/me                       - Atualizar próprio perfil
PATCH  /users/fcm-token                - Atualizar token FCM (push notifications)
PATCH  /users/:id                      - Atualizar usuário (admin)
DELETE /users/:id                      - Deletar usuário
```

### Roles (`/roles`)
```
GET    /roles                          - Listar todas as roles
POST   /roles                          - Criar role
PATCH  /roles/:id                      - Atualizar role
DELETE /roles/:id                      - Deletar role
```

### Regras (`/rules`)
```
GET    /rules                          - Listar todas as regras
POST   /rules                          - Criar regra
PATCH  /rules/:id                      - Atualizar regra
DELETE /rules/:id                      - Deletar regra
POST   /rules/:id/toggle-silence       - Ativar/desativar modo silencioso
POST   /rules/:id/toggle-execution     - Ativar/desativar execução da regra
```

### Incidentes (`/incidents`)
```
GET    /incidents                      - Listar todos os incidentes
GET    /incidents/:id                  - Obter incidente específico
GET    /incidents/:id/eligible-users   - Obter usuários elegíveis para incidente
POST   /incidents                      - Criar incidente
PATCH  /incidents/:id/manual-escalation - Escalonamento manual de incidente
POST   /incidents/:id/action           - Registrar ação no incidente (ACK/CLOSE)
POST   /incidents/:id/reexecute        - Reexecutar regra do incidente
GET    /incidents/:id/logs             - Obter histórico de eventos do incidente
```

### Runners (`/runners`)
```
GET    /runners                        - Listar todos os runners
GET    /runners/queue                  - Listar fila de execução
GET    /runners/logs                   - Listar logs de execução
```

### Escalas (`/schedules`)
```
GET    /schedules                      - Listar escalas futuras/ativas
GET    /schedules/:id                  - Obter escala específica
POST   /schedules                      - Criar escala on-call
PATCH  /schedules/:id                  - Atualizar escala
DELETE /schedules/:id                  - Deletar escala
```

### Canais de Notificação (`/config`)
```
GET    /config                         - Listar todos os canais
GET    /config/active                  - Listar apenas canais ativos
POST   /config                         - Criar canal (EMAIL/PUSH)
PATCH  /config/:id                     - Atualizar canal
DELETE /config/:id                     - Deletar canal
```

**Exemplo - Criar canal EMAIL:**
```json
POST /api/v1/config
{
  "name": "Email Corporativo",
  "type": "EMAIL",
  "isActive": true,
  "config": {
    "service": "gmail",
    "user": "notificacoes@empresa.com",
    "password": "senha_app_google"
  }
}
```

**Exemplo - Criar canal PUSH:**
```json
POST /api/v1/config
{
  "name": "Push Notifications",
  "type": "PUSH",
  "isActive": true,
  "config": {
    "serverKey": "sua_firebase_server_key"
  }
}
```

### Preferências de Usuário (`/user-preferences`)
```
GET    /user-preferences               - Obter preferências do usuário autenticado
POST   /user-preferences               - Criar preferências
PATCH  /user-preferences               - Atualizar preferências
DELETE /user-preferences               - Deletar preferências
```

### Políticas de Escalonamento (`/escalation-policies`)
```
GET    /escalation-policies            - Obter política de escalonamento
POST   /escalation-policies            - Criar política
PATCH  /escalation-policies            - Atualizar política
```

### Notificações (`/notifications`)
```
GET    /notifications/me               - Listar notificações do usuário autenticado
POST   /notifications                  - Criar notificação (usado pelos workers)
PATCH  /notifications/:id              - Atualizar notificação (marcar como lida)
```

### Testes SQL (`/sql-tests`)
```
GET    /sql-tests                      - Listar histórico de testes SQL
POST   /sql-tests                      - Executar teste SQL
```

### Métricas (`/metrics`)
```
GET    /metrics/basic                  - Obter métricas básicas do dashboard
```

### Logs de Auditoria (`/audit-logs`)
```
GET    /audit-logs                     - Listar logs de auditoria
```

### Teste de Conexão (`/db-test`)
```
GET    /db-test                        - Testar conexão com banco (admin only)
```


## 🧪 Testando a API

### 1. Login e obter token
```bash
curl -X POST http://localhost:8000/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "senha_padrao"}'
```


## 📦 Dependências Principais

- **express** - Framework web
- **pg** - Cliente PostgreSQL
- **firebase-admin** - Autenticação e Push notifications
- **nodemailer** - Email notifications
- **dotenv** - Variáveis de ambiente
- **bcrypt** - Hash de senhas

## 🐛 Troubleshooting

### Email não envia

- **Gmail**: Use "Senha de App" em vez da senha normal
- **Outlook**: Habilite SMTP nas configurações da conta
- **Firewall**: Verifique portas 587 (TLS) ou 465 (SSL)

### Push notifications não funcionam

- Verificar Firebase Admin SDK configurado
- Verificar FCM token do usuário está atualizado
- Verificar permissões no Firebase Console

## 📝 Variáveis de Ambiente

```bash
# API
DATABASE_URL=postgresql://user:pass@host:5432/dbname
PORT=8000
SERVICE_PATH=/api/v1
DEFAULT_PASSWORD=senha_admin_padrao
FIREBASE_API_KEY=sua_api_key
TOKEN_API=token_autenticacao_workers

# PostgreSQL
POSTGRES_USER=user
POSTGRES_PASSWORD=pass
POSTGRES_DB=qqmonitor
POSTGRES_PORT=5432
DB_HOST=localhost
```

## 🐳 Docker

### Executar com Docker Compose
```bash
docker-compose up -d
```

### Ver logs
```bash
docker-compose logs -f
```

### Parar aplicação
```bash
docker-compose down
```

**Desenvolvido para QQTech** | Versão 1.0.0 |
