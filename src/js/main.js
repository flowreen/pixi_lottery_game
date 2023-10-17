import * as PIXI from 'pixi.js';
import gsap from 'gsap';
import AssetsLoader from './assets-loader.js';

// Pixi stage handling.
const SCREEN_WIDTH = 1024;
const SCREEN_HEIGHT = 768;
const EVENT_RESIZE = 'resize';

// Assets
const ASSET_ROOT = 'assets/';   // Asset root folder.
const ASSET_TYPE = '.png';      // Asset extension.

// Graphics
const BALL_DRAW_ORIGIN_X = 900;	// Ball start animation position.
const TUBE_START_X = 132;       // Tube start display position.
const VISIBLE_BALLS = 5;        // Visible balls count.
const BLUR_ARMOUNT = 0.2;       // Ball blur amount.
const BALL_WIDTH = 80;          // Ball width.
const BALL_HEIGHT = 80;         // Ball height.
const BALL_Y_OFFSET = 0.015;    // Ball y offset.
const NUMBER_OFFSET_X = 0.2;    // Number x offset.
const NUMBER_OFFSET_Y = 0.15;   // Number y offset.
const NUMBER_WIDTH = 45;        // Number width.
const NUMBER_HEIGHT = 60;       // Number height.

// UI
const EVENT_POINTER_DOWN = 'pointerdown';

// List of assets to load		
const ASSETS = {
  tube: ['tube', 'peekshine', 'windowshine'],
  masks: ['peekmask', 'glassmask'],
  playBtn: ['playbutton_on', 'playbutton_dis', 'playbutton_off']
};
// Simple ball assets for quick test
const BALL_ASSETS_SIMPLE = {
  balls: ['ball1', 'ball2', 'ball3', 'ball4', 'ball5', 'ball6', 'ball7', 'ball8', 'ball9', 'ball10', 'ball11', 'ball12', 'ball13', 'ball14', 'ball15']
};
// Complex ball assets to allow more complicated animation
const BALL_ASSETS_COMPLEX = {
  balls: ['redb', 'blueb', 'yellowb'],
  numbers: ['n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'n8', 'n9', 'n10', 'n11', 'n12', 'n13', 'n14', 'n15']
};

/**
* GameTest sets up the basic PIXI Application for the new game developer coding task 
* @author	Logispin
* @version	1.1
*/
class GameTest
{
  resources = null;
  app = null;
  tube = null;
  displayedBalls = [];

  constructor()
  {
    // Instantiate the test app
    this.app = new PIXI.Application({ width: SCREEN_WIDTH, height: SCREEN_HEIGHT });
    document.body.appendChild(this.app.view);
    const canvas = this.app.view;

    // Register for resize event.
    window.addEventListener(EVENT_RESIZE, () => 
    {
      this.windowResize(canvas);
    });
    this.windowResize(canvas);

    // Load the assets
    const assetLoader = new AssetsLoader(ASSET_ROOT, ASSET_TYPE);
    assetLoader.loadAssets([ASSETS, BALL_ASSETS_SIMPLE, BALL_ASSETS_COMPLEX]).then(resources =>
    {
      this.resources = resources;

      // Create tube sprite.
      this.tube = new PIXI.Sprite(resources.tube);
      this.tube.x = 0;
      this.tube.y = 650;
      this.tube.width = 1024;
      this.tube.height = 120;
      this.app.stage.addChild(this.tube);

      // Create Play Button
      const playBtn = new PIXI.Sprite(resources.playbutton_on);
      playBtn.eventMode = 'static';
      playBtn.x = 900;
      playBtn.y = 690;
      playBtn.width = 100;
      playBtn.height = 50;
      this.app.stage.addChild(playBtn);

      // Setup Events  
      playBtn.on(EVENT_POINTER_DOWN, () =>
      {
        // New Draw
        this.clearResult();
        let result = this.generateResult();
        this.generateBalls(result);
        this.animateBalls(result);
      });
    });
  }

  /**
   * Resizes canvas size according to window size, From EVENT_RESIZE events
   *
   * @param canvas {Canvas} the canvas instance to be resized 
   */
  windowResize(canvas)
  {
    let aspectRatio = canvas.width / canvas.height;
    let containerWidth = window.innerWidth;
    let containerHeight = window.innerHeight;
    let newHeight = containerWidth / aspectRatio;
    let newWidth = 0;

    if (newHeight > containerHeight)
    {
      newHeight = containerHeight;
      newWidth = newHeight * aspectRatio;
    }
    else
    {
      newWidth = containerWidth;
    }

    canvas.style.height = newHeight + 'px';
    canvas.style.width = newWidth + 'px';
  }

  /**
   * Clears all the balls from the screen
   */
  clearResult()
  {
	// clear the previous graphics


    this.displayedBalls = [];
  }

  /**
   * Generates the ball graphics needed to show the result
   *
   * @param result {array} an array of integer values from 1-15 
   */
  generateBalls(result)
  {
	// use displayedBalls to store references to ball graphics
	
  }

  /**
   * Generates an random ball extraction result
   *
   * @return an array of integer values from 1-15 
   */
  generateResult() 
  {
    let numbers = [];
  
    while (numbers.length < VISIBLE_BALLS) 
	{
      let randomNumber = Math.floor(Math.random() * 15) + 1;
      
      if (numbers.indexOf(randomNumber) === -1) 
	  {
        numbers.push(randomNumber);
      }
    }
    return numbers;
  }

  
  /**
   * Begins the animation sequence for drawing the balls one by one
   */
  animateBalls()
  {
    // Animate result referencing displayedBalls

  }

  /**
   * Generates ball graphics according to the drawn number
   *
   * @param ballNumber {Number} an integer between 1 and 15 
   * @return a Pixi Container with the ball graphics
   */
  createBall(ballNumber)
  {
	// Create ball sprites from assets
	  
    const container = new PIXI.Container();

    // Init number sprite

    return container;
  }
}

new GameTest();