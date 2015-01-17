var game = new Phaser.Game(640, 480, Phaser.AUTO, 'm-game', { preload: preload, create: create, update: update });

function preload()
{
	game.load.spritesheet('huasteca', 'img/h_walk_jump.png', 23, 51, 23);
	game.load.tilemap('woods', 'maps/woods.json', null, Phaser.Tilemap.TILED_JSON);
	game.load.image('tileset', 'img/terrain.png');
	game.load.audio('lapartida', ['music/lapartida.mp3']);
}

var player;
var player_scale = 2;
var cursors;
var facingLeft = false;

var map;
var layer1;
var layer2;

var music;

var grounded;

// Score
var score = 0;
var scoreString;
var scoreText;

function create()
{
	game.stage.backgroundColor = '#606756';

	game.physics.startSystem(Phaser.Physics.ARCADE);

	// Map
	map = game.add.tilemap('woods');
	map.addTilesetImage('wood_tiles', 'tileset');
	layer1 = map.createLayer('bgtrees_layer');
	layer2 = map.createLayer('collide_layer');
	layer2.resizeWorld();
	map.setCollisionBetween(0, 100, true, layer2, true);
	//layer.debug = true;

	// Player
	player = game.add.sprite(100, 690, 'huasteca');
	player.anchor.setTo(.5, 1);
	player.scale.x = player_scale;
	player.scale.y = player_scale;
	player.smoothed = false;

	game.physics.arcade.enable(player);
	player.body.gravity.y = 1000;
	player.body.collideWorldBounds = false;
	player.animations.add('idle', [0,1,2,3,4,5], 5, true);
	player.animations.add('walk', [8,9,10,11,12,13,14,15], 8, true);
	player.animations.add('jump', [16,17,18,19,20,21,22,20], 8, false);
	player.animations.add('falling', [20,21,22], 8, true);

	// Camera
	game.camera.follow(player, Phaser.Camera.FOLLOW_PLATFORMER);

	// Music
	music = game.add.audio('lapartida', 1, true);
	music.onDecoded.add(startMusic, this);
}

function startMusic()
{
	music.fadeIn(4000, true);
}
var lanim;
function update()
{	
	cursors = game.input.keyboard.createCursorKeys();
	game.physics.arcade.collide(layer2, player);
	player.body.velocity.x = 0;

	if (player.body.blocked.down)
	{
		grounded = true;
	}
	else
	{
		grounded = false;
	}

	if (player.body.velocity.y > 0)
	{
		if (player.body.velocity.y > 340)
		{
			player.animations.play('falling');
		}
	}

	player.body.velocity.x = 0;
	if (cursors.left.isDown)
	{
		facingLeft = true;
		player.body.velocity.x = -250;

		if (grounded)
		{
			player.animations.play('walk');
		}
	}
	else if (cursors.right.isDown)
	{
		facingLeft = false;
		player.body.velocity.x = 250;

		if (grounded)
		{
			player.animations.play('walk');
		}
	}
	else if (grounded)
	{
		player.animations.play('idle');
	}

	if (grounded && cursors.up.isDown)
	{
		player.body.velocity.y = -530;
		player.animations.play('jump');
	}

	if (facingLeft === true)
	{
		player.scale.x = -player_scale;
	}
	else
	{
		player.scale.x = player_scale;
	}

	// Debug FPS
  	game.time.advancedTiming = true;
  	game.debug.text('FPS: ' + this.game.time.fps || '--', 2, 14, "#ffffff");

}

function collectPoints(player, obj)
{
	obj.kill();
	score += 1;
	scoreText = 'Puntos: ' + score;
}


