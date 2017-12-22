let game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example',
{
    preload: preload, create: create, update: update, render: render
});

function preload() {
    game.time.advancedTiming = true;
    game.load.crossOrigin = 'anonymous';

    game.load.tilemap('level1', 'assets/level1.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles-1', 'assets/tiles-1.png');
    game.load.image('background2', 'assets/level1.png');
    game.load.spritesheet('dude', 'assets/Player1.png', 30, 41);
    game.load.spritesheet('dude2', 'assets/Player2.png', 30, 41);
    game.load.image('grenades1', 'assets/enemy-bullet1.png');
    game.load.image('grenades2', 'assets/enemy-bullet2.png');
    game.load.spritesheet('kaboom', 'assets/explode.png', 128, 128);
    game.load.spritesheet('gravityBall', 'assets/shinyball.png', 32, 32);

};

let map;
let layer;
let player1;
let player2;
let gravityBall;
let facingP1 = 'right';
let facingP2 = 'right';
let cursors;
let controls = {};
let playerSpeed = 250;
let playerSpeedGravity = 150;
let playerSpeedGravityCheck = 0;

let jumpSpeed = 450;
let scoreP1 = 0;
let scoreTextP1;
let scoreP2 = 0;
let scoreTextP2;
let grenadeSpeedP2 = 800;
let grenadeSpeedP1 = 800;
let grenadeSpeed = 800;
let explosions;
let worldScale = 1;
let counter = 0;
let stateText;
let allottedTime = 120;
let lockRestart = true;
let stateTextFontSize = 44;
let timeString = 'Time:';
let timeText;
let timeTextFontSize = 18;
let grenadeTime1 = 0;
let grenadeTime2 = 0;

let gameSize, newSize, zoom;
let ZOOM_DELTA = 0.1;

let gravityOff = true;

let fireP2lock = false;
let fireP1lock = false;


Phaser.Point.prototype.toString = function() {
    return 'x=' + this.x.toFixed(2) + ' y=' + this.y.toFixed(2);
};

