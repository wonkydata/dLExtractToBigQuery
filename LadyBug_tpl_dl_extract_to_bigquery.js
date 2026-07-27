// Wonkydata.com LLC
//
// LadyBug_dl_extract_to_bigquery.js
//
// DataLayer BigQuery Streamer - Web GTM Template
// Sends the specific triggering dataLayer push object to Cloud Run using sendPixel()

const sendPixel = require('sendPixel');
const JSON = require('JSON');
const copyFromDataLayer = require('copyFromDataLayer');
const copyFromWindow = require('copyFromWindow');
const getUrl = require('getUrl');
const getTimestampMillis = require('getTimestampMillis');
const encodeUriComponent = require('encodeUriComponent');
const readTitle = require('readTitle');

// User-entered template fields
const endpointUrl = data.endpointUrl;
const pageTitle = data.pageTitle || readTitle() || '';
const dataLayerContent = data.dataLayerContent || '';

// Fail safely if endpoint is missing
if (!endpointUrl) {
  data.gtmOnFailure();
  return;
}

const currentEventName = copyFromDataLayer('event') || '';
const rawDataLayer = copyFromWindow('dataLayer') || [];

// Find the specific push object that matches the current event name
let triggeringPush = {};

if (currentEventName && rawDataLayer.length > 0) {
  // Loop backwards to find the most recent matching event push
  for (let i = rawDataLayer.length - 1; i >= 0; i--) {
    let item = rawDataLayer[i];
    // Check if item is a valid object and has the matching event property
    if (item && typeof item === 'object' && item.event === currentEventName) {
      triggeringPush = item;
      break;
    }
  }
}

// Build payload
const payload = {
  sent_at_ms: getTimestampMillis(),
  event_name: currentEventName,
  page_location: getUrl(),
  page_title: pageTitle,

  // Optional user-entered/manual field
  full_json: dataLayerContent,

  // Exports ONLY the specific JSON object pushed for this event
  data_layer: triggeringPush
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
