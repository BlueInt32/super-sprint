import Stats from '../js/libs/Stats.js';

class StatsOverlay {
  constructor() {
    const stats = new Stats();
    const container = document.createElement("div");
    container.appendChild(stats.domElement);
    document.body.appendChild(container);
    stats.domElement.style.position = "absolute";
  }
}

export default StatsOverlay;
