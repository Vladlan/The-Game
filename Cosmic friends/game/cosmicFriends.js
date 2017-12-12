let game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example',
{
    preload: preload, create: create, update: update, render: render
});

function preload() {
    game.time.advancedTiming = true;

    game.load.tilemap('level1', 'assets/level1.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles-1', 'assets/tiles-1.png');
    game.load.image('background2', 'assets/level1.png');


    // game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
    // game.load.spritesheet('dude2', 'assets/dude2.png', 24, 26);

    game.load.spritesheet('dude', 'assets/Player1.png', 30, 41);
    game.load.spritesheet('dude2', 'assets/Player2.png', 30, 41);

    game.load.image('grenades1', 'assets/enemy-bullet1.png');
    game.load.image('grenades2', 'assets/enemy-bullet2.png');

    game.load.spritesheet('droid', 'assets/droid.png', 32, 32);
    game.load.image('starSmall', 'assets/star.png');
    game.load.image('starBig', 'assets/star2.png');

    game.load.image('background', 'assets/background2.png');

    game.load.spritesheet('kaboom', 'assets/explode.png', 128, 128);
};

let map;
let tileset;
let layer;
let player1;
let player2;
let facingP1 = 'left';
let facingP2 = 'left';

let jumpTimer = 0;
let cursors;
let bg;
let controls = {};
let playerSpeed = 250;
let jumpSpeed = 450;
let k = 0;
let scoreP1 = 0;
let scoreStringP1;
let scoreTextP1;
let scoreP2 = 0;
let scoreStringP2;
let scoreTextP2;
let grenades;
let grenade1Time = 0;
let grenadeSpeedP2 = 800;
let grenadeSpeedP1 = 800;
let grenadeSpeed = 800;
let explosions;
let clicks = 0;
let stack = [];
let worldScale = 1;
let counter = 0;
let stateText;
let allottedTime = 120;
let lockRestart = true;
let stateTextFontSize = 44;
let timeString = 'Time:';
let timeText;
let timeTextFontSize = 18;

Phaser.Point.prototype.toString = function() {
    return 'x=' + this.x.toFixed(2) + ' y=' + this.y.toFixed(2);
};
let gameSize, newSize, zoom;
let KEY_ZOOM_OUT = Phaser.KeyCode.OPEN_BRACKET;   // [
let KEY_ZOOM_IN = Phaser.KeyCode.CLOSED_BRACKET; // ]
let ZOOM_DELTA = 0.1;


