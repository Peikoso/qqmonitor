import asyncio
from repositories.schedules import SchedulesRepository
from repositories.escalation import EscalationRepository
from repositories.incidents import IncidentsRepository
from repositories.users import UsersRepository
from repositories.rules import RulesRepository
from models.escalation import EscalationSteps
import requests
from config.index import TOKEN_API, API_URL
from utils.redact import redact

class EscalationWorker:
    def __init__(self):
        self.is_running = False
        self.check_interval = 60  # 60 segundos

    def start(self):
        if self.is_running:
            print('[Escalation Worker] Worker já está rodando.')
            return

        print('[Escalation Worker] Iniciando worker...')
        self.is_running = True

        asyncio.run(self._run_async())
        
    async def _run_async(self):
        while self.is_running:
            try:
                await self.process_escalations()
            except Exception as error:
                print(f'[Escalation Worker] Erro no processamento: {redact(error)}')

            await asyncio.sleep(self.check_interval)
            
    def stop(self):
        print('[Escalation Worker] Parando worker...')
        self.is_running = False
    
    async def process_escalations(self):
        escalation_policy = await EscalationRepository.get_policy()
        expired_incidents = await IncidentsRepository.find_expired_incidents(escalation_policy.timeout_ms)
        
        if(len(expired_incidents) == 0):
            print('[Escalation Worker] Nenhum incidente expirado encontrado.')
            return
        
        for incident in expired_incidents:
            try:
                await self.escalate_incident(incident)
                await asyncio.sleep(1) 
            except Exception as error:
                print(f'[Escalation Worker] Erro ao escalar/notificar incidente {incident.id}: {redact(error)}')
                
                
                
        
    async def escalate_incident(self, incident):
        next_escalation_order = await EscalationRepository.get_next_order(incident.id)
        
        try:
            next_schedule = await SchedulesRepository.find_next_to_escalate(incident.rule_id, incident.id)
            
            if not next_schedule:
                await self.notify_admins(incident)
                return
            
            
            if(next_escalation_order > 2):
                print(f'[Escalation Worker] Incidente {incident.id} atingiu o máximo de escalonamentos.')
                print(f'[Escalation Worker] Tentando notificar admins para o incidente {incident.id}...')
                await self.notify_admins(incident)
                return
            
            await IncidentsRepository.update_assigned_user(incident.id, next_schedule.user_id)
            
            escalation_step = EscalationSteps(
                incident_id = incident.id,
                user_id = next_schedule.user_id,
                escalation_order = next_escalation_order,
                result = 'SUCCESS'
            )
            
            await EscalationRepository.create_step(escalation_step)
            
            print(f'[Escalation Worker] Incidente {incident.id} escalado para o usuário {next_schedule.user_id}.')
            
            print(f'[Escalation Worker] Notificando usuário {next_schedule.user_id} sobre o incidente {incident.id}...')
            
            rule = await RulesRepository.find_by_id(incident.rule_id)
            if not rule:
                raise Exception('Rule not found.')
            
            payload = {
                'incidentId': str(incident.id),
                'title': f'Alerta: Incidente não reconhecido.',
                'message': f'Incidente reportado para Regra: {rule.name}, Prioridade: {rule.priority}, não foi reconhecido escalamos para você.',
                'userId': str(next_schedule.user_id)
            }
            
            try:
                response = requests.post(f'{API_URL}/notifications', json=payload, headers={"Authorization": f"Token {TOKEN_API}"})

                print(f'[Escalation Worker] Notificação enviada para API. Status code: {response.status_code}')                
            except Exception as api_error:
                print(f'[Escalation Worker] Error ao notificar API: {redact(str(api_error))}')
            
        except Exception as error:
            if next_escalation_order < 3:
                escalation_step = EscalationSteps(
                    incident_id = incident.id,
                    user_id = None,
                    escalation_order = next_escalation_order,
                    result = 'FAILED'
                )
                
                await EscalationRepository.create_step(escalation_step)
            
            raise error
        
    async def notify_admins(self, incident):
        print(f'[Escalation Worker] Nenhum usuário disponível para escalonamento do incidente {incident.id}.')
        
        print(f'[Escalation Worker] Tentando encontrar admins para o incidente {incident.id}...')
        
        admins = await UsersRepository.find_admin_with_role(incident.roles_ids)
        
        if (len(admins) == 0):
            print(f'[Escalation Worker] Nenhum admin encontrado para o incidente {incident.id}.')
            
            raise Exception('Nenhum admin disponível para notificação.')
        
        escalation_step = EscalationSteps(
            incident_id = incident.id,
            user_id = None,
            escalation_order = 3,
            result = 'NOTIFIED ADMINS'
        )
        
        await EscalationRepository.create_step(escalation_step)
        
        for admin in admins:
            print(f'[Escalation Worker] Notificando incidente {incident.id} para o admin {admin.id}...')
            
            rule = await RulesRepository.find_by_id(incident.rule_id)
            if not rule:
                raise Exception('Rule not found.')
            
            payload = {
                'incidentId': str(incident.id),
                'title': f'Alerta: Incidente não reconhecido.',
                'message': f'Incidente reportado para Regra: {rule.name}, Prioridade: {rule.priority}, incidente não foi reconhecido por favor verifique.',
                'userId': str(admin.id)
            }
            
            try:
                response = requests.post(f'{API_URL}/notifications', json=payload, headers={"Authorization": f"Token {TOKEN_API}"})
                
                print(f'[Escalation Worker] Notificação enviada para API. Status code: {response.status_code}')
            except Exception as api_error:
                print(f'[Escalation Worker] Error ao notificar API: {redact(str(api_error))}')
            
    

if __name__ == '__main__':
    worker = EscalationWorker()
    try:
        worker.start()
    except KeyboardInterrupt:
        worker.stop()
        print('[Escalation Worker] Worker finalizado.')
