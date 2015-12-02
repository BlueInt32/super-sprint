"use strict";

var urlHelper = function() {
  var that = {};

  that.loadQueryConfig = function() {
    var queryParams, urlParams;

    urlParams = that.parseQueryString();
    queryParams = {};
    if (urlParams.hasOwnProperty('track')) {
      queryParams.track = urlParams.track;
    } else {
      queryParams.track = defaultSetup.trackId;
    }
    if (urlParams.hasOwnProperty('cars')) {
      queryParams.cars = urlParams.cars.split(',');
    } else {
      queryParams.cars = defaultSetup.carIds;
    }
    return queryParams;
  };

  that.parseQueryString = function() {
    var assoc, decode, i, key, keyValues, len, val;
    assoc = {};
    keyValues = location.search.slice(1).split('&');
    decode = function(s) {
      return decodeURIComponent(s.replace(/\+/g, ' '));
    };
    for (i = 0, len = keyValues.length; i < len; i++) {
      val = keyValues[i];
      key = val.split('=');
      if (1 < key.length) {
        assoc[decode(key[0])] = decode(key[1]);
      }
    }
    return assoc;
  };


  return that;
}

module.exports = urlHelper();