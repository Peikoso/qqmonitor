-- ======================================
-- Tabela roles
-- Critério de unicidade: name
-- ======================================
INSERT INTO roles (name, color, description)
SELECT d.name, d.color, d.description
FROM (VALUES
    ('DBA', '#FF5733', 'Responsável pelo banco de dados'),
    ('Supervisor', '#33C4FF', 'Supervisiona equipes e processos críticos'),
    ('Operador', '#4CAF50', 'Operador de sistemas e monitoramento'),
    ('Analista', '#FFC107', 'Analista de suporte técnico'),
    ('Gerente', '#9C27B0', 'Gerente de operações e TI')
) AS d(name, color, description)
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = d.name);

-- ======================================
-- Tabela users
-- Critério de unicidade: email
-- ======================================
INSERT INTO users (firebase_id, name, matricula, email, phone, picture, profile, pending)
SELECT d.firebase_id, d.name, d.matricula, d.email, d.phone, NULL, d.profile, d.pending::boolean
FROM (VALUES
    (NULL, 'João Martins', 'MAT001', 'joao@example.com', '11999998888', 'admin', true),
    (NULL, 'Maria Santos', 'MAT002', 'maria@example.com', '11988887777', 'operator', true),
    (NULL, 'Penkas Peikson', 'MAT003', 'penkas@example.com', '11977776666', 'viewer', true),
    (NULL, 'Ana Oliveira', 'MAT004', 'ana@example.com', '11966665555', 'viewer', true),
    (NULL, 'Rogerio Oliveira', 'MAT005', 'rogerio@example.com', '11955554444', 'operator', true)
) AS d(firebase_id, name, matricula, email, phone, profile, pending)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = d.email);

-- ======================================
-- Tabela users_roles
-- Critério de unicidade: user_id + role_id
-- ======================================
INSERT INTO users_roles (user_id, role_id)
SELECT u.id, r.id 
FROM users u, roles r 
WHERE u.email='joao@example.com' AND r.name='DBA'
AND NOT EXISTS (SELECT 1 FROM users_roles WHERE user_id = u.id AND role_id = r.id);

INSERT INTO users_roles (user_id, role_id)
SELECT u.id, r.id 
FROM users u, roles r 
WHERE u.email='penkas@example.com' AND r.name='Supervisor'
AND NOT EXISTS (SELECT 1 FROM users_roles WHERE user_id = u.id AND role_id = r.id);

INSERT INTO users_roles (user_id, role_id)
SELECT u.id, r.id 
FROM users u, roles r 
WHERE u.email='rogerio@example.com' AND r.name='Analista'
AND NOT EXISTS (SELECT 1 FROM users_roles WHERE user_id = u.id AND role_id = r.id);

-- ======================================
-- Tabela user_preferences
-- Critério de unicidade: user_id
-- ======================================
INSERT INTO user_preferences (user_id, dnd_start_time, dnd_end_time)
SELECT id, '22:00:00', '07:00:00' FROM users WHERE email = 'joao@example.com'
AND NOT EXISTS (SELECT 1 FROM user_preferences WHERE user_id = users.id);

INSERT INTO user_preferences (user_id, dnd_start_time, dnd_end_time) 
SELECT id, '21:30:00', '06:30:00' FROM users WHERE email = 'penkas@example.com'
AND NOT EXISTS (SELECT 1 FROM user_preferences WHERE user_id = users.id);

INSERT INTO user_preferences (user_id, dnd_start_time, dnd_end_time) 
SELECT id, '00:00:00', '06:00:00' FROM users WHERE email = 'rogerio@example.com'
AND NOT EXISTS (SELECT 1 FROM user_preferences WHERE user_id = users.id);

