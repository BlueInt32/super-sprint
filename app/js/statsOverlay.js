/**
 * Created by Simon on 15/11/2015.
 */
"use strict";
import Stats from './libs/Stats.js';

var StatsOverlay = function() {
  var container;
  var stats = new Stats();
  container = document.createElement("div");
  container.appendChild(stats.domElement);
  document.body.appendChild(container);
  stats.domElement.style.position = "absolute";
};

export default StatsOverlay;