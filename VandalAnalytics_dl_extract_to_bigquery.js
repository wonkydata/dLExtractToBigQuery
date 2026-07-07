// Wonkydata.com LLC
//
// VandalAnalytics_dl_extract_to_bigquery.js
//
// DataLayer BigQuery Streamer - Web GTM Template
// Sends selected dataLayer values to Cloud Run using sendPixel()
// -- This is Sandboxed JS specifically for a GTM Template.
// 
// Christopher Bridges
// 2026-05-26
//

const sendPixel = require('sendPixel');
const JSON = require('JSON');
const copyFromDataLayer = require('copyFromDataLayer');
const getUrl = require('getUrl');
const getTimestampMillis = require('getTimestampMillis');
const encodeUriComponent = require('encodeUriComponent');

// User-entered template fields
const endpointUrl = data.endpointUrl;
const pageTitle = data.pageTitle || '';
const dataLayerContent = data.dataLayerContent || '';

// Fail safely if endpoint is missing
if (!endpointUrl) {
  data.gtmOnFailure();
  return;
}

// Build payload
const payload = {
  sent_at_ms: getTimestampMillis(),
  event_name: copyFromDataLayer('event') || '',
  page_location: getUrl(),
  page_title: pageTitle,

  // Optional user-entered/manual field
  full_json: dataLayerContent,

  // Add specific dataLayer keys here
  data_layer: {
    event: copyFromDataLayer('event'),
    ecommerce: copyFromDataLayer('ecommerce'),
    user_id: copyFromDataLayer('user_id'),
    page_type: copyFromDataLayer('page_type'),
    campaign: copyFromDataLayer('campaign')
  }
};

// Convert payload to query string
const payloadString = JSON.stringify(payload);
const pixelUrl = endpointUrl + '?payload=' + encodeUriComponent(payloadString);

// Send GET request as pixel
sendPixel(
  pixelUrl,
  data.gtmOnSuccess,
  data.gtmOnFailure
);
