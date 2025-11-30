# Python Workers - Runner System

Workers em Python para processamento de runners e agendamento de tarefas.

## Estrutura

```
python-workers/
├── config/
│   └── database.py          # Configuração do pool de conexões PostgreSQL
├── models/
│   ├── runners.py           # Models: Runners, RunnerQueue, RunnerLogs
│   └── rules.py             # Model: Rules
├── repositories/
│   ├── runners.py           # Repositories para Runners, RunnerQueue, RunnerLogs
│   └── rules.py             # Repository para Rules
├── worker/
│   ├── runner_worker.py         # Worker que processa jobs da fila
│   └── runner_scheduler.py      # Scheduler que agenda runners para execução
├── requirements.txt         # Dependências Python
├── .env.example            # Exemplo de variáveis de ambiente
└── README.md               # Este arquivo
```

## Instalação

1. Criar ambiente virtual:
```bash
python -m venv venv
```

2. Ativar ambiente virtual:
```bash
# Windows PowerShell
.\venv\Scripts\Activate.ps1

# Windows CMD
.\venv\Scripts\activate.bat

# Linux/Mac
source venv/bin/activate
```

3. Instalar dependências:
```bash
pip install -r requirements.txt
```

4. Configurar variáveis de ambiente:
```bash
# Copiar o arquivo de exemplo
cp .env.example .env

# Editar .env com suas credenciais
DATABASE_URL=postgresql+asyncpg://USER:PASSWORD@HOST:PORT/DBNAME
```

## Execução

### Runner Worker
Processa jobs pendentes na fila:
```bash
python -m worker.runner_worker
```

### Runner Scheduler
Agenda runners para execução baseado nas regras:
```bash
python -m worker.runner_scheduler
```

### Executar ambos simultaneamente
Em terminais separados execute os comandos acima para iniciar ambos os workers.

## Funcionalidades

### Runner Worker (`runner_worker.py`)
- Verifica fila a cada 5 segundos
- Processa até 3 runners concorrentemente
- Executa queries SQL com timeout configurável
- Registra logs de execução
- Gerencia tentativas e erros
- Atualiza status dos runners

### Runner Scheduler (`runner_scheduler.py`)
- Verifica runners a cada 10 segundos
- Respeita intervalos de execução configurados
- Valida janelas de execução (start_time/end_time)
- Respeita datas de adiamento (postpone_date)
- Prioriza runners (HIGH > MEDIUM > LOW)
- Evita duplicação na fila

