# Python Workers - QQMonitor

Workers em Python para processamento de runners, agendamento de tarefas, escalonamento de incidentes e notificações.

## 📦 Estrutura

```
python-workers/
├── config/
│   ├── database.py          # Configuração do pool de conexões PostgreSQL
│   └── index.py             # Configurações gerais (TOKEN_API, API_URL)
├── models/
│   ├── runners.py           # Models: Runners, RunnerQueue, RunnerLogs
│   ├── rules.py             # Model: Rules
│   ├── incidents.py         # Model: Incidents
│   ├── escalation.py        # Models: EscalationPolicy, EscalationSteps
│   ├── schedules.py         # Model: Schedules
│   └── users.py             # Model: Users
├── repositories/
│   ├── runners.py           # Repository para Runners, RunnerQueue, RunnerLogs
│   ├── rules.py             # Repository para Rules
│   ├── incidents.py         # Repository para Incidents
│   ├── escalation.py        # Repository para políticas de escalonamento
│   ├── schedules.py         # Repository para Schedules (on-call)
│   └── users.py             # Repository para Users
├── worker/
│   ├── runner_worker.py     # Worker que processa jobs da fila de runners
│   ├── runner_scheduler.py  # Scheduler que agenda runners para execução
│   └── escalation_worker.py # Worker de escalonamento de incidentes
├── requirements.txt         # Dependências Python
├── .env.example            # Exemplo de variáveis de ambiente
├── Dockerfile              # Container Docker
├── docker-compose.yml      # Orquestração dos workers
└── README.md               # Este arquivo
```

## 🚀 Instalação

### 1. Criar ambiente virtual

```bash
python -m venv venv
```

### 2. Ativar ambiente virtual

```bash
# Windows PowerShell
.\venv\Scripts\Activate.ps1

# Windows CMD
.\venv\Scripts\activate.bat

# Linux/Mac
source venv/bin/activate
```

### 3. Instalar dependências

```bash
pip install -r requirements.txt
```

### 4. Configurar variáveis de ambiente

```bash
# Copiar o arquivo de exemplo
cp .env.example .env

# Editar .env com suas credenciais
DATABASE_URL=postgresql+asyncpg://USER:PASSWORD@HOST:PORT/DBNAME
TOKEN_API=seu_token_de_autenticacao_da_api
API_URL=http://localhost:8000/api/v1
```

## ▶️ Execução

### Opção 1: Executar individualmente

#### Runner Worker
Processa jobs pendentes na fila:
```bash
python -m worker.runner_worker
```

#### Runner Scheduler
Agenda runners para execução baseado nas regras:
```bash
python -m worker.runner_scheduler
```

#### Escalation Worker 
Processa escalonamento de incidentes não reconhecidos:
```bash
python -m worker.escalation_worker
```

### Opção 2: Docker Compose (Recomendado)

```bash
# Iniciar todos os workers
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar workers
docker-compose down
```

## 🔧 Funcionalidades

### Runner Worker (`runner_worker.py`)
- ✅ Verifica fila a cada 5 segundos
- ✅ Processa até 3 runners concorrentemente
- ✅ Executa queries SQL com timeout configurável
- ✅ Registra logs de execução detalhados
- ✅ Gerencia tentativas e erros
- ✅ Atualiza status dos runners automaticamente
- ✅ **Cria incidentes automaticamente quando detecta problemas fazendo chamada a API**
- ✅ **Notifica usuários via API sobre novos incidentes**

### Runner Scheduler (`runner_scheduler.py`)
- ✅ Verifica runners a cada 10 segundos
- ✅ Respeita intervalos de execução configurados
- ✅ Valida janelas de execução (start_time/end_time)
- ✅ Respeita datas de adiamento (postpone_date)
- ✅ Prioriza runners (HIGH > MEDIUM > LOW)

### Escalation Worker (`escalation_worker.py`)
- ✅ Verifica incidentes não reconhecidos a cada 60 segundos
- ✅ Escala incidentes baseado no timeout configurado (politica_escalonamento)
- ✅ Respeita ordem de escalonamento (escalation_order: 1, 2, 3)
- ✅ Busca próximo usuário disponível na escala (schedules)
- ✅ Notifica usuários via API ao escalar
- ✅ **Se não houver mais usuários na escala, notifica todos os admins com a role correspondente**
- ✅ Registra histórico de escalonamento (escalation_steps)
- ✅ Limita máximo de 3 tentativas de escalonamento

## 📊 Fluxo de Escalonamento

```
Incidente OPEN (não ACK em X minutos)
    ↓
Escalation Worker detecta
    ↓
Busca próximo usuário na escala
    ↓
┌─────────────────────┐
│ Existe próximo user? │
└─────────┬───────────┘
          │
    ┌─────┴──────┐
   SIM          NÃO
    │             │
    ↓             ↓
Atribui       Notifica
incidente     TODOS os
ao user       ADMINS
    │             │
    ↓             │
Notifica          │
o user            │
    │             │
    ↓             ↓
Registra     Registra
escalation   "NOTIFIED 
step         ADMINS"
```

## 🔔 Sistema de Notificações

### Como funciona:
1. **Worker detecta problema** → Cria incidente
2. **Worker chama API** `/notifications` com dados do incidente
3. **API valida preferências do usuário**:
   - Verifica horários DND (Do Not Disturb)
   - Busca canais de notificação configurados
4. **API dispara notificação** via canais ativos:
   - 📧 **Email (SMTP)**: Configurado em `channels` com tipo EMAIL
   - 📱 **Push (Firebase)**: Configurado em `channels` com tipo PUSH
5. **Registro salvo** em `notifications` com status (SENT/FAILED/SILENCED)

### Preferências de usuário:
- Cada usuário pode configurar canais preferidos
- DND (Do Not Disturb): Define horários para não receber notificações
- Se estiver em DND, notificação é marcada como SILENCED

## 🧪 Testar Escalonamento

```bash
# 1. Criar um incidente OPEN no banco
# 2. Não fazer ACK por X minutos (conforme timeout_ms da política)
# 3. Verificar logs do escalation_worker:

[Escalation Worker] Incidente {id} escalado para o usuário {user_id}
[Escalation Worker] Notificação enviada para API. Status code: 201
```

## 📋 Dependências Principais

- `asyncpg` - Driver assíncrono PostgreSQL
- `sqlalchemy` - ORM para banco de dados
- `python-dotenv` - Gerenciamento de variáveis de ambiente
- `requests` - Chamadas HTTP para API

## 🐛 Troubleshooting

### Worker não inicia
- Verifique se o DATABASE_URL está correto
- Verifique conexão com PostgreSQL
- Verifique se as tabelas foram criadas (script.sql)

### Notificações não são enviadas
- Verifique se TOKEN_API está configurado
- Verifique se API_URL está acessível
- Verifique logs da API para erros de autenticação

### Escalonamento não funciona
- Verifique se existe política de escalonamento cadastrada
- Verifique se há usuários na escala (schedules)
- Verifique timeout_ms da política

## 📝 Variáveis de Ambiente

```bash
# Banco de dados
DATABASE_URL=postgresql+asyncpg://user:pass@host:port/dbname

# API Backend
TOKEN_API=token_de_autenticacao_fixo
API_URL=http://localhost:8000/api/v1
```

## 🐳 Docker

### Build da imagem
```bash
docker build -t qqmonitor-workers .
```

### Executar worker específico
```bash
docker run --env-file .env qqmonitor-workers python -m worker.runner_worker
```
