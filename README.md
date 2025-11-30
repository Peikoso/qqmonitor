# QQMonitor - Docker Compose

Este arquivo sobe todos os serviços do QQMonitor simultaneamente.

## Serviços incluídos:

1. **qqmonitor_database** - PostgreSQL 16
2. **qqmonitor_api** - API Node.js (Backend)
3. **qqmonitor_runner_scheduler** - Worker Python (Scheduler)
4. **qqmonitor_runner_worker** - Worker Python (Worker)

## Como usar:

### Subir todos os serviços:
```bash
docker-compose up -d
```

### Ver logs:
```bash
# Todos os serviços
docker-compose logs -f

# Serviço específico
docker-compose logs -f qqmonitor_api
docker-compose logs -f qqmonitor_runner_scheduler
docker-compose logs -f qqmonitor_runner_worker
```

### Parar os serviços:
```bash
docker-compose down
```

### Rebuild (após mudanças no código):
```bash
docker-compose up -d --build
```

## Configuração de Variáveis de Ambiente

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

