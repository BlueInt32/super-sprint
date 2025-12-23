// Déclarations globales pour les bibliothèques JavaScript sans types

declare module '*/rubeFileLoader.js' {
  const RubeFileLoader: any;
  export default RubeFileLoader;
}

declare module '*/Stats.js' {
  class Stats {
    domElement: HTMLElement;
  }
  export default Stats;
}

declare module '*/Box2dWeb-2.1.a.3.js' {
  const Box2D: any;
  export default Box2D;
}

declare module 'dat-gui';
