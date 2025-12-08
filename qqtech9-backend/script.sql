-- Habilita função gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ======================================
-- Tabela roles
-- ======================================
CREATE TABLE IF NOT EXISTS roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(20) NOT NULL,
    color varchar(20) NOT NULL,
    description varchar(150) NOT NULL,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
);

-- ======================================
-- Tabela users
-- ======================================
CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    firebase_id varchar(128) UNIQUE,
    name varchar(100) NOT NULL,
    matricula varchar(30) NOT NULL UNIQUE,
    email varchar(120) NOT NULL UNIQUE,
    phone varchar(20),
    picture varchar(255),
    profile varchar(30) NOT NULL, -- ex: admin, operator, viewer
    pending boolean NOT NULL DEFAULT true,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
);

-- ======================================
-- Tabela user_preferences
-- ======================================
CREATE TABLE IF NOT EXISTS user_preferences (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    dnd_start_time time,
    dnd_end_time time,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now(),
    CONSTRAINT fk_user_preferences_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ======================================
-- Tabela channels (canais de notificação)
-- ======================================
CREATE TABLE IF NOT EXISTS channels (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    type varchar(30) NOT NULL,       
    name varchar(60) NOT NULL,
    config jsonb,                      
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
);

-- ======================================
-- Tabela user_preferences_channels (associação user_preferences <-> channel)
-- ======================================
CREATE TABLE IF NOT EXISTS user_preferences_channels (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_preferences_id uuid NOT NULL,
    channel_id uuid NOT NULL,
    created_at timestamp NOT NULL DEFAULT now(),
    CONSTRAINT fk_user_preferences_channels_user FOREIGN KEY (user_preferences_id) REFERENCES user_preferences(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_preferences_channels_channel FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
    CONSTRAINT uq_user_channel UNIQUE (user_preferences_id, channel_id)
);

-- ======================================
-- Tabela rules
-- ======================================
CREATE TABLE IF NOT EXISTS rules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(100) NOT NULL,
    description varchar(255) NOT NULL,
    database_type varchar(50) NOT NULL,
    sql text NOT NULL,
    priority varchar(10) NOT NULL,
    execution_interval_ms integer NOT NULL,
    max_error_count integer NOT NULL,
    timeout_ms integer NOT NULL,
    start_time time NOT NULL,
    end_time time NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    silence_mode boolean NOT NULL DEFAULT false,
    postpone_date timestamp DEFAULT NULL,
    user_creator_id uuid,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now(),
    CONSTRAINT fk_rules_user_creator FOREIGN KEY (user_creator_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ======================================
-- Tabela rules_roles (associação rule <-> role)
-- ======================================
CREATE TABLE IF NOT EXISTS rules_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id uuid NOT NULL,
    role_id uuid NOT NULL,
    created_at timestamp NOT NULL DEFAULT now(),
    CONSTRAINT fk_rules_roles_rule FOREIGN KEY (rule_id) REFERENCES rules(id) ON DELETE CASCADE,
    CONSTRAINT fk_rules_roles_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT uq_rules_roles UNIQUE (rule_id, role_id)
);

-- ======================================
-- Tabela users_roles (associação user <-> role)
-- ======================================
CREATE TABLE IF NOT EXISTS users_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    role_id uuid NOT NULL,
    created_at timestamp NOT NULL DEFAULT now(),
    CONSTRAINT fk_users_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_users_roles_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT uq_users_roles UNIQUE (user_id, role_id)
);

-- ======================================
-- Tabela incidents
-- ======================================
CREATE TABLE IF NOT EXISTS incidents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    assigned_user_id uuid,
    rule_id uuid,
    status varchar(10) NOT NULL,
    priority varchar(10) NOT NULL,
    ack_at timestamp,
    closed_at timestamp,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now(),
    CONSTRAINT fk_incidents_rule FOREIGN KEY (rule_id) REFERENCES rules(id) ON DELETE SET NULL,
    CONSTRAINT fk_incidents_assigned_user FOREIGN KEY (assigned_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ======================================
-- Tabela schedules (escala/on-call)
-- ======================================
CREATE TABLE IF NOT EXISTS schedules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    start_time timestamp NOT NULL,
    end_time timestamp NOT NULL,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now(),
    CONSTRAINT fk_schedules_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ======================================
-- Tabela incidents_events (histórico)
-- ======================================
CREATE TABLE IF NOT EXISTS incidents_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id uuid NOT NULL,
    previous_status varchar(10) NOT NULL,
    current_status varchar(10) NOT NULL,
    comment varchar(255) NOT NULL,
    action_user_id uuid,
    created_at timestamp NOT NULL DEFAULT now(),
    CONSTRAINT fk_incident_logs_incident FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE,
    CONSTRAINT fk_incident_logs_user FOREIGN KEY (action_user_id) REFERENCES users(id) ON DELETE SET NULL
);


-- ======================================
-- Tabela runners
-- ======================================
CREATE TABLE IF NOT EXISTS runners (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id uuid NOT NULL,
    status varchar(15) NOT NULL DEFAULT 'IDLE', -- IDLE, SCHEDULED, RUNNING, FAILED
    last_run_at timestamp,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now(),
    CONSTRAINT fk_runners_rule FOREIGN KEY (rule_id) REFERENCES rules(id) ON DELETE CASCADE
);

-- ======================================
-- Tabela runner_queue
-- ======================================
CREATE TABLE IF NOT EXISTS runner_queue (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    runner_id uuid NOT NULL,
    status varchar(20) NOT NULL DEFAULT 'PENDING', -- PENDING, PROCESSING, COMPLETED, FAILED
    scheduled_for timestamp NOT NULL,
    started_at timestamp,
    finished_at timestamp,
    attempt_count integer DEFAULT 0,
    CONSTRAINT fk_runner_queue_runner FOREIGN KEY (runner_id) REFERENCES runners(id) ON DELETE CASCADE
);

-- ======================================
-- Tabela runner_logs
-- ======================================
CREATE TABLE IF NOT EXISTS runner_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    runner_id uuid NOT NULL,
    queue_id uuid, 
    run_time_ms integer NOT NULL,
    execution_status varchar(20) NOT NULL, -- SUCCESS, TIMEOUT, ERROR
    rows_affected bigint,
    result text,
    error text,
    executed_at timestamp NOT NULL DEFAULT now(),
    CONSTRAINT fk_runner_logs_runner FOREIGN KEY (runner_id) REFERENCES runners(id) ON DELETE CASCADE,
    CONSTRAINT fk_runner_logs_queue FOREIGN KEY (queue_id) REFERENCES runner_queue(id) ON DELETE SET NULL
);

