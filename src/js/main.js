// Importing required libraries and modules
import * as PIXI from 'pixi.js';
import gsap from 'gsap';
import {Howl} from 'howler';
import AssetsLoader from './assets-loader.js';
import {DropShadowFilter} from "@pixi/filter-drop-shadow";

// Constants for screen dimensions and event types
const SCREEN_WIDTH = 1024;
const SCREEN_HEIGHT = 768;
const EVENT_RESIZE = 'resize';

// Constants for asset management
const ASSET_ROOT = 'assets/';   // Root directory for assets
const ASSET_TYPE = '.png';      // File extension for image assets

// Constants for graphical elements and their positioning
const TUBE_START_X = 137;       // x-coordinate for the start of the tube
const VISIBLE_BALLS = 5;        // Number of balls visible at once
const BLUR_ARMOUNT = 8;       // Amount of blur applied to the balls
const BALL_WIDTH = 72;          // Width of the ball graphics
const BALL_HEIGHT = 72;         // Height of the ball graphics
const BALL_DRAW_ORIGIN_X = 900;	// Initial x-coordinate for ball animation
const BALL_VERTICAL_CENTER = SCREEN_HEIGHT / 2 - BALL_HEIGHT / 2 + 322; // y-coordinate for ball animation
const BALL_Y_OFFSET = 0.015;    // Vertical offset for ball positioning
const NUMBER_OFFSET_X = 0.2;    // Horizontal offset for number positioning
const NUMBER_OFFSET_Y = 0.15;   // Vertical offset for number positioning
const SINGLE_DIGIT_NUMBER_WIDTH = 30;        // Width of single-digit numbers
const DOUBLE_DIGIT_NUMBER_WIDTH = 35;        // Width of double-digit numbers
const NUMBER_HEIGHT = 45;       // Height of the numbers

// Constants for user interaction
const EVENT_POINTER_DOWN = 'pointerdown';

