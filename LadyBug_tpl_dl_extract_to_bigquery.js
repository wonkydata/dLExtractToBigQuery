// Wonkydata.com LLC
//
// LadyBug_dl_extract_to_bigquery.js
//
// DataLayer BigQuery Streamer - Web GTM Template
// Sends the specific triggering dataLayer push object to Cloud Run using sendPixel()
// CB: 2026-07-27: Includes new parameter called "gtmCollection": a radio button that selects exclusion as yes or no
// --- to switch on or off the collection of gtm.* dataLayer events. Yes is an exclusion of these events. 

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

// Configuration field for 'gtm.*' event collection ("yes" or "no")
const gtmCollectionSetting = data.gtmCollection || 'yes';

// Fail safely if endpoint is missing
if (!endpointUrl) {
  data.gtmOnFailure();
  return;
}

const currentEventName = copyFromDataLayer('event') || '';

// Check if this is a "gtm." event and if collection is disallowed
const isGtmEvent = currentEventName.length >= 4 && currentEventName.substring(0, 4) === 'gtm.';
if (gtmCollectionSetting === 'no' && isGtmEvent) {
  // Disallow collection by routing to failure (or exiting cleanly)
  data.gtmOnFailure();
  return;
}

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