-- ======================================
-- Tabela audit_logs
-- ======================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id uuid NOT NULL,
    entity_type varchar(50) NOT NULL,
    action_type varchar(50) NOT NULL,
    old_value jsonb,
    new_value jsonb,
    user_id uuid,
    created_at timestamp NOT NULL DEFAULT now(),
    CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ======================================
-- Tabela notifications
-- ======================================
CREATE TABLE IF NOT EXISTS notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id uuid NOT NULL,
    channel_id uuid,
    user_id uuid,
    title varchar(150) NOT NULL,
    message text NOT NULL,
    sent_at timestamp,
    status varchar(20), -- SENT, READED, FAILED
    read_at timestamp,
    error text, 
    created_at timestamp NOT NULL DEFAULT now(),
    CONSTRAINT fk_notifications_incident FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_notifications_channel FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE
);

-- ======================================
-- Tabela sql_test_logs
-- ======================================
CREATE TABLE IF NOT EXISTS sql_test_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid,
    sql text NOT NULL,
    result text,
    created_at timestamp NOT NULL DEFAULT now(),
    CONSTRAINT fk_sql_test_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ======================================
-- Tabela escalation_policy
-- ======================================
CREATE TABLE IF NOT EXISTS escalation_policy (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    timeout_ms integer NOT NULL,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
);

-- ======================================
-- Tabela app_settings
-- ======================================
CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value jsonb NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_by_user_id uuid,
    CONSTRAINT fk_app_settings_user FOREIGN KEY (updated_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ======================================
-- Índices adicionais
-- ======================================
CREATE INDEX IF NOT EXISTS idx_rules_user_creator_id ON rules (user_creator_id);
CREATE INDEX IF NOT EXISTS idx_incidents_assigned_user_id ON incidents (assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents (status);
CREATE INDEX IF NOT EXISTS idx_runners_rule_id ON runners (rule_id);
CREATE INDEX IF NOT EXISTS idx_notifications_incident_id ON notifications (incident_id);
CREATE INDEX IF NOT EXISTS idx_schedules_user_id ON schedules (user_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status_priority ON incidents(status, priority);
CREATE INDEX IF NOT EXISTS idx_user_preferences_channels_channel_id ON user_preferences_channels (channel_id);
CREATE INDEX IF NOT EXISTS idx_rules_roles_role_id ON rules_roles (role_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_runner_queue_status_scheduled  ON runner_queue (status, scheduled_for) WHERE status = 'PENDING';

-- ======================================
-- Views dashboard
-- ======================================
CREATE OR REPLACE VIEW plantao_monitor AS
WITH base AS (
    SELECT
        i.id,
        i.status,
        i.created_at,
        i.ack_at,
        i.closed_at
    FROM incidents i
    WHERE i.created_at >= NOW() - INTERVAL '30 days'
)
SELECT
    -- Contagens por status
    (SELECT COUNT(*) FROM base WHERE status = 'OPEN') AS total_open,

    (SELECT COUNT(*) FROM base WHERE status = 'ACK') AS total_ack,

    (SELECT COUNT(*) FROM base WHERE status = 'CLOSED') AS total_closed,

    -- Regras ativas
    (SELECT COUNT(*) FROM rules r WHERE r.is_active = true) AS total_rules_active,

    -- Tempo Médio de ACK (em segundos)
    (
        SELECT AVG(EXTRACT(EPOCH FROM (ack_at - created_at)))
        FROM base 
        WHERE ack_at IS NOT NULL
    ) AS avg_ack_time_seconds,

    -- Tempo Médio de Resolução (ACK → CLOSED)
    (
        SELECT AVG(EXTRACT(EPOCH FROM (closed_at - ack_at)))
        FROM base
        WHERE ack_at IS NOT NULL
          AND closed_at IS NOT NULL
    ) AS avg_resolution_time_seconds;
