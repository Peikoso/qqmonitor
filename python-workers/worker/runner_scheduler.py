import asyncio
import time
from datetime import datetime
from models.runners import RunnerQueue
from repositories.runners import RunnersRepository, RunnerQueueRepository
from repositories.rules import RulesRepository

class RunnerScheduler:
    def __init__(self):
        self.is_running = False
        self.check_interval = 10 # 10 segundos

    def start(self):
        if self.is_running:
            print('[Runner Scheduler] Scheduler já está rodando.')
            return

        print('[Runner Scheduler] Iniciando scheduler...')
        self.is_running = True

        asyncio.run(self._run_async())

    async def _run_async(self):
        while self.is_running:
            try:
                await self.schedule_runners_to_queue()
            except Exception as error:
                print(f'[Runner Scheduler] Erro no agendamento: {error}')

            await asyncio.sleep(self.check_interval)

    def stop(self):
        print('[Runner Scheduler] Parando scheduler...')
        self.is_running = False

    async def schedule_runners_to_queue(self):
        all_runners = await RunnersRepository.find_all_for_scheduling()
        print(f'[Runner Scheduler] Verificando {len(all_runners)} runner(s) para agendamento...')

        if len(all_runners) == 0:
            return

        scheduled_count = 0
        for runner in all_runners:
            try:
                was_scheduled = await self.schedule_runner(runner)
                if was_scheduled:
                    scheduled_count += 1
                await asyncio.sleep(1)
            except Exception as error:
                print(f'[Runner Scheduler] Erro ao agendar runner {runner.id}: {error}')

        if scheduled_count > 0:
            print(f'[Runner Scheduler] {scheduled_count} runner(s) agendado(s).')

    async def schedule_runner(self, runner):
        runner_id = runner.id
        rule_id = runner.rule_id
        last_run_at = runner.last_run_at

        rule = await RulesRepository.find_by_id(rule_id)

        is_active = rule.is_active
        if not is_active:
            print(f'[Runner Scheduler] Regra "{rule.name}" está inativa. Pulando agendamento.')
            return False

        postpone_date = rule.postpone_date
        if postpone_date and datetime.fromisoformat(str(postpone_date)) > datetime.now():
            print(f'[Runner Scheduler] Regra "{rule.name}" está adiada até {postpone_date}. Pulando agendamento.')
            return False

        if not self.is_within_execution_window(rule):
            print(f'[Runner Scheduler] Regra "{rule.name}" está fora da janela de execução. Pulando agendamento.')
            return False

        execution_interval_ms = rule.execution_interval_ms
        now = time.time() * 1000  # milliseconds

        if last_run_at:
            time_since_last_run = now - datetime.fromisoformat(str(last_run_at)).timestamp() * 1000
            if time_since_last_run < execution_interval_ms:
                print(f'[Runner Scheduler] Regra "{rule.name}" foi executada recentemente. Pulando agendamento.')
                return False

        existing_runner_queue = await RunnerQueueRepository.find_pending_by_runner_id(runner_id)
        if existing_runner_queue:
            print(f'[Runner Scheduler] Runner {runner_id} já está na fila.')
            return False

        new_runner_queue = RunnerQueue(runner_id=runner_id, scheduled_for=datetime.now())
        
        await RunnerQueueRepository.create(new_runner_queue)

        print(f'[Runner Scheduler] Runner agendado para regra: "{rule.name}" (intervalo: {rule.execution_interval_ms / 1000 / 60} minutos)')

        await RunnersRepository.update(runner.update_status('SCHEDULED'))

        return True

    def is_within_execution_window(self, rule):
        now = datetime.now()
        current_time = now.strftime('%H:%M:%S')

        start_time = str(rule.start_time)
        end_time = str(rule.end_time)

        current = self.time_to_seconds(current_time)
        start = self.time_to_seconds(start_time)
        end = self.time_to_seconds(end_time)

        if end < start:
            return current >= start or current <= end

        return current >= start and current <= end

    def time_to_seconds(self, time_string):
        parts = time_string.split(':')
        hours = int(parts[0])
        minutes = int(parts[1])
        seconds = int(parts[2]) if len(parts) > 2 else 0
        return ((hours * 60 + minutes) * 60) + seconds


if __name__ == '__main__':
    scheduler = RunnerScheduler()
    try:
        scheduler.start()
    except KeyboardInterrupt:
        scheduler.stop()
        print('[Runner Scheduler] Scheduler finalizado.')
