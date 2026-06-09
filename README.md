
dl_extract_to_bigquery.js -- 
Sends dataLayer to BigQuery using a Cloud Run Function endpoint.
To use this template, please follow these instructions: 
In the tag you create, add the Endpoint URL from the Cloud Run Function.

Create BigQuery dataset
- CREATE SCHEMA analytics_raw;
  
Create BigQuery table
- Copy and run the SQL below from within your BigQuery project: 

      CREATE SCHEMA IF NOT EXISTS `bigquery-ga360-38002.analytics_raw`;
      CREATE TABLE IF NOT EXISTS `bigquery-ga360-38002.analytics_raw.datalayer_events`
      (
          -- Server receipt information
          received_at TIMESTAMP NOT NULL,
      
          -- Client-side timing
          sent_at_ms INT64,
      
          -- Event information
          event_name STRING,
      
          -- Page information
          page_location STRING,
          page_title STRING,
      
          -- Optional GTM metadata
          gtm_container_id STRING,
          gtm_workspace_id STRING,
      
          -- Browser metadata
          user_agent STRING,
          ip_hash STRING,
      
          -- Parsed common dataLayer fields
          user_id STRING,
          page_type STRING,
          campaign STRING,
      
          -- Ecommerce data if present
          ecommerce JSON,
      
          -- Main captured dataLayer object
          dl_json JSON,
      
          -- Entire payload received from GTM
          full_payload_json JSON
      )
      PARTITION BY DATE(received_at)
      CLUSTER BY
          event_name,
          page_location,
          page_type;
  
Deploy Cloud Run Function
- Entry Point: receive_datalayer
- Runtime: Python 3.11
  
Set environment variable
- BQ_TABLE_ID=project.dataset.table
  
Import GTM Template
- DataLayer BigQuery Streamer.tpl
  
Create GTM Tag
- Tag Type:
- DataLayer BigQuery Streamer
- Set Endpoint URL
- https://your-cloud-run-url.run.app

Publish GTM
