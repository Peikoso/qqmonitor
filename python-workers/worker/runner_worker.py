import asyncio
import time
import json
from datetime import datetime
from models.runners import RunnerLogs
from repositories.runners import RunnersRepository, RunnerQueueRepository, RunnerLogsRepository
from repositories.rules import RulesRepository
from sqlalchemy import text
from config.database import get_session
from config.index import API_INCIDENTS_URL, TOKEN_API

import requests


class RunnerWorker:
    def __init__(self):
        self.is_running = False
        self.check_interval = 5  # 5 segundos
        self.max_concurrent_runners = 3  # Limite de runners concorrentes

    def start(self):
        if self.is_running:
            print('[Runner Worker] Worker já está rodando.')
            return
        
        print('[Runner Worker] Iniciando worker...')
        self.is_running = True

        asyncio.run(self._run_async())

    async def _run_async(self):
        while self.is_running:
            try:
                await self.process_runner_queue()
            except Exception as error:
                print(f'[Runner Worker] Erro no processamento: {error}')
            
            await asyncio.sleep(self.check_interval)

    def stop(self):
        print('[Runner Worker] Parando worker...')
        self.is_running = False

    async def process_runner_queue(self):
        pending_jobs = await RunnerQueueRepository.find_pending_jobs(self.max_concurrent_runners)

        if len(pending_jobs) == 0:
            print('[Runner Worker] Nenhum runner pendente na fila.')
            return

        print(f'[Runner Worker] {len(pending_jobs)} runner(s) encontrado(s).')

        tasks = [self.execute_runner(job) for job in pending_jobs]
        await asyncio.gather(*tasks, return_exceptions=True)
        
        await asyncio.sleep(1)

    async def execute_runner(self, job):
        start_time = time.time()
        queue_id = job.id
        runner_id = job.runner_id
        
        print(f'[Runner Worker] Executando job {queue_id} (runner: {runner_id})')
        
        runner = await RunnersRepository.find_by_id(runner_id)
        rule_id = runner.rule_id
        rule = await RulesRepository.find_by_id(rule_id)

        try:
            await RunnerQueueRepository.update(job.start())
            await RunnersRepository.update(runner.update_status('RUNNING'))

            if not rule.is_active:
                print(f'[Runner Worker] Regra {rule_id} está inativa. Pulando execução.')
                await RunnerQueueRepository.update(job.complete())
                return

            execution_result = await self.execute_sql_query(rule.sql, rule.timeout_ms)
            run_time_ms = int((time.time() - start_time) * 1000)

            new_runner_logs = RunnerLogs(
                runner_id=runner_id,
                queue_id=queue_id,
                run_time_ms=run_time_ms,
                execution_status='SUCCESS',
                rows_affected=execution_result['rows_affected'] or 0,
                result=json.dumps(execution_result['rows']),
                error=None,
                executed_at=datetime.now()
            )
            
            await RunnerLogsRepository.create(new_runner_logs)

            await RunnersRepository.update(runner.idle())
            await RunnerQueueRepository.update(job.complete())

            print(f'[Runner Worker] Job {queue_id} concluído com sucesso. Linhas afetadas: {execution_result["rows_affected"]}')
            
            if(execution_result['rows_affected'] > 0):
                print(f'[Runner Worker] Incidentes detectados na regra {rule_id}.')
                await RulesRepository.update_disabled_status(rule_id, False)
                
                payload = {
                    'ruleId': str(rule_id),
                    'priority': rule.priority
                }
                
                try:
                    response = requests.post(API_INCIDENTS_URL, json=payload, headers={"Authorization": f"Token {TOKEN_API}"})
                    
                    print(f'[Runner Worker] Notificação enviada para API de incidentes. Status code: {response.status_code}') 
                except Exception as api_error:
                    print(f'[Runner Worker] Erro ao notificar API de incidentes: {str(api_error)}')   

            self.log_metrics({
                'queueId': queue_id,
                'runnerId': runner_id,
                'ruleId': rule_id,
                'runTimeMs': run_time_ms,
                'status': 'SUCCESS',
                'rowsAffected': execution_result['rows_affected']
            })

        except Exception as error:
            run_time_ms = int((time.time() - start_time) * 1000)
            print(f'[Runner Worker] Erro ao executar job {queue_id}: {str(error)}')

            execution_status = 'TIMEOUT' if 'timeout' in str(error).lower() else 'ERROR'

            new_runner_logs = RunnerLogs(
                runner_id=runner_id,
                queue_id=queue_id,
                run_time_ms=run_time_ms,
                execution_status=execution_status,
                rows_affected=0,
                result=None,
                error=str(error),
                executed_at=datetime.now()
            )
            
            await RunnerLogsRepository.create(new_runner_logs)

            await RunnersRepository.update(runner.fail())

            new_attempt_count = (job.attempt_count or 0) + 1

            if new_attempt_count >= rule.max_error_count:
                await RunnerQueueRepository.update(job.fail(new_attempt_count))
            else:
                await RunnerQueueRepository.update(job.retry(new_attempt_count))

            self.log_metrics({
                'queueId': queue_id,
                'runnerId': runner_id,
                'runTimeMs': run_time_ms,
                'status': 'ERROR',
                'error': str(error)
            })

    async def execute_sql_query(self, sql, timeout_ms):
        async with get_session() as session:
            await session.execute(text(f"SET statement_timeout = {timeout_ms}"))
            
            result = await session.execute(text(sql))
            
            columns = result.keys()
            rows = result.fetchall()
            
            await session.commit()
            
            return {
                'rows': [dict(zip(columns, row)) for row in rows],
                'rows_affected': result.rowcount or 0
            }

    def log_metrics(self, metrics):
        print('[Runner Metrics]', json.dumps({
            'timestamp': datetime.now().isoformat(),
            **metrics
        }, default=str))


if __name__ == '__main__':
    worker = RunnerWorker()
    try:
        worker.start()
    except KeyboardInterrupt:
        worker.stop()
        print('[Runner Worker] Worker finalizado.')
