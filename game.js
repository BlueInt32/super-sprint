window.onload = function() {
  // Start crafty
  Crafty.init(50, 400, 320);
  Crafty.canvas();

  // The loading screen that will display while our assets load
  Crafty.scene("loading", function() {
    // Load takes an array of assets and a callback when complete
    Crafty.load(["car.png"], function() {
      Crafty.scene("main"); //when everything is loaded, run the main scene
    });
    
    // Black background with some loading text
    Crafty.background("#000");
    Crafty.e("2D, DOM, text").attr({w: 100, h: 20, x: 150, y: 120})
      .text("Loading")
      .css({"text-align": "center"});
  });
  
  // Automatically play the loading scene
  Crafty.scene("loading");
};