-- ======================================
-- Tabela channels
-- Critério de unicidade: type (assumindo um canal por tipo para este seed, ou name)
-- ======================================
INSERT INTO channels (type, name, config, is_active)
SELECT d.type, d.name, d.config::jsonb, d.is_active::boolean
FROM (VALUES
    ('EMAIL', 'Email Corporativo', '{"smtp_server": "smtp.qqtech.com", "port": 587}', true),
    ('COMUNIQ', 'ComunIQ', '{"api_key": "abcd1234efgh5678", "channel_id": "support-alerts"}', true),
    ('PUSH', 'Notificação Push', '{"firebase_topic": "incidents"}', true),
    ('PUSH SOUND', 'Push Sound', '{"webhook_url": "https://hooks.slack.com/services/xxx"}', true)
) AS d(type, name, config, is_active)
WHERE NOT EXISTS (SELECT 1 FROM channels WHERE type = d.type);

-- ======================================
-- Tabela user_preferences_channels
-- Critério de unicidade: user_preferences_id + channel_id
-- ======================================
INSERT INTO user_preferences_channels (user_preferences_id, channel_id)
SELECT up.id, c.id 
FROM user_preferences up, channels c
WHERE up.user_id = (SELECT id FROM users WHERE email='joao@example.com' LIMIT 1)
AND c.type IN ('PUSH','EMAIL')
AND NOT EXISTS (SELECT 1 FROM user_preferences_channels WHERE user_preferences_id = up.id AND channel_id = c.id);

INSERT INTO user_preferences_channels (user_preferences_id, channel_id)
SELECT up.id, c.id 
FROM user_preferences up, channels c
WHERE up.user_id=(SELECT id FROM users WHERE email='penkas@example.com' LIMIT 1)
AND c.type='EMAIL'
AND NOT EXISTS (SELECT 1 FROM user_preferences_channels WHERE user_preferences_id = up.id AND channel_id = c.id);

INSERT INTO user_preferences_channels (user_preferences_id, channel_id)
SELECT up.id, c.id 
FROM user_preferences up, channels c
WHERE up.user_id=(SELECT id FROM users WHERE email='rogerio@example.com' LIMIT 1)
AND c.type='COMUNIQ'
AND NOT EXISTS (SELECT 1 FROM user_preferences_channels WHERE user_preferences_id = up.id AND channel_id = c.id);

-- ======================================
-- Tabela rules
-- Critério de unicidade: name
-- ======================================
INSERT INTO rules (name, description, database_type, sql, priority, execution_interval_ms, max_error_count, timeout_ms, start_time, end_time, is_active, silence_mode, user_creator_id)
SELECT d.name, d.description, d.database_type, d.sql, d.priority, d.execution_interval_ms, d.max_error_count, d.timeout_ms, d.start_time::time, d.end_time::time, d.is_active::boolean, d.silence_mode::boolean, (SELECT id FROM users WHERE email = 'joao@example.com' LIMIT 1)
FROM (VALUES
    ('Verificar Usuarios', 'Monitora a quantidade de usuarios', 'POSTGRESQL', 'SELECT count(*) FROM users', 'HIGH', 60000, 3, 5000, '00:00:00', '23:59:59', true, false),
    ('Verificar Incidentes', 'Monitora a quantidade de incidentes abertos', 'POSTGRESQL', 'SELECT count(*) FROM incidents WHERE status = ''OPEN''', 'HIGH', 30000, 5, 5000, '00:00:00', '23:59:59', true, false),
    ('Verificar Notificações', 'Monitora as notificações enviadas (não lidas)', 'POSTGRESQL', 'SELECT count(*) FROM notifications WHERE status = ''SENT''', 'MEDIUM', 120000, 3, 5000, '06:00:00', '22:00:00', true, false),
    ('Verificar Conexões BD', 'Monitora conexões ativas no banco de dados', 'POSTGRESQL', 'SELECT count(*) FROM pg_stat_activity WHERE state = ''active''', 'LOW', 180000, 2, 3000, '00:00:00', '23:59:59', true, false),
    ('Verificar Logs de Erro', 'Monitora logs de erro críticos', 'POSTGRESQL', 'SELECT * FROM runner_logs WHERE execution_status = ''ERROR'' AND executed_at > NOW() - INTERVAL ''5 minutes''', 'HIGH', 90000, 4, 8000, '00:00:00', '23:59:59', true, false)
) AS d(name, description, database_type, sql, priority, execution_interval_ms, max_error_count, timeout_ms, start_time, end_time, is_active, silence_mode)
WHERE NOT EXISTS (SELECT 1 FROM rules WHERE name = d.name);

