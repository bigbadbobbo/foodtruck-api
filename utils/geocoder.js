const NodeGeocoder = require('node-geocoder');

const options = {
  //  provider: process.env.GEOCODER_PROVIDER,
  provider: 'mapquest',
  httpAdapter: 'https',
  //apiKey: process.env.GEOCODER_API_KEY,
  apiKey: 'SgwntSFAzqY4d11ZQXkDO8YAEK48AgHG',
  formatter: null
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;
