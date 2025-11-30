# QQMonitor Backend

Sistema de monitoramento e execução automatizada de regras SQL com notificações em tempo real.

## 📋 Pré-requisitos

- **Node.js** 18+ 
- **PostgreSQL** 14+
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
│   ├── utils/           # Utilitários
│   └── main.js          # Ponto de entrada
├── script.sql           # Migration principal
├── some-inserts.sql     # Dados de teste
└── package.json
```


**Desenvolvido para QQTech** | Versão 1.0.0