-- ======================================
-- Tabela rules_roles
-- Critério de unicidade: rule_id + role_id
-- ======================================
INSERT INTO rules_roles (rule_id, role_id)
SELECT r.id, ro.id FROM rules r, roles ro WHERE r.name = 'Verificar Usuarios' AND ro.name = 'Administrador'
AND NOT EXISTS (SELECT 1 FROM rules_roles WHERE rule_id = r.id AND role_id = ro.id);

INSERT INTO rules_roles (rule_id, role_id)
SELECT r.id, ro.id FROM rules r, roles ro WHERE r.name = 'Verificar Incidentes' AND ro.name = 'Supervisor'
AND NOT EXISTS (SELECT 1 FROM rules_roles WHERE rule_id = r.id AND role_id = ro.id);

INSERT INTO rules_roles (rule_id, role_id)
SELECT r.id, ro.id FROM rules r, roles ro WHERE r.name = 'Verificar Notificações' AND ro.name = 'Operador'
AND NOT EXISTS (SELECT 1 FROM rules_roles WHERE rule_id = r.id AND role_id = ro.id);

INSERT INTO rules_roles (rule_id, role_id)
SELECT r.id, ro.id FROM rules r, roles ro WHERE r.name = 'Verificar Conexões BD' AND ro.name = 'Analista'
AND NOT EXISTS (SELECT 1 FROM rules_roles WHERE rule_id = r.id AND role_id = ro.id);

INSERT INTO rules_roles (rule_id, role_id)
SELECT r.id, ro.id FROM rules r, roles ro WHERE r.name = 'Verificar Logs de Erro' AND ro.name = 'Gerente'
AND NOT EXISTS (SELECT 1 FROM rules_roles WHERE rule_id = r.id AND role_id = ro.id);

-- ======================================
-- Tabela runners
-- Critério de unicidade: rule_id (assumindo 1 runner por regra)
-- ======================================
INSERT INTO runners (rule_id, status, last_run_at)
SELECT r.id, d.status, d.last_run_at::timestamp
FROM (VALUES 
    ('Verificar Usuarios', 'IDLE', '2025-11-27 10:30:00'),
    ('Verificar Incidentes', 'IDLE', '2025-11-27 11:45:00'),
    ('Verificar Notificações', 'IDLE', '2025-11-27 09:15:00'),
    ('Verificar Conexões BD', 'IDLE', '2025-11-27 08:00:00'),
    ('Verificar Logs de Erro', 'IDLE', '2025-11-27 07:20:00')
) AS d(rule_name, status, last_run_at)
JOIN rules r ON r.name = d.rule_name
WHERE NOT EXISTS (SELECT 1 FROM runners WHERE rule_id = r.id);

-- ======================================
-- Tabela runner_queue
-- Critério de unicidade: runner_id + scheduled_for
-- ======================================
INSERT INTO runner_queue (runner_id, status, scheduled_for, started_at, finished_at, attempt_count)
SELECT ru.id, d.status, d.scheduled_for::timestamp, d.started_at::timestamp, d.finished_at::timestamp, d.attempt_count
FROM (VALUES
    ('Verificar Usuarios', 'COMPLETED', '2025-11-27 10:30:00', '2025-11-27 10:30:10', '2025-11-27 10:30:15', 1),
    ('Verificar Incidentes', 'PENDING', '2025-11-27 11:45:00', NULL, NULL, 0),
    ('Verificar Notificações', 'COMPLETED', '2025-11-27 09:15:00', '2025-11-27 09:15:05', '2025-11-27 09:15:12', 1),
    ('Verificar Conexões BD', 'PENDING', '2025-11-27 12:00:00', '2025-11-27 11:59:55', NULL, 0),
    ('Verificar Logs de Erro', 'FAILED', '2025-11-27 07:20:00', '2025-11-27 07:20:02', '2025-11-27 07:20:05', 3)
) AS d(rule_name, status, scheduled_for, started_at, finished_at, attempt_count)
JOIN rules r ON r.name = d.rule_name
JOIN runners ru ON ru.rule_id = r.id
WHERE NOT EXISTS (SELECT 1 FROM runner_queue WHERE runner_id = ru.id AND scheduled_for = d.scheduled_for::timestamp);

