const $ = require('jquery');
require('./pixi4.js');
$(function($){
    function Main(){
        this.stage = new PIXI.Container();
        this.renderer = PIXI.autoDetectRenderer(
          512,
          384,
          {view:document.getElementById("game-canvas")}
        );

        this.SCROLL_SPEED = 1;
        this.loadSpriteSheet();
    }
    Main.prototype.update = function() {
      this.scroller.moveViewportXBy(this.SCROLL_SPEED);
      this.renderer.render(this.stage);
      requestAnimationFrame(this.update.bind(this));
    };
    Main.prototype.loadSpriteSheet = function() {
      var loader = PIXI.loader;
      loader.add("wall", "../images/wall.json");
      loader.once("complete", this.spriteSheetLoaded.bind(this));
      loader.load();
    };
    Main.prototype.spriteSheetLoaded = function() {
      this.scroller = new Scroller(this.stage);
      requestAnimationFrame(this.update.bind(this));

      this.pool = new WallSpritesPool();
      this.wallSlices = [];

      this.generateTestWallSpan();
    };
    Main.prototype.generateTestWallSpan = function() {
      var lookupTable = [
        this.pool.borrowFrontEdge,  // 1st slice
        this.pool.borrowWindow,     // 2nd slice
        this.pool.borrowDecoration, // 3rd slice
        this.pool.borrowStep,       // 4th slice
        this.pool.borrowWindow,     // 5th slice
        this.pool.borrowBackEdge    // 6th slice
      ];

      var yPos = [
        128, // 1st slice
        128, // 2nd slice
        128, // 3rd slice
        192, // 4th slice
        192, // 5th slice
        192  // 6th slice
      ];

      for (var i = 0; i < lookupTable.length; i++)
      {
        var func = lookupTable[i];

        var sprite = func.call(this.pool);
        sprite.position.x = 64 + (i * 64);
        sprite.position.y = yPos[i];

        this.wallSlices.push(sprite);

        this.stage.addChild(sprite);
      }
    };
    Main.prototype.clearTestWallSpan = function() {
      var lookupTable = [
        this.pool.returnFrontEdge,  // 1st slice
        this.pool.returnWindow,     // 2nd slice
        this.pool.returnDecoration, // 3rd slice
        this.pool.returnStep,       // 4th slice
        this.pool.returnWindow,     // 5th slice
        this.pool.returnBackEdge    // 6th slice
      ];

      for (var i = 0; i < lookupTable.length; i++)
      {
        var func = lookupTable[i];
        var sprite = this.wallSlices[i];

        this.stage.removeChild(sprite);
        func.call(this.pool, sprite);
      }

      this.wallSlices = [];
    };
    // PIXI.loader
    //     .add([
    //         "../images/bg-far.png",
    //         "../images/bg-mid.png"
    //     ])
    //     .load(setup)

    // function setup() {
    function Far() {
        window.farTexture = PIXI.Texture.fromImage("../images/bg-far.png");

        PIXI.extras.TilingSprite.call(this, window.farTexture, 512, 256);
        this.position.x = 0;
        this.position.y = 0;
        this.tilePosition.x = 0;
        this.tilePosition.y = 0;
        this.viewportX = 0;

    }

    Far.prototype = Object.create(PIXI.extras.TilingSprite.prototype);

    Far.DELTA_X = 0.128;
    Far.prototype.setViewportX = function(newViewportX) {
      var distanceTravelled = newViewportX - this.viewportX;
      this.viewportX = newViewportX;
      this.tilePosition.x -= (distanceTravelled * Far.DELTA_X);
    };

    function Mid() {
        window.midTexture = PIXI.Texture.fromImage("../images/bg-mid.png");

        PIXI.extras.TilingSprite.call(this, window.midTexture, 512, 256);
        this.position.x = 0;
        this.position.y = 128;
        this.tilePosition.x = 0;
        this.tilePosition.y = 0;
        this.viewportX = 0;

    }
    Mid.prototype = Object.create(PIXI.extras.TilingSprite.prototype);
    Mid.DELTA_X = 0.64;
    Mid.prototype.setViewportX = function(newViewportX) {
      var distanceTravelled = newViewportX - this.viewportX;
      this.viewportX = newViewportX;
      this.tilePosition.x -= (distanceTravelled * Mid.DELTA_X);
    };
    /**********************************************************************************/


    function Scroller(stage) {

      this.far = new Far();
      stage.addChild(this.far);

      this.mid = new Mid();
      stage.addChild(this.mid);

      this.viewportX = 0;
    }
    Scroller.prototype.setViewportX = function(viewportX) {
      this.viewportX = viewportX;
      this.far.setViewportX(viewportX);
      this.mid.setViewportX(viewportX);
    };

    Scroller.prototype.getViewportX = function() {
      return this.viewportX;
    };
    Scroller.prototype.moveViewportXBy = function(units) {
      var newViewportX = this.viewportX + units;
      this.setViewportX(newViewportX);
    };
    /**********************************************************************************/

    function WallSpritesPool() {
        this.createWindows();
        this.createDecorations();
        this.createFrontEdges();
        this.createBackEdges();
        this.createSteps();
    }
    WallSpritesPool.prototype.addWindowSprites = function(amount, frameId) {
      for (var i = 0; i < amount; i++)
      {
        var sprite = PIXI.Sprite.fromFrame(frameId);
        this.windows.push(sprite);
      }
    };
    WallSpritesPool.prototype.addDecorationSprites = function(amount, frameId) {
      for (var i = 0; i < amount; i++)
      {
        var sprite = new PIXI.Sprite(PIXI.Texture.fromFrame(frameId));
        this.decorations.push(sprite);
      }
    };
    WallSpritesPool.prototype.addFrontEdgeSprites = function(amount, frameId) {
      for (var i = 0; i < amount; i++)
      {
        var sprite = new PIXI.Sprite(PIXI.Texture.fromFrame(frameId));
        this.frontEdges.push(sprite);
      }
    };

    WallSpritesPool.prototype.addBackEdgeSprites = function(amount, frameId) {
      for (var i = 0; i < amount; i++)
      {
        var sprite = new PIXI.Sprite(PIXI.Texture.fromFrame(frameId));
        sprite.anchor.x = 1;
        sprite.scale.x = -1;
        this.backEdges.push(sprite);
      }
    };
    WallSpritesPool.prototype.addStepSprites = function(amount, frameId) {
      for (var i = 0; i < amount; i++)
      {
        var sprite = new PIXI.Sprite(PIXI.Texture.fromFrame(frameId));
        sprite.anchor.y = 0.25;
        this.steps.push(sprite);
      }
    };
    WallSpritesPool.prototype.shuffle = function(array) {
      var len = array.length;
      var shuffles = len * 3;
      for (var i = 0; i < shuffles; i++)
      {
        var wallSlice = array.pop();
        var pos = Math.floor(Math.random() * (len-1));
        array.splice(pos, 0, wallSlice);
      }
    };
    WallSpritesPool.prototype.createWindows = function() {
      this.windows = [];

      this.addWindowSprites(6, "window_01");
      this.addWindowSprites(6, "window_02");

      this.shuffle(this.windows);
    };

    WallSpritesPool.prototype.createDecorations = function() {
      this.decorations = [];

      this.addDecorationSprites(6, "decoration_01");
      this.addDecorationSprites(6, "decoration_02");
      this.addDecorationSprites(6, "decoration_03");

      this.shuffle(this.decorations);
  
    }
    WallSpritesPool.prototype.createFrontEdges = function() {
      this.frontEdges = [];

      this.addFrontEdgeSprites(2, "edge_01");
      this.addFrontEdgeSprites(2, "edge_02");

      this.shuffle(this.frontEdges);
    };

    WallSpritesPool.prototype.createBackEdges = function() {
      this.backEdges = [];

      this.addBackEdgeSprites(2, "edge_01");
      this.addBackEdgeSprites(2, "edge_02");

      this.shuffle(this.backEdges);
    };
    WallSpritesPool.prototype.createSteps = function() {
      this.steps = [];
      this.addStepSprites(2, "step_01");
    };
    WallSpritesPool.prototype.borrowWindow = function() {
      return this.windows.shift();
    };
    WallSpritesPool.prototype.returnWindow = function(sprite) {
      this.windows.push(sprite);
    };
    WallSpritesPool.prototype.borrowDecoration = function() {
      return this.decorations.shift();
    };

    WallSpritesPool.prototype.returnDecoration = function(sprite) {
      this.decorations.push(sprite);
    };
    WallSpritesPool.prototype.borrowFrontEdge = function() {
      return this.frontEdges.shift();
    };

    WallSpritesPool.prototype.returnFrontEdge = function(sprite) {
      this.frontEdges.push(sprite);
    };

    WallSpritesPool.prototype.borrowBackEdge = function() {
      return this.backEdges.shift();
    };

    WallSpritesPool.prototype.returnBackEdge = function(sprite) {
      this.backEdges.push(sprite);
    };
    WallSpritesPool.prototype.borrowStep = function() {
      return this.steps.shift();
    };

    WallSpritesPool.prototype.returnStep = function(sprite) {
      this.steps.push(sprite);
    };
    window.main = new Main();
})