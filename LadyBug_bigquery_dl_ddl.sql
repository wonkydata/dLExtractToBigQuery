-- Wonkydata.com LLC
--
-- LadyBug_bigquery_dl_ddl.sql
-- - DDL to create analytics_raw/datalayer_events schema and table . 
-- - Change the dataset name.
-- Christopher Bridges
-- 2026-05-26
--

CREATE SCHEMA IF NOT EXISTS `bigquery-ga360-99999.analytics_raw`;

CREATE TABLE IF NOT EXISTS `bigquery-ga360-99999.analytics_raw.datalayer_events`
(
  received_at TIMESTAMP NOT NULL,
  sent_at_ms INT64,
  event_name STRING,
  page_location STRING,
  page_title STRING,
  dl_json JSON,
  full_payload_json JSON,
  user_agent STRING,
  ip_hash STRING

)
PARTITION BY DATE(received_at)
CLUSTER BY event_name, page_location, page_type;
