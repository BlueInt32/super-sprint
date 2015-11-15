/**
 * Created by Simon on 15/11/2015.
 */
"use strict";
var Stats = require('./libs/Stats.js');

var showStatsOverlay = function() {
  var container;

  var stats = new Stats();

  container = document.createElement("div");
  container.appendChild(stats.domElement);
  document.body.appendChild(container);
  stats.domElement.style.position = "absolute";
};

module.exports = showStatsOverlay;