function create() {

    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.stage.backgroundColor = '#000000';
    game.physics.arcade.gravity.y = 750;

//Maybe I will create a Grenades class?
grenades1 = game.add.group();
grenades1.enableBody = true;
grenades1.physicsBodyType = Phaser.Physics.ARCADE;
grenades1.createMultiple(30, 'grenades1');
grenades1.setAll('anchor.x', 0.5);
grenades1.setAll('anchor.y', 1);
grenades1.setAll('outOfBoundsKill', true);
grenades1.setAll('checkWorldBounds', true);

grenades2 = game.add.group();
grenades2.enableBody = true;
grenades2.physicsBodyType = Phaser.Physics.ARCADE;
grenades2.createMultiple(30, 'grenades2');
grenades2.setAll('anchor.x', 0.5);
grenades2.setAll('anchor.y', 1);
grenades2.setAll('outOfBoundsKill', true);
grenades2.setAll('checkWorldBounds', true);

//Maybe I will create a Explosions class?
    //  An explosion pool
    explosions = game.add.group();
    explosions.createMultiple(30, 'kaboom');
    explosions.forEach(setupPlayer, this);

    function setupPlayer(player) {
        player.anchor.x = 0.5;
        player.anchor.y = 0.5;
        player.animations.add('kaboom');
    };

    map = game.add.tilemap('level1');
    map.addTilesetImage('tiles-1');
    map.setCollisionByExclusion([13, 14, 15, 16, 46, 47, 48, 49, 50, 51]);

    layer = map.createLayer('Tile Layer 1');
    layer.resizeWorld();

//Image for zooming to prevent cut of level map in a view.
let grid = game.add.image(0, 0, 'background2');
grid.alpha = 1;

//show borders of layer in game
    // layer.debug = true;

    //for random position
    player1 = game.add.sprite(randX(), randY(), 'dude');
    player2 = game.add.sprite(randX(), randY(), 'dude2');

    gravityBall = game.add.sprite(1500,
        1500, 'gravityBall');
    game.physics.enable(gravityBall, Phaser.Physics.ARCADE);
    gravityBall.body.collideWorldBounds = true;
    gravityBall.body.setSize(32, 32, 0, 0);
    gravityBall.kill();

    //PLAYER1
    // initializing first player in random place in the game world
    game.physics.enable(player1, Phaser.Physics.ARCADE);
    player1.body.collideWorldBounds = true;
    player1.body.setSize(16, 41, 8, 0);
    player1.animations.add('left', [35, 34, 33, 32, 31, 30], 15, true);
    player1.animations.add('turn', [7, 8], 15, true);
    player1.animations.add('right', [0, 1, 2, 3, 4, 5], 15, true);
    player1.animations.add('jumpRight', [16, 17], 8, true);
    player1.animations.add('jumpLeft', [19, 18], 8, true);
    player1.animations.add('throwRight', [9, 10, 11, 12], 45, true);
    player1.animations.add('throwLeft', [26, 25, 24, 23], 45, true);
    player1.animations.add('idleLeft', [21], 8, true);
    player1.animations.add('idleRight', [14], 8, true);

    scoreTextP1 = game.add.text(game.width - 180, 10, scoreP1, {font: '14px Orbitron', fill: '#fff'});


    //PLAYER2
    game.physics.enable(player2, Phaser.Physics.ARCADE);
    player2.body.collideWorldBounds = true;
    player2.body.setSize(16, 41, 8, 0);
    player2.animations.add('left', [35, 34, 33, 32, 31, 30], 15, true);
    player2.animations.add('turn', [7, 8], 15, true);
    player2.animations.add('right', [0, 1, 2, 3, 4, 5], 15, true);
    player2.animations.add('jumpRight', [16, 17], 8, true);
    player2.animations.add('jumpLeft', [19, 18], 8, true);
    player2.animations.add('throwRight', [9, 10, 11, 12], 45, true);
    player2.animations.add('throwLeft', [26, 25, 24, 23], 45, true);
    player2.animations.add('idleLeft', [21], 8, true);
    player2.animations.add('idleRight', [14], 8, true);
    scoreTextP2 = game.add.text(game.width - 180, 10, scoreP2, {font: '14px Orbitron', fill: '#fff'});

    //The time string
    timeText = game.add.text(game.camera.width * 0.5, game.camera.height * 0.2, timeString,
        {font: '18px Orbitron', fill: '#fff', align: 'center'});
    timeText.anchor.setTo(0.5, 0.5);
    timeText.fixedToCamera = true;
    timeText.inputEnabled = true;
    timeText.input.enableDrag();

    controls = {
        right: this.input.keyboard.addKey(Phaser.Keyboard.D),
        left: this.input.keyboard.addKey(Phaser.Keyboard.A),
        up: this.input.keyboard.addKey(Phaser.Keyboard.W),
        down: this.input.keyboard.addKey(Phaser.Keyboard.S),
    };

    cursors = game.input.keyboard.createCursorKeys();
    fireButtonP1 = game.input.keyboard.addKey(Phaser.Keyboard.ZERO);
    fireButtonP2 = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    //----------To zooming out our game (start)-------------
    zoom = new Phaser.Point(1, 1);
    // We'll apply `zoom` to the original game size
    gameSize = Object.freeze(new Phaser.Point(game.width, game.height));
    // and store the result in `newSize`
    newSize = gameSize.clone();
    //----------To zooming out our game (end)-------------

    stateText = game.add.text(game.camera.view.x + game.camera.width * 0.5, game.camera.view.y + game.camera.height * 0.5, ' ',
        {font: '44px Orbitron', fill: '#fff', align: 'center'});
    stateText.anchor.setTo(0.5, 0.5);
    stateText.visible = false;
    stateText.fixedToCamera = true;
    stateText.inputEnabled = true;
    stateText.input.enableDrag();

    player1.body.onCollide = new Phaser.Signal();
    player1.body.onCollide.add(collideEventP1, this);

    gravityBall.body.onCollide = new Phaser.Signal();
    gravityBall.body.onCollide.add(gravityBallCollide, this);

    function collideEventP1 (player1, player2) {
        if (player1.key !== "gravityBall" && player2.key !== "gravityBall" ) {
            if (game.physics.arcade.gravity.y < 10) {

                if (player1.body.x < player2.body.x) {
                    setTimeout(function() {
                        player1.body.velocity.x = playerSpeedGravity;
                        player2.body.velocity.x = -playerSpeedGravity;

                    }, 40)
                };
                if (player1.body.x > player2.body.x) {
                    setTimeout(function() {
                        player1.body.velocity.x = -playerSpeedGravity;
                        player2.body.velocity.x = playerSpeedGravity;

                    }, 40)
                };

            }
        }
    }

    function gravityBallCollide (gravityBall) {
        gravityBall.kill();
        if (gravityOff) {
            gravityOff = false;
            setTimeout(function() {
                // console.log(window);
                if (game.physics.arcade.gravity.y === 0) {
                    game.physics.arcade.gravity.y = 750;
                    jumpSpeed = 450;
                }
                else {
                    game.physics.arcade.gravity.y = 0;
                    jumpSpeed = 200;
                    // player2.body.acceleration.set(0);
                    // player2.body.mass = 0;
                }
                gravityOff = true;
            }, 100);
        }
    }
}