// Asset lists for preloading
const ASSETS = {
    tube: ['tube', 'peekshine', 'windowshine'],
    masks: ['peekmask', 'glassmask'],
    playBtn: ['playbutton_on', 'playbutton_dis', 'playbutton_off']
};
// Simplified ball assets for quick testing
const BALL_ASSETS_SIMPLE = {
    balls: ['ball1', 'ball2', 'ball3', 'ball4', 'ball5', 'ball6', 'ball7', 'ball8', 'ball9', 'ball10', 'ball11', 'ball12', 'ball13', 'ball14', 'ball15']
};
// Complex ball assets for detailed animations
const BALL_ASSETS_COMPLEX = {
    balls: ['redb', 'blueb', 'yellowb'],
    numbers: ['n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'n8', 'n9', 'n10', 'n11', 'n12', 'n13', 'n14', 'n15']
};
// Audio assets
const BALL_SOUND_ASSET = "ballSound.mp4";
const BACKGROUND_SOUND_ASSET = "hotShotDoubleShotSound.mp4";

/**
 * GameTest sets up a PIXI Application for a ball drawing game.
 * It handles asset loading, game initialization, and animations.
 */
class GameTest {
    resources = null;
    app = null;
    displayedBalls = [];
    ballsContainer = null;
    ballPool = [];
    sounds = {};

    constructor() {
        // Initialize the PIXI Application
        this.app = new PIXI.Application({width: SCREEN_WIDTH, height: SCREEN_HEIGHT});
        // Enable PixiJS Chrome extension for debugging
        globalThis.__PIXI_APP__ = this.app;

        // Add the canvas to the HTML document
        const canvas = this.app.view;
        document.body.appendChild(canvas);

        // Set up event listener for window resize
        window.addEventListener(EVENT_RESIZE, () => {
            this.windowResize(canvas);
        });
        this.windowResize(canvas);

        // Load game assets
        const assetLoader = new AssetsLoader(ASSET_ROOT, ASSET_TYPE);
        assetLoader.loadAssets([ASSETS, BALL_ASSETS_SIMPLE, BALL_ASSETS_COMPLEX]).then(resources => {
            this.resources = resources;

            // Initialize sounds
            this.loadSounds();

            // Create and set up containers for different game layers
            const backgroundLayerContainer = new PIXI.Container();
            this.ballsContainer = new PIXI.Container();
            const masksContainer = new PIXI.Container();
            const foregroundLayerContainer = new PIXI.Container();

            this.app.stage.addChild(backgroundLayerContainer);
            this.app.stage.addChild(this.ballsContainer);
            this.app.stage.addChild(foregroundLayerContainer);

            // Set up and position game elements (tube, masks, shines, buttons, etc.)
            // Create tube sprite.
            this.tube = new PIXI.Sprite(resources.tube);
            this.tube.x = 0;
            this.tube.y = 650;
            this.tube.width = 1024;
            this.tube.height = 120;
            backgroundLayerContainer.addChild(this.tube);

            // Create and position the glass mask
            const glassMask = new PIXI.Sprite(resources.glassmask);
            glassMask.x = 136;
            glassMask.y = 669;
            glassMask.width = 394;
            glassMask.height = 79;
            masksContainer.addChild(glassMask);

            // Create and position the peek mask
            const peekMask = new PIXI.Sprite(resources.peekmask);
            peekMask.x = 719;
            peekMask.y = 671;
            peekMask.width = 83;
            peekMask.height = 79;
            masksContainer.addChild(peekMask);

            // Apply the masks to the balls container
            const maskSprite = new PIXI.Sprite(this.app.renderer.generateTexture(masksContainer));
            maskSprite.x = 136;
            maskSprite.y = 667;
            this.app.stage.addChild(maskSprite);
            this.ballsContainer.mask = maskSprite;

            // Create and position the peek shine
            const peekShine = new PIXI.Sprite(resources.peekshine);
            peekShine.x = 719;
            peekShine.y = 671;
            peekShine.width = 83;
            peekShine.height = 46;
            peekShine.alpha = 0.7
            foregroundLayerContainer.addChild(peekShine);

            // Create and position the window shine
            const windowShine = new PIXI.Sprite(resources.windowshine);
            windowShine.x = 132;
            windowShine.y = 669;
            windowShine.width = 400;
            windowShine.height = 46;
            windowShine.alpha = 0.7
            foregroundLayerContainer.addChild(windowShine);

            // Create sprites for each button state
            const playBtnNormal = new PIXI.Sprite(resources.playbutton_off);
            const playBtnPressed = new PIXI.Sprite(resources.playbutton_on);
            const playBtnDisabled = new PIXI.Sprite(resources.playbutton_dis);

            // Position and size them
            [playBtnNormal, playBtnPressed, playBtnDisabled].forEach((btn) => {
                btn.eventMode = 'static';
                btn.x = 900;
                btn.y = 690;
                btn.width = 100;
                btn.height = 50;
                btn.visible = false;  // Hide them initially
                foregroundLayerContainer.addChild(btn);
            });

            // Initially, only the normal state is visible
            playBtnNormal.visible = true;

            // Set up play button interaction
            playBtnNormal.on(EVENT_POINTER_DOWN, () => {
                // Switch to pressed state
                playBtnNormal.visible = false;
                playBtnPressed.visible = true;

                // Start the ball animation
                this.clearResult();
                const result = this.generateResult();
                this.generateBalls(result);

                // Disable the button
                playBtnPressed.visible = false;
                playBtnDisabled.visible = true;

                // Play sound when ball starts moving
                this.playSound('ballSound');

                // After the animation is complete, enable the button again
                // Assuming the total animation duration is 5 seconds
                setTimeout(() => {
                    playBtnDisabled.visible = false;
                    playBtnNormal.visible = true;
                }, 5000);

                //start the animation here
                this.animateBalls(result);
            });
        });
    }

    /**
     * Load game sounds
     * @returns {Promise<void>}
     */
    async loadSounds() {
        await this.loadSound('ballSound', ASSET_ROOT + BALL_SOUND_ASSET);
        await this.loadSound('backgroundSound', ASSET_ROOT + BACKGROUND_SOUND_ASSET);
        this.playSound('backgroundSound');
    }

    /**
     * Resizes canvas size according to window size, From EVENT_RESIZE events
     * @param canvas {Canvas} the canvas instance to be resized
     */
    windowResize(canvas) {
        const ASPECT_RATIO = SCREEN_WIDTH / SCREEN_HEIGHT;
        const containerWidth = window.innerWidth;
        const containerHeight = window.innerHeight;
        let newHeight = containerWidth / ASPECT_RATIO;
        let newWidth = 0;

        if (newHeight > containerHeight) {
            newHeight = containerHeight;
            newWidth = newHeight * ASPECT_RATIO;
        } else {
            newWidth = containerWidth;
        }

        canvas.style.height = newHeight + 'px';
        canvas.style.width = newWidth + 'px';
    }

    /**
     * Clears all the balls from the screen
     */
    clearResult() {
        // clear the previous graphics
        this.displayedBalls.forEach(ball => {
            this.ballsContainer.removeChild(ball);
            ball.inUse = false;
        });
        this.displayedBalls = [];
    }

    /**
     * Generates the ball graphics needed to show the result
     * @param result {array} an array of integer values from 1-15
     */
    generateBalls(result) {
        // Clear any previously displayed balls
        this.clearResult();

        result.forEach((ballNumber, index) => {
            const ballContainer = this.getBall(ballNumber, index);

            // Store the ball graphic references and add to the stage
            this.displayedBalls.push(ballContainer);

            // Add the balls to the balls container
            this.ballsContainer.addChild(ballContainer);
        });
    }

    /**
     * Retrieves ball from the ballPool
     * @param ballNumber
     * @param index
     * @returns {*}
     */
    getBall(ballNumber, index) {
        let ball = this.ballPool.find(b => !b.inUse);
        if (!ball) {
            ball = this.createBall(ballNumber); // create fresh ball
            this.ballPool.push(ball);
        } else {
            this.updateBall(ballNumber, ball); // update existing ball
        }
        // Position the ball off-screen (to the right)
        ball.x = BALL_DRAW_ORIGIN_X;
        ball.y = BALL_VERTICAL_CENTER;
        ball.inUse = true;
        return ball;
    }

    /**
     * Generates a random ball extraction result
     * @return an array of integer values from 1-15
     */
    generateResult() {
        const numbers = [];

        while (numbers.length < VISIBLE_BALLS) {
            const randomNumber = Math.floor(Math.random() * 15) + 1;

            if (numbers.indexOf(randomNumber) === -1) {
                numbers.push(randomNumber);
            }
        }
        return numbers;
    }

    /**
     * Begins the animation sequence for drawing the balls one by one
     */
    animateBalls() {
        // Animate result referencing displayedBalls
        this.displayedBalls.forEach((ballContainer, index) => {
            const ball = ballContainer.getChildAt(0);
            const number = ballContainer.getChildAt(1);

            const blurFilter = new PIXI.filters.BlurFilter();
            blurFilter.blurX = BLUR_ARMOUNT;
            blurFilter.blurY = 0;

            const shadowFilter = new DropShadowFilter();
            shadowFilter.blur = 1;
            shadowFilter.distance = 15;
            shadowFilter.angle = 90;

            // Apply the filters to each ball
            ball.filters = [shadowFilter];
            number.filters = [blurFilter];

            // Calculate the final x-position for the ball at the end of the tube
            const finalX = TUBE_START_X + index * BALL_WIDTH;

            // Animate the ball using gsap
            gsap.to(ballContainer, {
                x: finalX, duration: 2,  // Duration of the animation in seconds
                ease: "power2.inOut",  // Simulate acceleration/deceleration
                delay: index * 0.5,  // Stagger the animation for each ball
                onUpdate: () => {
                    // Apply counter-clockwise rotation to the number
                    const progress = gsap.getProperty(ballContainer, "x") / finalX;
                    number.rotation = progress * Math.PI * 2;  // Rotate 360 degrees

                    // Recenter the number
                    number.x = (BALL_WIDTH - number.width);
                    number.y = (BALL_HEIGHT - NUMBER_HEIGHT);
                },
                onComplete: () => {
                    // Reset rotation
                    number.rotation = 0;
                    const numberScale = number.scale;
                    // Pause and highlight at the end
                    gsap.to(number.scale, {x: numberScale.x + 0.1, y: numberScale.y + 0.1, duration: 0.2});
                    gsap.to(number.scale, {x: numberScale.x, y: numberScale.y, duration: 0.2, delay: 0.2});
                    number.filters[0].blurX = 0;
                }
            });
        });
    }

    /**
     * Generates ball graphics according to the drawn number
     * @param ballNumber {Number} an integer between 1 and 15
     * @return a Pixi Container with the ball graphics
     */
    createBall(ballNumber) {
        // Determine ball color
        let ballColor;
        switch (ballNumber % 3) {
            case 1:
                ballColor = 'redb';
                break;
            case 2:
                ballColor = 'yellowb';
                break;
            case 0:
                ballColor = 'blueb';
                break;
        }

        // Create ball sprite from assets
        const ballSprite = new PIXI.Sprite(this.resources[ballColor]);
        ballSprite.width = BALL_WIDTH;
        ballSprite.height = BALL_HEIGHT;

        // Overlay the number on the ball
        const numberSprite = new PIXI.Sprite(this.resources['n' + ballNumber]);
        numberSprite.anchor.set(0.5, 0.5);
        numberSprite.width = ballNumber > 9 ? DOUBLE_DIGIT_NUMBER_WIDTH : SINGLE_DIGIT_NUMBER_WIDTH;
        numberSprite.height = NUMBER_HEIGHT;
        numberSprite.x = (BALL_WIDTH - numberSprite.width) * 2;  // Center the number on the ball
        numberSprite.y = (BALL_HEIGHT - NUMBER_HEIGHT) * 2;

        // Create a container for the ball and number
        const ballContainer = new PIXI.Container();
        ballContainer.addChild(ballSprite);
        ballContainer.addChild(numberSprite);

        return ballContainer;
    }

    /**
     * Updates ball graphics according to the drawn number
     * @param ballNumber {Number} an integer between 1 and 15
     * @return a Pixi Container with the ball graphics
     */
    updateBall(ballNumber, ballContainer) {
        // Determine ball color
        let ballColor;
        switch (ballNumber % 3) {
            case 1:
                ballColor = 'redb';
                break;
            case 2:
                ballColor = 'yellowb';
                break;
            case 0:
                ballColor = 'blueb';
                break;
        }

        // Update ball sprite from assets
        const ballSprite = ballContainer.getChildAt(0);
        ballSprite.texture = this.resources[ballColor];
        ballSprite.width = BALL_WIDTH;
        ballSprite.height = BALL_HEIGHT;

        // Overlay the number on the ball
        const numberSprite = ballContainer.getChildAt(1);
        numberSprite.texture = this.resources['n' + ballNumber];
        numberSprite.width = ballNumber > 9 ? DOUBLE_DIGIT_NUMBER_WIDTH : SINGLE_DIGIT_NUMBER_WIDTH;
        numberSprite.height = NUMBER_HEIGHT;
        numberSprite.x = (BALL_WIDTH - numberSprite.width) / 2;  // Center the number on the ball
        numberSprite.y = (BALL_HEIGHT - NUMBER_HEIGHT) / 2;
        return ballContainer;
    }

    /**
     * Load a sound
     * @param name
     * @param src
     * @returns {Promise<unknown>}
     */
    loadSound(name, src) {
        return new Promise((resolve) => {
            this.sounds[name] = new Howl({
                src: [src],
                onload: resolve
            });
        });
    }

    /**
     * Play a sound
     * @param name
     */
    playSound(name) {
        if (this.sounds[name]) {
            this.sounds[name].play();
        } else {
            console.warn(`Sound ${name} not found!`);
        }
    }
}

new GameTest();