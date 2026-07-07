# Wonkydata.com LLC
#
#LadyBug_datalayer_to_bigquery.py
# - GCP Cloud Run function to process dataLayer captures, sent from a GTM tag template. 
#
# Christopher Bridges
# 2026-05-26
#

import os
import json
import hashlib
from datetime import datetime, timezone

import functions_framework
from flask import jsonify
from google.cloud import bigquery

bq_client = bigquery.Client()

BQ_TABLE_ID = os.environ.get("BQ_TABLE_ID")
SHARED_SECRET = os.environ.get("SHARED_SECRET")


@functions_framework.http
def receive_datalayer(request):
    if request.method == "OPTIONS":
        return ("", 204, cors_headers())

    if not BQ_TABLE_ID:
        return jsonify({"error": "BQ_TABLE_ID env var is missing"}), 500

    if SHARED_SECRET:
        token = request.args.get("token") or request.headers.get("x-dl-token")
        if token != SHARED_SECRET:
            return jsonify({"error": "unauthorized"}), 401

    payload = {}

    if request.method == "GET":
        raw_payload = request.args.get("payload")

        if raw_payload:
            try:
                payload = json.loads(raw_payload)
            except json.JSONDecodeError:
                return jsonify({"error": "invalid payload JSON"}), 400

    elif request.method == "POST":
        payload = request.get_json(silent=True) or {}

    user_agent = request.headers.get("User-Agent")
    ip_raw = request.headers.get("X-Forwarded-For", request.remote_addr or "")
    ip_first = ip_raw.split(",")[0].strip() if ip_raw else ""

    ip_hash = hashlib.sha256(ip_first.encode("utf-8")).hexdigest() if ip_first else None

    row = {
        "received_at": datetime.now(timezone.utc).isoformat(),
        "sent_at_ms": payload.get("sent_at_ms"),
        "event_name": payload.get("event_name"),
        "page_location": payload.get("page_location"),
        "page_title": payload.get("page_title"),
        "dl_json": json.dumps(payload.get("data_layer", {})),
        "full_payload_json": json.dumps(payload),
        "user_agent": user_agent,
        "ip_hash": ip_hash,
    }

    errors = bq_client.insert_rows_json(BQ_TABLE_ID, [row])

    if errors:
        return jsonify({"status": "error", "errors": errors}), 500

    return ("", 204, cors_headers())


def cors_headers():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, x-dl-token",
        "Cache-Control": "no-store",
    }