function update() {
    //For player 1d
    game.physics.arcade.collide(player1, layer);
    game.physics.arcade.collide(player2, layer);
    if (game.physics.arcade.gravity.y !== 0) {
        player2.body.velocity.x = 0;
        player1.body.velocity.x = 0;
    }
    game.physics.arcade.collide(player1, player2);
    game.physics.arcade.collide(grenades1, layer);
    game.physics.arcade.collide(grenades2, layer);

    game.physics.arcade.collide(gravityBall, layer);
    game.physics.arcade.collide(gravityBall, player1);
    game.physics.arcade.collide(gravityBall, player2);

    //Signals 
    fireButtonP2.onUp.add(function() {
        fireP2lock = false
    }, this);
    fireButtonP1.onUp.add(function() {
        fireP1lock = false
    }, this);

    //MOVEMENT LOGIC PLAYER 1--------------------------------------------------------------
    if (game.physics.arcade.gravity.y !== 0) {
        if (fireButtonP1.isDown) {

            if (facingP1 === 'right') {
                player1.animations.play('throwRight');
            }
            else if (facingP1 === 'left') {
                player1.animations.play('throwLeft');
            }
            setTimeout(function() {
                player1.animations.stop(null, true);
            }, 160);
            if (game.time.now > grenadeTime1) {
                if (!fireP1lock) {

                    let throwGrenadeP1 = new ThrowGrenade();
                    throwGrenadeP1.init(player1, grenadeSpeedP1);
                    grenadeTime1 = game.time.now + 500;
                }
                fireP1lock = true;
            }
        }
        else if (cursors.left.isDown) {
            facingP1 = 'left';
            player1.body.velocity.x = -playerSpeed;
            grenadeSpeedP1 = -grenadeSpeed + player1.body.velocity.x;

            if (player1.body.onFloor()) {
                player1.animations.play('left');
            }
            else {
                player1.animations.play('jumpLeft');
            }
        }
        else if (cursors.right.isDown) {
            facingP1 = 'right';
            player1.body.velocity.x = playerSpeed;
            grenadeSpeedP1 = grenadeSpeed + player1.body.velocity.x;
            if (player1.body.onFloor()) {
                player1.animations.play('right');
            }
            else {
                player1.animations.play('jumpRight');
            }
        }
        else if (cursors.up.isDown && (player1.body.onFloor() || game.physics.arcade.gravity.y === 0)) {
            player1.body.velocity.y = -jumpSpeed;
            if (player1.body.onFloor() || game.physics.arcade.gravity.y === 0) {
                if (facingP1 === 'right') {
                    player1.animations.play('jumpRight');
                }
                else if (facingP1 === 'left') {
                    player1.animations.play('jumpLeft');
                }
            }
        }
        else if (cursors.down.isDown && !player1.body.onFloor()) {
            player1.body.velocity.y = jumpSpeed;
            if (!player1.body.onFloor()) {
                if (facingP1 === 'right') {
                    player1.animations.play('jumpRight');

                }
                else if (facingP1 === 'left') {
                    player1.animations.play('jumpLeft');
                }
            }
        }
        else {
            if (facingP1 === 'left') {
                player1.animations.play('idleLeft');
            }
            if (facingP1 === 'right') {
                player1.animations.play('idleRight');
            }
        }
        moveCameraRight(player1, player2);
        moveCameraLeft(player1, player2);
    }
    //MOVEMENT LOGIC PLAYER 1--------------------------------------------------------------

    //MOVEMENT IN ZERO GRAVITY LOGIC PLAYER 1--------------------------------------------------------------
    if (game.physics.arcade.gravity.y === 0) {

        if (fireButtonP1.isDown) {

            if (facingP1 === 'right') {
                player1.animations.play('throwRight');
            }
            else if (facingP1 === 'left') {
                player1.animations.play('throwLeft');
            }
            setTimeout(function() {
                player1.animations.stop(null, true);
            }, 160);
            if (game.time.now > grenadeTime1) {
                if (!fireP1lock) {

                    let throwGrenadeP1 = new ThrowGrenade();
                    throwGrenadeP1.init(player1, grenadeSpeedP1);
                    grenadeTime1 = game.time.now + 500;
                }
                fireP1lock = true;
            }
        }
        else if (cursors.left.isDown) {
            facingP1 = 'left';
            grenadeSpeedP1 = -(grenadeSpeed + 150);
            if (Math.abs(player1.body.velocity.x) < 10) {
                playerSpeedGravity = -150;
                playerSpeedGravityCheck = 0;
                player1.body.velocity.x = playerSpeedGravity;
                if (player1.body.onFloor()) {
                    player1.animations.play('left');
                }
                else {
                    player1.animations.play('jumpLeft');
                }
            }
        }
        else if (cursors.right.isDown) {
            facingP1 = 'right';
            grenadeSpeedP1 = (grenadeSpeed + 150);

            if (Math.abs(player1.body.velocity.x) < 10) {
                playerSpeedGravity = 150;
                playerSpeedGravityCheck = 0;
                player1.body.velocity.x = playerSpeedGravity;

                if (player1.body.onFloor()) {
                    player1.animations.play('right');
                }
                else {
                    player1.animations.play('jumpRight');
                }
            }
        }
        else if (cursors.up.isDown && (Math.abs(player1.body.velocity.y) < 10) && (Math.abs(player1.body.velocity.x) < 10)) {
            player1.body.velocity.y = -jumpSpeed;
            if (player1.body.onFloor() || game.physics.arcade.gravity.y === 0) {
                if (facingP1 === 'right') {
                    player1.animations.play('jumpRight');
                }
                else if (facingP1 === 'left') {
                    player1.animations.play('jumpLeft');
                }
            }
        }
        else if (cursors.down.isDown && (Math.abs(player1.body.velocity.y) < 10) && (Math.abs(player1.body.velocity.x) < 10)) {
            player1.body.velocity.y = jumpSpeed;
            if (!player1.body.onFloor()) {
                if (facingP1 === 'right') {
                    player1.animations.play('jumpRight');
                }
                else if (facingP1 === 'left') {
                    player1.animations.play('jumpLeft');
                }
            }
        }
        else {
            if (facingP1 === 'left') {
                player1.animations.play('idleLeft');
            }
            if (facingP1 === 'right') {
                player1.animations.play('idleRight');
            }
        }
        moveCameraRight(player1, player2);
        moveCameraLeft(player1, player2);
    }
    //MOVEMENT LOGIC PLAYER 1--------------------------------------------------------------
    //Место для перекидки камеры по оси Y вниз:
    moveCameraDown(player1, player2);
    //Место для перекидки камеры по оси Y вверх:
    moveCameraTop(player1, player2);

    //For PLAYER 2
//MOVEMENT LOGIC PLAYER 2--------------------------------------------------------------
if (game.physics.arcade.gravity.y !== 0) {
    if (fireButtonP2.isDown) {

        if (facingP2 === 'right') {
            player2.animations.play('throwRight');
        }
        else if (facingP2 === 'left') {
            player2.animations.play('throwLeft');
        }
        setTimeout(function() {
            player2.animations.stop(null, true);
        }, 160);
        if (game.time.now > grenadeTime2) {
            if (!fireP2lock) {

                let throwGrenadeP2 = new ThrowGrenade();
                throwGrenadeP2.init(player2, grenadeSpeedP2);
                grenadeTime2 = game.time.now + 500;
            }
            fireP2lock = true;
        }
    }
    else if (controls.left.isDown) {
            facingP2 = 'left';
            player2.body.velocity.x = -playerSpeed;
            grenadeSpeedP2 = -grenadeSpeed + player2.body.velocity.x;

            if (player2.body.onFloor()) {
                player2.animations.play('left');
            }
            else {
                player2.animations.play('jumpLeft');
            }
        }
        else if (controls.right.isDown) {
            facingP2 = 'right';
            player2.body.velocity.x = playerSpeed;
            grenadeSpeedP2 = grenadeSpeed + player2.body.velocity.x;
            if (player2.body.onFloor()) {
                player2.animations.play('right');
            }
            else {
                player2.animations.play('jumpRight');
            }
        }
        else if (controls.up.isDown && (player2.body.onFloor() || game.physics.arcade.gravity.y === 0)) {
            player2.body.velocity.y = -jumpSpeed;
            if (player2.body.onFloor() || game.physics.arcade.gravity.y === 0) {
                if (facingP2 === 'right') {
                    player2.animations.play('jumpRight');
                }
                else if (facingP2 === 'left') {
                    player2.animations.play('jumpLeft');
                }
            }
        }
        else if (controls.down.isDown && !player2.body.onFloor()) {
            player2.body.velocity.y = jumpSpeed;
            if (!player2.body.onFloor()) {
                if (facingP2 === 'right') {
                    player2.animations.play('jumpRight');

                }
                else if (facingP2 === 'left') {
                    player2.animations.play('jumpLeft');
                }
            }
        }
        else {
            if (facingP2 === 'left') {
                player2.animations.play('idleLeft');
            }
            if (facingP2 === 'right') {
                player2.animations.play('idleRight');
            }
        }
        moveCameraRight(player2, player1);
        moveCameraLeft(player2, player1);
    }
    //MOVEMENT LOGIC PLAYER 2--------------------------------------------------------------

    //MOVEMENT IN ZERO GRAVITY LOGIC PLAYER 2--------------------------------------------------------------
    if (game.physics.arcade.gravity.y === 0) {

        if (fireButtonP2.isDown) {

            if (facingP2 === 'right') {
                player2.animations.play('throwRight');
            }
            else if (facingP2 === 'left') {
                player2.animations.play('throwLeft');
            }
            setTimeout(function() {
                player2.animations.stop(null, true);
            }, 160);
            if (game.time.now > grenadeTime2) {
                if (!fireP2lock) {

                    let throwGrenadeP2 = new ThrowGrenade();
                    throwGrenadeP2.init(player2, grenadeSpeedP2);
                    grenadeTime2 = game.time.now + 500;
                }
                fireP2lock = true;
            }
        }
        else if (controls.left.isDown) {
            facingP2 = 'left';
            grenadeSpeedP2 = -(grenadeSpeed + 150);
            if (Math.abs(player2.body.velocity.x) < 10) {
                playerSpeedGravity = -150;
                playerSpeedGravityCheck = 0;
                player2.body.velocity.x = playerSpeedGravity;
                if (player2.body.onFloor()) {
                    player2.animations.play('left');
                }
                else {
                    player2.animations.play('jumpLeft');
                }
            }
        }
        else if (controls.right.isDown) {
            facingP2 = 'right';
            grenadeSpeedP2 = (grenadeSpeed + 150);

            if (Math.abs(player2.body.velocity.x) < 10) {
                playerSpeedGravity = 150;
                playerSpeedGravityCheck = 0;
                player2.body.velocity.x = playerSpeedGravity;

                if (player2.body.onFloor()) {
                    player2.animations.play('right');
                }
                else {
                    player2.animations.play('jumpRight');
                }
            }
        }
        else if (controls.up.isDown && (Math.abs(player2.body.velocity.y) < 10) && (Math.abs(player2.body.velocity.x) < 10)) {
            player2.body.velocity.y = -jumpSpeed;
            if (player2.body.onFloor() || game.physics.arcade.gravity.y === 0) {
                if (facingP2 === 'right') {
                    player2.animations.play('jumpRight');
                }
                else if (facingP2 === 'left') {
                    player2.animations.play('jumpLeft');
                }
            }
        }
        else if (controls.down.isDown && (Math.abs(player2.body.velocity.y) < 10) && (Math.abs(player2.body.velocity.x) < 10)) {
            player2.body.velocity.y = jumpSpeed;
            if (!player2.body.onFloor()) {
                if (facingP2 === 'right') {
                    player2.animations.play('jumpRight');
                }
                else if (facingP2 === 'left') {
                    player2.animations.play('jumpLeft');
                }
            }
        }
        else {
            if (facingP2 === 'left') {
                player2.animations.play('idleLeft');
            }
            if (facingP2 === 'right') {
                player2.animations.play('idleRight');
            }
        }
        moveCameraRight(player2, player1);
        moveCameraLeft(player2, player1);
    }
    //MOVEMENT LOGIC PLAYER 2--------------------------------------------------------------

    moveCameraTop(player2, player1);
    moveCameraDown(player2, player1);
    //  Run collision
    game.physics.arcade.overlap(grenades2, player1, collisionHandler, null, this);
    game.physics.arcade.overlap(grenades1, player2, collisionHandler, null, this);

    //When players are close to each other on Y zoom camera in
    if ((Math.abs(player1.position.y - player2.position.y) <= game.camera.height * 0.33) &&
        (Math.abs(player1.position.x - player2.position.x) <= game.camera.width * 0.33)) {
        zoomIn();
    timeText.fontSize = timeTextFontSize;
}

//Respawn GRAVITYBALL
if ( Math.floor(this.game.time.totalElapsedSeconds(), 1) === 20 && !gravityBall.alive ) {
    respawnGravityBall()
};
if ( Math.floor(this.game.time.totalElapsedSeconds(), 1) === 60 && !gravityBall.alive ) {
    respawnGravityBall()
};
if ( Math.floor(this.game.time.totalElapsedSeconds(), 1) === 90 && !gravityBall.alive ) {
    respawnGravityBall()
};

function respawnGravityBall() {
    let xRand =  game.world.width * Math.random();
    let yRand =  game.world.height * Math.random();
    if (xRand < 50) {xRand = 80};
    if (xRand > 950) {xRand = 900};
    if (yRand > 700) {yRand = 650};

    gravityBall.alpha = 0;
    gravityBall.reset(xRand, yRand);
    setTimeout(function() {
        gravityBall.alpha = 0.3
    }, 333);
    setTimeout(function() {
        gravityBall.alpha = 0.66
    }, 666);
    setTimeout(function() {
        gravityBall.alpha = 1
    }, 1000);
}

if (Math.floor(this.game.time.totalElapsedSeconds(), 1) > allottedTime) {
    killWhatNeed();
        //Pin Game Over text to Center!!!
        stateTextOutput();
    }
    else {
        timeText.text = 'Time: ' + (allottedTime - Math.floor(this.game.time.totalElapsedSeconds(), 1));
    }
    //the "click to restart"
    if (game.input.keyboard.isDown(Phaser.Keyboard.ENTER) && !lockRestart) {
        location.reload();
    }


    //Pin scores to players
    scoreTextP1.x = Math.floor(player1.x + player1.width / 2 - 5);
    scoreTextP1.y = Math.floor(player1.y - player1.height + 25);
    scoreTextP2.x = Math.floor(player2.x + player2.width / 2 - 5);
    scoreTextP2.y = Math.floor(player2.y - player2.height + 25);

//Pin timeText to view center
timeText.cameraOffset.x = game.camera.width * 0.5;
timeText.cameraOffset.y = game.camera.height * 0.05;
};