-- ======================================
-- Tabela runner_logs
-- Critério de unicidade: runner_id + executed_at
-- ======================================
-- NOTA: O campo queue_id é complexo de resolver no INSERT SELECT sem IDs fixos, 
-- então usaremos uma aproximação segura baseada no runner e data de execução.
INSERT INTO runner_logs (runner_id, queue_id, run_time_ms, execution_status, rows_affected, result, error, executed_at)
SELECT 
    ru.id,
    (SELECT id FROM runner_queue WHERE runner_id = ru.id AND scheduled_for = d.scheduled_for_ref::timestamp LIMIT 1),
    d.run_time_ms, d.execution_status, d.rows_affected, d.result, d.error, d.executed_at::timestamp
FROM (VALUES
    ('Verificar Usuarios', '2025-11-27 10:30:00', 1250, 'SUCCESS', 3, '3 registros de usuários', NULL, '2025-11-27 10:30:15'),
    ('Verificar Incidentes', '2025-11-27 11:45:00', 2100, 'SUCCESS', 1, '1 registro de incidente crítico', NULL, '2025-11-27 11:45:10'),
    ('Verificar Notificações', '2025-11-27 09:15:00', 890, 'SUCCESS', 0, 'Nenhuma notificação crítica', NULL, '2025-11-27 09:15:12'),
    ('Verificar Conexões BD', NULL, 2450, 'SUCCESS', 45, '45 conexões ativas no banco', NULL, '2025-11-27 08:00:00'),
    ('Verificar Logs de Erro', '2025-11-27 07:20:00', 5100, 'TIMEOUT', NULL, NULL, 'Query execution timeout after 5000ms', '2025-11-27 07:20:08')
) AS d(rule_name, scheduled_for_ref, run_time_ms, execution_status, rows_affected, result, error, executed_at)
JOIN rules r ON r.name = d.rule_name
JOIN runners ru ON ru.rule_id = r.id
WHERE NOT EXISTS (SELECT 1 FROM runner_logs WHERE runner_id = ru.id AND executed_at = d.executed_at::timestamp);

-- ======================================
-- Tabela incidents
-- Critério de unicidade: rule_id + ack_at (ou closed_at se ack for null) - uma heurística para evitar duplos
-- ======================================
INSERT INTO incidents (assigned_user_id, rule_id, status, priority, created_at, ack_at, closed_at)
SELECT 
    (SELECT id FROM users WHERE email = d.user_email LIMIT 1),
    r.id, d.status, d.priority, d.created_at::timestamp, d.ack_at::timestamp, d.closed_at::timestamp
FROM (VALUES
    ('joao@example.com', 'Verificar Usuarios', 'CLOSED', 'HIGH', '2025-11-27 10:30:00', '2025-11-27 10:35:00', '2025-11-27 11:20:00'),
    ('penkas@example.com', 'Verificar Incidentes', 'ACK', 'HIGH', '2025-11-27 11:45:00', '2025-11-27 11:50:00', NULL),
    ('penkas@example.com', 'Verificar Notificações', 'OPEN', 'MEDIUM', '2025-11-27 09:15:00', NULL, NULL),
    ('rogerio@example.com', 'Verificar Usuarios', 'CLOSED', 'HIGH', '2025-11-26 14:05:00', '2025-11-26 14:10:00', '2025-11-26 15:30:00'),
    ('penkas@example.com', 'Verificar Incidentes', 'ACK', 'HIGH', '2025-11-27 08:10:00', '2025-11-27 08:15:00', NULL),
    ('maria.santos@qqtech.com', 'Verificar Logs de Erro', 'CLOSED', 'HIGH', '2025-11-27 07:25:00', '2025-11-27 07:30:00', '2025-11-27 08:00:00')
) AS d(user_email, rule_name, status, priority, created_at, ack_at, closed_at)
JOIN rules r ON r.name = d.rule_name
WHERE NOT EXISTS (
    SELECT 1 FROM incidents 
    WHERE rule_id = r.id 
    AND (ack_at = d.ack_at::timestamp OR (ack_at IS NULL AND d.ack_at IS NULL))
    AND (closed_at = d.closed_at::timestamp OR (closed_at IS NULL AND d.closed_at IS NULL))
);

