var game = new Phaser.Game(800, 600, Phaser.AUTO, 'm-game', { preload: preload, create: create, update: update });

function preload()
{
	game.load.spritesheet('huasteca', 'img/spritesheet2.png', 23, 51, 26);
	game.load.tilemap('woods', 'maps/woods6.json', null, Phaser.Tilemap.TILED_JSON);
	game.load.image('tileset', 'img/tiles2x.png');
	game.load.audio('lapartida', ['music/lapartida.mp3']);
}

var player;
var player_scale = 2;
var cursors;
var facingLeft = false;

var map;
var layer;

var music;

var isFalling;

function create()
{
	game.stage.backgroundColor = '#576f4b';

	game.physics.startSystem(Phaser.Physics.ARCADE);

	// Map
	map = game.add.tilemap('woods');
	map.addTilesetImage('woodstiles', 'tileset');
	layer = map.createLayer('world1');
	layer.resizeWorld();
	map.setCollisionBetween(0, 100);
	//layer.debug = true;

	// Player
	player = game.add.sprite(100, 1900, 'huasteca');
	player.anchor.setTo(.5, 1);
	player.scale.x = player_scale;
	player.scale.y = player_scale;
	player.smoothed = false;

	game.physics.arcade.enable(player);
	player.body.gravity.y = 1000;
	player.body.collideWorldBounds = false;
	player.animations.add('idle', [0,1,2,3,4,5], 5, true);
	player.animations.add('walk', [8,9,10,11,12,13,14,15], 8, true);
	player.animations.add('jump', [16,17,18,19,20], 10, false);
	player.animations.add('falling', [21,22,23], 8, true);
	player.animations.add('landing', [24,25], 5, false);

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

function update()
{
	cursors = game.input.keyboard.createCursorKeys();
	game.physics.arcade.collide(player, layer);

	if (player.body.velocity.y > 0)
	{
		isFalling = true;
		if (player.body.velocity.y > 350)
		{
			player.animations.play('falling');
		}
	}

	player.body.velocity.x = 0;
	if (cursors.left.isDown)
	{
		facingLeft = true;
		player.body.velocity.x = -250;

		if (player.body.blocked.down)
		{
			player.animations.play('walk');
		}
	}
	else if (isFalling === true && player.body.velocity.y <= 0)
	{
		player.animations.play('landing');
		isFalling = false;
	}
	else if (cursors.right.isDown)
	{
		facingLeft = false;
		player.body.velocity.x = 250;

		if (player.body.blocked.down)
		{
			player.animations.play('walk');
		}
	}
	else if (player.body.blocked.down)
	{
		player.animations.play('idle');
	}

	if (cursors.up.isDown && player.body.blocked.down)
	{
		player.body.velocity.y = -600;
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
}