function randX() {
    let xRand =  game.world.width * Math.random();
    if (xRand < 50) {xRand = 80};
    if (xRand > 950) {xRand = 900};
    return xRand
}

function randY() {
    let yRand =  game.world.height * Math.random();
    if (yRand > 700) {yRand = 650};
    return yRand
}

function moveCameraLeft(player1, player2) {
//Если Player1 вышел из вида (кадра) камеры слева
if (player1.position.x < game.camera.view.x) {
        // console.log('зашёл за камеру слева');
        //и Player2 в кадре камеры
        if (player2.position.x < game.camera.view.x + game.camera.width) {
            game.camera.view.x = game.camera.view.x - (game.camera.view.x + game.camera.width - player2.position.x) / 2;
        }
        else {
            zoomOut();
        }
        //Ограничения на перемещение пивота камеры по оси Х
        if (game.camera.view.x < 0) {
            game.camera.view.x = 0;
        }
    }
}

function moveCameraRight(player1, player2) {
//Если Player1 вышел из вида (кадра) камеры справа
if (player1.position.x + player1.body.width > game.camera.view.x + game.camera.width) {
        // console.log('зашёл за камеру справа');
        //и Player2 в кадре камеры
        if (player2.position.x - player1.body.width > game.camera.view.x) {
            game.camera.view.x = game.camera.view.x + (player2.position.x - game.camera.view.x) / 2;
        }
        else {
            zoomOut();
        }
        //Ограничения на перемещение пивота камеры по оси Х
        if (game.camera.view.x > (game.world.width - game.camera.width)) {
            game.camera.view.x = (game.world.width - game.camera.width);
        }
        // console.log(game.camera.view.x + game.camera.width);
    }
}