-- ======================================
-- Tabela incidents_events
-- Critério de unicidade: incident_id + current_status
-- ======================================
INSERT INTO incidents_events (incident_id, previous_status, current_status, comment, action_user_id)
SELECT 
    inc.id, d.previous_status, d.current_status, d.comment, (SELECT id FROM users WHERE email = 'joao@example.com' LIMIT 1)
FROM (VALUES
    ('Verificar Usuarios', 'OPEN', 'ACK', 'Incidente reconhecido pelo operador'),
    ('Verificar Usuarios', 'ACK', 'CLOSED', 'Problema resolvido'),
    ('Verificar Incidentes', 'OPEN', 'ACK', 'Verificando...'),
    ('Verificar Logs de Erro', 'OPEN', 'ACK', 'Analisando causa raiz'),
    ('Verificar Logs de Erro', 'ACK', 'CLOSED', 'Resolvido')
) AS d(rule_name, previous_status, current_status, comment)
JOIN rules r ON r.name = d.rule_name
-- Busca o incidente mais recente dessa regra para vincular o evento
JOIN incidents inc ON inc.rule_id = r.id 
WHERE inc.id = (SELECT id FROM incidents WHERE rule_id = r.id ORDER BY id DESC LIMIT 1)
AND NOT EXISTS (SELECT 1 FROM incidents_events WHERE incident_id = inc.id AND current_status = d.current_status AND comment = d.comment);

-- ======================================
-- Tabela schedules
-- Critério de unicidade: user_id + start_time
-- ======================================
INSERT INTO schedules (user_id, start_time, end_time)
SELECT u.id, d.start_time::timestamp, d.end_time::timestamp
FROM (VALUES
    ('joao@example.com', '2025-12-08 08:00:00', '2025-12-08 16:00:00'),
    ('rogerio@example.com', '2025-12-08 16:00:00', '2025-12-09 00:00:00'),
    ('penkas@example.com', '2025-12-08 00:00:00', '2025-12-09 00:00:00'),
    ('rogerio@example.com', '2025-12-08 08:00:00', '2025-12-08 16:00:00'),
    ('joao@example.com', '2025-12-09 16:00:00', '2025-12-10 00:00:00')
) AS d(email, start_time, end_time)
JOIN users u ON u.email = d.email
WHERE NOT EXISTS (SELECT 1 FROM schedules WHERE user_id = u.id AND start_time = d.start_time::timestamp);

-- ======================================
-- Tabela notifications
-- Critério de unicidade: sent_at + user_id
-- ======================================
INSERT INTO notifications (incident_id, channel_id, user_id, title, message, sent_at, status, read_at)
SELECT 
    inc.id, 
    (SELECT id FROM channels WHERE type=d.channel_type LIMIT 1),
    u.id, d.title, d.message, d.sent_at::timestamp, d.status, d.read_at::timestamp
FROM (VALUES
    ('Verificar Usuarios', 'EMAIL', 'joao@example.com', 'Error ao verificar usuarios', 'Timeout da query de 5 minutos', '2025-11-27 10:30:20', 'READED', '2025-11-27 10:32:00'),
    ('Verificar Incidentes', 'COMUNIQ', 'penkas@example.com', 'CRÍTICO: Incidentes fora de controle', 'Incidentes críticos detectados', '2025-11-27 11:45:15', 'READED', '2025-11-27 11:46:00'),
    ('Verificar Notificações', 'PUSH', 'admin@example.com', 'Error ao enviar Notificações', 'Verificar error', '2025-11-27 12:00:00', 'SENT', NULL),
    ('Verificar Usuarios', 'PUSH SOUND', 'rogerio@example.com', 'Usuarios Execidos', 'Verificar por que tantos usuarios', '2025-11-26 15:35:00', 'READED', '2025-11-26 15:40:00'),
    ('Verificar Incidentes', 'EMAIL', 'admin@example.com', 'Incidente Crítico', 'Incidente crítico detectado', '2025-11-27 08:16:00', 'SENT', NULL)
) AS d(rule_name, channel_type, user_email, title, message, sent_at, status, read_at)
JOIN users u ON u.email = d.user_email
JOIN rules r ON r.name = d.rule_name
JOIN incidents inc ON inc.rule_id = r.id -- Simplificado para pegar qq incidente da regra para validação do insert
WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = u.id AND sent_at = d.sent_at::timestamp)
-- Garante que pegamos um incidente válido (apenas limit 1 para evitar explosão de joins se houver duplicidade de dados antigos)
AND inc.id = (SELECT id FROM incidents WHERE rule_id = r.id LIMIT 1);

