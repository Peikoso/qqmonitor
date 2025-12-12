import sys
import pandas as pd
from sqlalchemy import create_engine
from dotenv import load_dotenv
import os

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

def calculate_metrics(start_date, end_date):
    engine = create_engine(DATABASE_URL.replace('+asyncpg', ''))
    
    incidents_df = pd.read_sql("""
        SELECT id, status, created_at, ack_at, closed_at, rule_id 
        FROM incidents 
        WHERE DATE(created_at) BETWEEN %(start_date)s AND %(end_date)s
    """, engine, params={"start_date": start_date, "end_date": end_date})
    
    for col in ['created_at', 'ack_at', 'closed_at']:
        incidents_df[col] = pd.to_datetime(incidents_df[col], errors='coerce')
    
    runner_logs_df = pd.read_sql("""
        SELECT execution_status, executed_at, runner_id
        FROM runner_logs 
        WHERE DATE(executed_at) BETWEEN %(start_date)s AND %(end_date)s
    """, engine, params={"start_date": start_date, "end_date": end_date})
    
    runner_logs_df['executed_at'] = pd.to_datetime(runner_logs_df['executed_at'], errors='coerce')
    
    escalation_df = pd.read_sql("""
        SELECT incident_id, escalation_order
        FROM escalation_steps
        WHERE DATE(escalated_at) BETWEEN %(start_date)s AND %(end_date)s
    """, engine, params={"start_date": start_date, "end_date": end_date})
    
    notifications_df = pd.read_sql("""
        SELECT id, sent_at
        FROM notifications 
        WHERE DATE(created_at) BETWEEN %(start_date)s AND %(end_date)s
    """, engine, params={"start_date": start_date, "end_date": end_date})
    
    notifications_df['sent_at'] = pd.to_datetime(notifications_df['sent_at'], errors='coerce')
    
    rules_df = pd.read_sql("SELECT is_active FROM rules", engine)
    
    runner_logs_sucess_count = (runner_logs_df['execution_status'] == 'SUCCESS').sum()

    metrics = {
        'total_incidentes': int(len(incidents_df),),
        
        'tempo_medio_ack': (
            (incidents_df['ack_at'] - incidents_df['created_at'])
            .dt.total_seconds() / 60
        ).mean(),
        
        'tempo_medio_res': (
            (incidents_df['closed_at'] - incidents_df['created_at'])
            .dt.total_seconds() / 60
        ).mean(),
         
        'taxa_erro_regra': (
            len(incidents_df)
            / runner_logs_sucess_count * 100
        ) if runner_logs_sucess_count > 0   else 0,
        
        'tempo_medio_entre_incidentes': (
            incidents_df.sort_values('created_at')['created_at']
            .diff()
            .dt.total_seconds() / 60
        ).mean(),
        
        'total_execucoes_regras': int(len(runner_logs_df),),
        
        'incidentes_escalonados': int(escalation_df['incident_id'].nunique(),),
        
        'notificacoes_enviadas': int(len(notifications_df),),
        
        'regras_ativas': int(rules_df['is_active'].sum(),),
        
        'incidentes_abertos': int((incidents_df['status'] == 'OPEN').sum(),)
    }
    
    for k, v in metrics.items():
        if isinstance(v, float) and pd.isna(v):
            metrics[k] = None
            
    return metrics