function moveCameraTop(player1, player2) {
    //Если Player1 вышел из вида (кадра) камеры сверху
    if ((player1.position.y + 5 ) < game.camera.view.y) {
        // console.log('зашёл за камеру сверху');
        //и Player2 в кадре камеры 
        if (player2.position.y < (game.camera.view.y + game.camera.height)) {
            game.camera.view.y = game.camera.view.y - (game.camera.view.y + game.camera.height - player2.position.y) / 2;
        }
        else {
            zoomOut();
        }
        //Ограничения на перемещение пивота камеры по оси У
        if (game.camera.view.y <= 0) {
            game.camera.view.y = 0;
        }
    }
}

function moveCameraDown(player1, player2) {
    //Если Player1 вышел из вида (кадра) камеры снизу
    if ((player1.position.y + player1.body.height + 5) > (game.camera.view.y + game.camera.height)) {
        // console.log('зашёл за камеру снизу');
        //и Player2 в кадре камеры 
        if (player2.position.y > game.camera.view.y) {
            game.camera.view.y = game.camera.view.y + (player2.position.y - game.camera.view.y) / 2;
        }
        if ((player2.position.y > game.camera.view.y) && ( Math.abs(player2.position.y - player1.position.y) >= game.camera.height - 30)) {
            zoomOut();
        }
        //Ограничения на перемещение пивота камеры по оси У
        if (game.camera.view.y >= (game.world.height - game.camera.height)) {
            game.camera.view.y = (game.world.height - game.camera.height);
        }
        // console.log(game.camera.view.y + game.camera.height);
    }
}