-- ======================================
-- Tabela audit_logs
-- Critério de unicidade: Implícito (difícil sem PK, vamos usar entity_id + action_type + user_id para evitar flood)
-- ======================================
INSERT INTO audit_logs (entity_id, entity_type, action_type, old_value, new_value, user_id)
SELECT d.entity_id, d.entity_type, d.action_type, d.old_value::jsonb, d.new_value::jsonb, u.id
FROM (VALUES
    ((SELECT id FROM rules WHERE name = 'Verificar Usuarios' LIMIT 1), 'rules', 'UPDATE', '{"is_active": true}', '{"is_active": false}', 'joao@example.com'),
    ((SELECT id FROM users WHERE email = 'maria@example.com' LIMIT 1), 'users', 'UPDATE', '{"pending": true}', '{"pending": false}', 'joao@example.com'),
    ((SELECT id FROM incidents WHERE rule_id = (SELECT id FROM rules WHERE name = 'Verificar Usuarios' LIMIT 1) LIMIT 1), 'incidents', 'UPDATE', '{"status": "ACK"}', '{"status": "CLOSED"}', 'joao@example.com'),
    ((SELECT id FROM rules WHERE name = 'Verificar Notificações' LIMIT 1), 'rules', 'CREATE', NULL, '{"name": "Verificar Notificações", "is_active": true}', 'penkas@example.com'),
    ((SELECT id FROM channels WHERE type='PUSH' LIMIT 1), 'channels', 'UPDATE', '{"is_active": true}', '{"is_active": false}', 'rogerio@example.com')
) AS d(entity_id, entity_type, action_type, old_value, new_value, user_email)
JOIN users u ON u.email = d.user_email
WHERE NOT EXISTS (
    SELECT 1 FROM audit_logs 
    WHERE entity_id = d.entity_id 
    AND entity_type = d.entity_type 
    AND action_type = d.action_type 
    AND user_id = u.id
);

-- ======================================
-- Tabela sql_test_logs
-- Critério de unicidade: user_id + sql
-- ======================================
INSERT INTO sql_test_logs (user_id, sql, result)
SELECT u.id, d.sql, d.result
FROM (VALUES
    ('joao@example.com', 'SELECT COUNT(*) FROM users', '5 rows returned'),
    ('penkas@example.com', 'SELECT * FROM rules WHERE is_active = true', '4 rows returned'),
    ('rogerio@example.com', 'SELECT * FROM incidents WHERE status = ''OPEN''', '1 row returned'),
    ('maria.santos@qqtech.com', 'SELECT COUNT(*) FROM notifications WHERE status = ''SENT''', '2 rows returned'),
    ('joao@example.com', 'SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10', '5 rows returned')
) AS d(user_email, sql, result)
JOIN users u ON u.email = d.user_email
WHERE NOT EXISTS (SELECT 1 FROM sql_test_logs WHERE user_id = u.id AND sql = d.sql);

-- ======================================
-- Tabela escalation_policy
-- Critério de unicidade: role_id
-- ======================================
INSERT INTO escalation_policy (timeout_ms)
SELECT d.timeout_ms
FROM (VALUES
    (300000)
) AS d(timeout_ms)
WHERE NOT EXISTS (SELECT 1 FROM escalation_policy);