function create() {

    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.stage.backgroundColor = '#000000';

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

    let grid = game.add.image(0, 0, 'background2');
    grid.alpha = 1;

//show borders of layer in game
    // layer.debug = true;


    game.physics.arcade.gravity.y = 750;

    //PLAYER1
    player1 = game.add.sprite(game.camera.width * Math.random(),
    game.camera.height * Math.random(), 'dude');
    game.physics.enable(player1, Phaser.Physics.ARCADE);

    //The time string
    timeText = game.add.text(game.camera.width * 0.5, game.camera.height * 0.2, timeString,
        {font: '18px Orbitron', fill: '#fff', align: 'center'});
    timeText.anchor.setTo(0.5, 0.5);
    timeText.fixedToCamera = true;
    timeText.inputEnabled = true;
    timeText.input.enableDrag();

    //  The score player1
    scoreStringP1 = 'Score (player 1) : ';

    scoreTextP1 = game.add.text(game.width - 180, 10, scoreP1, {font: '14px Orbitron', fill: '#fff'});

    // player1.body.bounce.y = 0.2;
    player1.body.collideWorldBounds = true;
    // player1.body.setSize(24, 38, 4, 10);
    player1.body.setSize(25, 41, 1, 0);

    // player1.animations.add('left', [0, 1, 2, 3], 10, true);
    // player1.animations.add('turn', [4], 20, true);
    // player1.animations.add('right', [5, 6, 7, 8], 10, true);

    player1.animations.add('left', [35, 34, 33, 32, 31, 30], 15, true);
    player1.animations.add('turn', [7, 8], 15, true);
    player1.animations.add('right', [0, 1, 2, 3, 4, 5], 15, true);
    player1.animations.add('jumpRight', [16, 17], 8, true);
    player1.animations.add('jumpLeft', [19,18], 8, true);
    player1.animations.add('throwRight', [9, 10, 11, 12], 45, true);
    player1.animations.add('throwLeft', [26,25,24,23], 45, true);
    player1.animations.add('idleLeft', [21], 8, true);
    player1.animations.add('idleRight', [14], 8, true);

    // game.camera.follow(player1);



    //PLAYER2
    player2 = game.add.sprite(game.camera.width * Math.random(),
    game.camera.height * Math.random(), 'dude2');
    game.physics.enable(player2, Phaser.Physics.ARCADE);

    //  The score player2
    scoreStringP2 = 'Score (player 2) : ';
    // scoreTextP2 = game.add.text(game.width - 180, 10, scoreStringP2 + scoreP2, {font: '12px Simplex', fill: '#fff'});
    scoreTextP2 = game.add.text(game.width - 180, 10, scoreP2, {font: '14px Orbitron', fill: '#fff'});
    // scoreTextP2.fixedToCamera = true;

    // player2.body.bounce.y = 0.2;
    player2.body.collideWorldBounds = true;
    // player2.body.setSize(24, 26, 0, 0);
    player2.body.setSize(25, 41, 1, 0);
    //
    // player2.animations.add('idle', [0, 1], 1, true);
    // player2.animations.add('jump', [2], 7, true);
    // player2.animations.add('run', [3, 4, 5, 6, 7, 8], 7, true);

    player2.animations.add('left', [35, 34, 33, 32, 31, 30], 15, true);
    player2.animations.add('turn', [7, 8], 15, true);
    player2.animations.add('right', [0, 1, 2, 3, 4, 5], 15, true);
    player2.animations.add('jumpRight', [16, 17], 8, true);
    player2.animations.add('jumpLeft', [19,18], 8, true);
    player2.animations.add('throwRight', [9, 10, 11, 12], 45, true);
    player2.animations.add('throwLeft', [26,25,24,23], 45, true);
    player2.animations.add('idleLeft', [21], 8, true);
    player2.animations.add('idleRight', [14], 8, true);

    controls = {
        right: this.input.keyboard.addKey(Phaser.Keyboard.D),
        left: this.input.keyboard.addKey(Phaser.Keyboard.A),
        up: this.input.keyboard.addKey(Phaser.Keyboard.W),
        down: this.input.keyboard.addKey(Phaser.Keyboard.S),
    };

    cursors = game.input.keyboard.createCursorKeys();
    fireButtonP1 = game.input.keyboard.addKey(Phaser.Keyboard.ZERO);
    fireButtonP2 = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    //--------------------------------------------------
    let keyboard = game.input.keyboard;
    zoom = new Phaser.Point(1, 1);
    // We'll apply `zoom` to the original game size
    gameSize = Object.freeze(new Phaser.Point(game.width, game.height));
    // and store the result in `newSize`
    newSize = gameSize.clone();
    keyboard.addKey(KEY_ZOOM_OUT).onUp.add(zoomOut);
    keyboard.addKey(KEY_ZOOM_IN).onUp.add(zoomIn);


    stateText = game.add.text(game.camera.view.x + game.camera.width * 0.5, game.camera.view.y + game.camera.height * 0.5, ' ',
        {font: '44px Orbitron', fill: '#fff', align: 'center'});
    stateText.anchor.setTo(0.5, 0.5);
    stateText.visible = false;
    stateText.fixedToCamera = true;
    stateText.inputEnabled = true;

    stateText.input.enableDrag();
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


function ThrowGrenade() {
    this.grenadeTime = 0;
    this.stack = [];
    this.clicks = 0;

    this.init = function(player, grenadeSpeedInput) {
        //  To avoid them being allowed to fire too fast we set a time limit
        if (game.time.now > this.grenadeTime) {

            //to avoid overPush of stack
            if (this.stack.length > 10) {
                this.stack = [];
                this.clicks = 0;
            }
            //Grab the first bullet we can from the pool
            if (player.key === 'dude') {
                this.stack.push(grenades1.getFirstExists(false));
            }
            if (player.key === 'dude2') {
                this.stack.push(grenades2.getFirstExists(false));
            }
            if (this.stack[this.clicks]) {
                //  And fire it
                this.stack[this.clicks].reset(player.x + 14, player.y + 20 );
                if (player.key === 'dude') {
                    this.stack[this.clicks].reset(player.x + 14, player.y + 20);
                }
                this.stack[this.clicks].body.velocity.y = -10;
                this.stack[this.clicks].body.velocity.x = grenadeSpeedInput;
                //this for avoid gun of grenades1
                this.grenadeTime = game.time.now + 500;
                this.stack[this.clicks].body.onCollide = epl(this.clicks, this.stack);

//TODO: Уточнить полностью работы данной функции
function epl(clicks, stack) {
    var i = clicks;
    let timerId = setInterval(function() {
        if (stack[i].body.onFloor()) {
            let explosion = explosions.getFirstExists(false);
            explosion.reset(stack[i].body.x, stack[i].body.y);
            explosion.play('kaboom', 30, false, true);
            stack[i].kill();

            clearInterval(timerId);
        }
    }, 20);
    setTimeout(function() {
        clearInterval(timerId);
    }, 2000);
}
}
this.clicks++;
}
}
};
let throwGrenadeP1 = new ThrowGrenade();
let throwGrenadeP2 = new ThrowGrenade();


//collision of grenades and player
function collisionHandler(player1, grenade1) {
    //  When a bullet hits an alien we kill them both
    grenade1.kill();
    player1.kill();

    //  Increase the score
    // console.log(player1.key);
    if (player1.key === 'dude') {
        scoreP2 += 1;
        // scoreTextP2.text = scoreStringP2 + scoreP2;
        scoreTextP2.text = scoreP2;
    }
    if (player1.key === 'dude2') {
        scoreP1 += 1;
        // scoreTextP1.text = scoreStringP1 + scoreP1;
        scoreTextP1.text = scoreP1;
    }

    //  And create an explosion :)
    let explosion = explosions.getFirstExists(false);
    explosion.reset(player1.body.x, player1.body.y);
    explosion.play('kaboom', 30, false, true);
    player1.reset(game.camera.width * Math.random(), game.camera.height * Math.random());
};

function update() {
    //For player 1d
    game.physics.arcade.collide(player1, layer);
    player1.body.velocity.x = 0;
    game.physics.arcade.collide(player1, player2);
    game.physics.arcade.collide(grenades1, layer);
    game.physics.arcade.collide(grenades2, layer);


        //MOVEMENT LOGIC PLAYER 1--------------------------------------------------------------
        if (cursors.left.isDown ) {
            facingP1 = 'left';
            player1.body.velocity.x = -playerSpeed;
            grenadeSpeedP1 = -grenadeSpeed + player1.body.velocity.x;
        //Место для перекидки камеры по оси Х влево:
        moveCameraLeft(player1, player2);
        if (player1.body.onFloor()) {
            player1.animations.play('left');
        }
        else {
            player1.animations.play('jumpLeft');
        }
    }
    else if (cursors.right.isDown ) {
        facingP1 = 'right';
        player1.body.velocity.x = playerSpeed;
        grenadeSpeedP1 = grenadeSpeed + player1.body.velocity.x;
        //Место для перекидки камеры по Х вправо:
        moveCameraRight(player1, player2);
        if (player1.body.onFloor()) {
            player1.animations.play('right');
        }
        else {
            player1.animations.play('jumpRight');
        }
    }
    else if (cursors.up.isDown && player1.body.onFloor() && facingP1==='right') {
        player1.body.velocity.y = -jumpSpeed;
        if (player1.body.onFloor()) {
            player1.animations.play('jumpRight');
        }
    }
    else if (cursors.up.isDown && player1.body.onFloor() && facingP1==='left') {
        player1.body.velocity.y = -jumpSpeed;
        if (player1.body.onFloor()) {
            player1.animations.play('jumpLeft');
        }
    }
    else if (cursors.down.isDown && !player1.body.onFloor() && facingP1==='right') {
        player1.body.velocity.y = jumpSpeed;
        if (!player1.body.onFloor()) {
            player1.animations.play('jumpRight');
        }
    }
    else if (cursors.down.isDown && !player1.body.onFloor() && facingP1==='left') {
        player1.body.velocity.y = jumpSpeed;
        if (!player1.body.onFloor()) {
            player1.animations.play('jumpLeft');
        }
    }
    else if (fireButtonP1.isDown && facingP1==='right') {
        player1.animations.play('throwRight');
        throwGrenadeP1.init(player1, grenadeSpeedP1);
    }
    else if (fireButtonP1.isDown && facingP1==='left') {
        player1.animations.play('throwLeft');
        throwGrenadeP1.init(player1, grenadeSpeedP1);
    }
    else {
        // player1.animations.stop();
        if (facingP1 === 'left') {
            player1.animations.play('idleLeft');
        }
        if (facingP1 === 'right') {
            player1.animations.play('idleRight');
        }
    }
    //MOVEMENT LOGIC PLAYER 1--------------------------------------------------------------

    //Место для перекидки камеры по оси Y вниз:
    moveCameraDown(player1, player2);
    //Место для перекидки камеры по оси Y вверх:
    moveCameraTop(player1, player2);

    //For PLAYER 2
    game.physics.arcade.collide(player2, layer);

    player2.body.velocity.x = 0;

//MOVEMENT LOGIC PLAYER 2--------------------------------------------------------------
        if (controls.left.isDown ) {
            //Место для перекидки камеры по оси Х влево:
        moveCameraLeft(player2, player1);
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
    else if (controls.right.isDown ) {
        //Место для перекидки камеры по Х вправо:
        moveCameraRight(player2, player1);
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
    else if (controls.up.isDown && player2.body.onFloor() && facingP2==='right') {
        player2.body.velocity.y = -jumpSpeed;
        if (player2.body.onFloor()) {
            player2.animations.play('jumpRight');
        }
    }
    else if (controls.up.isDown && player2.body.onFloor() && facingP2==='left') {
        player2.body.velocity.y = -jumpSpeed;
        if (player2.body.onFloor()) {
            player2.animations.play('jumpLeft');
        }
    }
    else if (controls.down.isDown && !player2.body.onFloor() && facingP2==='right') {
        player2.body.velocity.y = jumpSpeed;
        if (!player2.body.onFloor()) {
            player2.animations.play('jumpRight');
        }
    }
    else if (controls.down.isDown && !player2.body.onFloor() && facingP2==='left') {
        player2.body.velocity.y = jumpSpeed;
        if (!player2.body.onFloor()) {
            player2.animations.play('jumpLeft');
        }
    }
    else if (fireButtonP2.isDown && facingP2==='right') {
        player2.animations.play('throwRight');
        throwGrenadeP2.init(player2, grenadeSpeedP2);
    }
    else if (fireButtonP2.isDown && facingP2==='left') {
        player2.animations.play('throwLeft');
        throwGrenadeP2.init(player2, grenadeSpeedP2);
    }
    else {
        // player2.animations.stop();
        if (facingP2 === 'left') {
            player2.animations.play('idleLeft');
        }
        if (facingP2 === 'right') {
            player2.animations.play('idleRight');
        }
    }   
    //MOVEMENT LOGIC PLAYER 2--------------------------------------------------------------

    moveCameraTop(player2, player1);
    moveCameraDown(player2, player1);
    //  Run collision
    game.physics.arcade.overlap(grenades2, player1, collisionHandler, null, this);
    game.physics.arcade.overlap(grenades1, player2, collisionHandler, null, this);

    //Whe players are close to each other on Y zoom camera in
    if ((Math.abs(player1.position.y - player2.position.y) <= game.camera.height * 0.33) &&
        (Math.abs(player1.position.x - player2.position.x) <= game.camera.width * 0.33)) {
        if (Math.floor(this.game.time.totalElapsedSeconds(), 1) % 3 === 0) {
        }
        zoomIn();
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
        restart();
        lockRestart = true;
        stateText.visible = false;
        // game.remove(stateText);
    }

    if (game.input.keyboard.isDown(Phaser.Keyboard.BACKSPACE)) {
        stateText.position.x = stateText.position.x + 25;
        stateText.world.x = stateText.world.x + 25;
        // stateText.position.y = game.camera.view.y + game.camera.width*0.5;   
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
    }
}

function zoomOut() {
    if (counter < 3) {
        counter++;
        zoomBy(-ZOOM_DELTA * 0.73, -ZOOM_DELTA);
        //zooming our state text:
        stateText.fontSize = stateTextFontSize * (1 + ZOOM_DELTA);
        timeText.fontSize = timeTextFontSize * (1 + ZOOM_DELTA);
    }
}

function zoomTo(x, y) {
    zoom.setTo(x, y);
    updateDimensions();
}

function restart() {
    //  A new level starts
    //revives the player
    player1.revive();
    player2.revive();
    grenades1.revive();
    grenades2.revive();
    explosions.revive();
    scoreP1 = 0;
    scoreP2 = 0;
    scoreTextP1.text = scoreP1;
    scoreTextP2.text = scoreP2;

    scoreTextP1.revive();
    scoreTextP2.revive();
    this.game.time.reset();

    //hides the text
    stateText.visible = false;
};

function killWhatNeed() {
    player1.kill();
    player2.kill();
    grenades1.kill();
    grenades2.kill();
    explosions.kill();
    scoreTextP1.kill();
    scoreTextP2.kill();
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