//maybe here i will create a Class GrenadesThrower instead of method ThrowGrenade()
function ThrowGrenade() {
    this.grenadeTime = 0;
    this.throw = null;

    this.init = function(player, grenadeSpeedInput) {

        //Grab the first bullet we can from the pool
        if (player.key === 'dude') {
            this.throw = grenades1.getFirstExists(false);
        }
        if (player.key === 'dude2') {
            this.throw = grenades2.getFirstExists(false);
        }
        if (this.throw) {
            //to appear grenade near player
            this.throw.reset(player.x + 14, player.y + 20);
            //and also attach physical props to this grenade
            this.throw.body.velocity.y = -10;
            this.throw.body.velocity.x = grenadeSpeedInput;

            this.throw.body.onCollide = checkGrenadeOnTheFloor(this.throw);

            function checkGrenadeOnTheFloor(throw1) {
                let timerId = setInterval(function() {
                    if (throw1.body.onFloor()) {
                        let explosion = explosions.getFirstExists(false);
                        explosion.reset(throw1.body.x, throw1.body.y);
                        explosion.play('kaboom', 30, false, true);
                        throw1.kill();

                        clearInterval(timerId);
                    }
                }, 20);
                setTimeout(function() {

                    clearInterval(timerId);

                    if (throw1.alive) {
                        let explosion = explosions.getFirstExists(false);
                        explosion.reset(throw1.body.x, throw1.body.y);
                        explosion.play('kaboom', 30, false, true);
                        throw1.kill();
                    }
                }, 2000);

            }
        }
    }
};


