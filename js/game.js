// create a new scene
const gameScene = new Phaser.Scene('Game');

gameScene.init = function() {
  this.playerSpeed = 3;

  this.enemyMinY = 80;
  this.enemyMaxY = 280;

  // is restarting the game?
  this.isRestarting = false;
}

// load assets
gameScene.preload = function() {
  this.load.image('background', 'assets/background.png');
  this.load.image('player', 'assets/player.png');
  this.load.image('enemy', 'assets/dragon.png');
  this.load.image('goal', 'assets/treasure.png');
}

// create sprites
gameScene.create = function() {
  const bg = this.add.sprite(0, 0, 'background');

  // change the origin to the top-left corner
  bg.setOrigin(0, 0);

  // you can achieve the same effect by setting the background position to width/2 and height/2
  const {height, width} = this.sys.game.config;
  // bg.setPosition(width/2, height/2);
  
  // print config to the console
  // console.log(this.sys.game.config);

  // create player
  this.player = this.add.sprite(50, height / 2, 'player');
  this.player.setScale(0.5); // this is equivalent to player.setScale(0.5, 0.5);

  // create goal
  this.goal = this.add.sprite(width - 80, height / 2, 'goal');
  this.goal.setScale(0.5);

  // create enemies
  this.enemies = this.add.group({
    key: 'enemy',
    repeat: 5,
    setXY: {
      x: 100,
      y: 100,
      stepX: 82,
      stepY: 20
    }
  });

  Phaser.Actions.ScaleXY(this.enemies.getChildren(), -0.4, -0.4);

  // set enemy speed and flip them
  Phaser.Actions.Call(this.enemies.getChildren(), function(enemy) {
    enemy.flipX = true;
    const dir = Math.random() < 0.5 ? 1 : -1;
    const speed = Math.random() + 2;
    enemy.speed = dir * speed;
  }, this);
  
}

gameScene.update = function() {
  // check for restart
  if (this.isRestarting) return;

  // check for active input
  if (this.input.activePointer.isDown) {
    // move player
    this.player.x += this.playerSpeed;
  }

  // check for overlap between player and goal
  const playerRect = this.player.getBounds();
  const goalRect = this.goal.getBounds();
  if (Phaser.Geom.Intersects.RectangleToRectangle(playerRect, goalRect)) {
    return this.gameOver();
  }

  // enemy movement
  Phaser.Actions.Call(this.enemies.getChildren(), function(enemy) {
    if (enemy.y <= this.enemyMinY || enemy.y >= this.enemyMaxY) {
      enemy.speed *= -1;
    }
  
    enemy.y += enemy.speed;

    // check for overlap between player and enemy
    const enemyRect = enemy.getBounds();
    if (Phaser.Geom.Intersects.RectangleToRectangle(playerRect, enemyRect)) {
      return this.gameOver();
    }
  }, this);

}

gameScene.gameOver = function() {
  this.isRestarting = true;
  // camera effects
  this.cameras.main.shake(500);
  
  this.cameras.main.on('camerashakecomplete', (camera, effect) => {
    this.cameras.main.fade(500);
  })

  this.cameras.main.on('camerafadeoutcomplete', (camera, effect) => {
    this.scene.restart();
  })
}

// set the configuration of the game
const config = {
  type: Phaser.AUTO, // Phaser will use WebGL if available, if not it will use Canvas
  width: 640,
  height: 360,
  scene: gameScene
};

// create a new game, pass the configuration
const game = new Phaser.Game(config);