//collision of grenades and player
function collisionHandler(player, grenade) {
    //  When a bullet hits an alien we kill them both
    grenade.kill();
    player.kill();

    //  Increase the score
    if (player.key === 'dude') {
        scoreP2 += 1;
        scoreTextP2.text = scoreP2;
    }
    if (player.key === 'dude2') {
        scoreP1 += 1;
        scoreTextP1.text = scoreP1;
    }

    //  And create an explosion :)
    //first grab one explosion object
    let explosion = explosions.getFirstExists(false);
    //the put explosion on player's body
    explosion.reset(player.body.x, player.body.y);
    explosion.play('kaboom', 30, false, true);

    game.physics.arcade.gravity.y = 750;
    jumpSpeed = 450;
    gravityOff = true;

    player.reset(randX(), randY());
};

function collisionHandlerPlayers(player1, player2) {
    console.log('players collided');
    player1.body.velocity.x = -150;
    player2.body.velocity.x = -150;
    player1.body.velocity.y = -150;
    player2.body.velocity.y = -150;
};


function render() {
    // game.debug.text(game.time.physicsElapsed, 32, 32);
    //for player1:
    // game.debug.body(player1);
    // information About first player
    // game.debug.bodyInfo(player1, 250, 45);

    //for player2:
    // game.debug.body(player2);
    // game.debug.bodyInfo(player2, 250, 495);

    // game.debug.cameraInfo(game.camera, 250, 495);
    // game.debug.text(game.time.fps || '--', 40, 60, "#00ff00");
    if (Math.floor(this.game.time.totalElapsedSeconds(), 1) > allottedTime) {
        // game.debug.text('', 350, 50); 
        lockRestart = false;
    } else {
        // game.debug.text('Time: ' + Math.floor(this.game.time.totalElapsedSeconds(), 1), 350, 50);
        // this.game.time.gamePaused();
        timeText.text = '';
    }
    // game.debug.text(stateText.cameraOffset, 550, 495);
    // game.debug.text(stateText.position, 550, 515);

};

function updateDimensions() {
    Phaser.Point.divide(gameSize, zoom, newSize);
    newSize.floor();
    // https://github.com/photonstorm/phaser/blob/v2.6.2/src/core/ScaleManager.js#L1105
    game.scale.updateDimensions(newSize.x, newSize.y, /*resize=*/true);
    game.input.scale.set(1 / zoom.x, 1 / zoom.y);
    game.input.activePointer.dirty = true; // no effect?
}

function zoomBy(dx, dy) {
    zoom.add(dx, dy);
    updateDimensions();
}

function zoomIn() {
    if (counter > 0) {
        counter--;
        zoomBy(ZOOM_DELTA * 0.73, ZOOM_DELTA);
        stateText.fontSize = stateTextFontSize * (1 - ZOOM_DELTA);
        timeText.fontSize = timeTextFontSize * (1 - ZOOM_DELTA);
        console.log('zoomIn');
        console.log(timeText.fontSize);
    }
}

function zoomOut() {
    if (counter < 3) {
        counter++;
        zoomBy(-ZOOM_DELTA * 0.73, -ZOOM_DELTA);
        //zooming our state text:
        stateText.fontSize = stateTextFontSize * (1 + ZOOM_DELTA);
        if (counter === 1) {
            timeText.fontSize = 20;
        }
        else if (counter === 2) {
            timeText.fontSize = 22;
        }
        else if (counter === 3) {
            timeText.fontSize = 24;
        }
    }
}

function killWhatNeed() {
    player1.kill();
    player2.kill();
    grenades1.kill();
    grenades2.kill();
    explosions.kill();
    scoreTextP1.kill();
    scoreTextP2.kill();
    gravityBall.kill();
}

function stateTextOutput() {
    stateText.cameraOffset.x = game.camera.width * 0.5;
    stateText.cameraOffset.y = game.camera.height * 0.5;

    if (scoreP1 > scoreP2) {
        stateText.text = ` GAME OVER \n Player 1 WIN's! \n Click 'Enter' to restart`;
        stateText.visible = true;
    }
    if (scoreP2 > scoreP1) {
        stateText.text = ` GAME OVER \n Player 2 WIN's! \n Click 'Enter' to restart`;
        stateText.visible = true;
    }
    if (scoreP2 === scoreP1) {
        stateText.text = ` GAME OVER \n It's a draw \n Click 'Enter' to restart`;
        stateText.visible = true;
    }
    lockRestart = false;
}
