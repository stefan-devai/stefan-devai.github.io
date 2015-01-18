GameControl.InGame = function(game) {
	this.game;
	this.add;
	this.camera;
	this.cache;
	this.input;
	this.load;
	this.math;
	this.sound;
	this.stage;
	this.time;
	this.tweens;
	this.state;
	this.world;
	this.particles;
	this.physics;
	this.rnd;
};

// Variables
	var player;
	var player_scale = 2;
	var facingLeft = false;
	var map;
	var layer1;
	var layer2;
	var layer3;
	var layer4;
	var music;
	var grounded;

GameControl.InGame.prototype = {
	create: function() {

		this.stage.backgroundColor = '#606756';
		this.physics.startSystem(Phaser.Physics.ARCADE);

		this.time.advancedTiming = true;

		// Map
		map = this.add.tilemap('woods');
		map.addTilesetImage('wood_tiles', 'tileset');
		layer1 = map.createLayer('bgtrees_layer');
		layer4 = map.createLayer('polygon_layer');

		// Player
		player = this.add.sprite(100, 690, 'insurgente');
		player.anchor.setTo(.5, 1);
		player.scale.x = player_scale;
		player.scale.y = player_scale;
		player.smoothed = false;

		this.physics.arcade.enable(player);
		player.body.gravity.y = 1000;
		player.body.collideWorldBounds = true;
		player.animations.add('idle', [0,1,2,3,4,5], 5, true);
		player.animations.add('walk', [8,9,10,11,12,13,14,15], 8, true);
		player.animations.add('jump', [16,17,18,19,20,21,22,20], 8, false);
		player.animations.add('falling', [20,21,22], 8, true);

		// Camera
		this.camera.follow(player, Phaser.Camera.FOLLOW_PLATFORMER);

		// Music
		music = this.add.audio('sunshine', 1, true);
		music.onDecoded.add(startMusic, this);

		//Cursors
		cursors = this.input.keyboard.createCursorKeys();

		// Front Layers
		layer2 = map.createLayer('collide_layer');
		layer2.resizeWorld();
		map.setCollisionBetween(0, 100, true, layer2, true);
		//layer.debug = true;
		layer3 = map.createLayer('frente_layer');

		for (var i = 0; i < map.width; i++)
		{
			for (var j = 0; j < map.height; j++)
			{
				var m_tile = map.getTile(i, j, 'collide_layer', true);
				if (m_tile.index === 34 || m_tile.index === 35)
				{
					m_tile.setCollision(false, false, true, false);
				}
				else if (m_tile.index != -1)
				{
					m_tile.setCollision(true, true, true, true);
				}
			}
		}
	},

	update: function() {
		this.physics.arcade.collide(layer2, player);
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

	},

	render: function() {
		// Debug FPS
	  	this.game.debug.text(this.game.time.fps + " FPS" || '--', 2, 14, "#ffffff");
	},

	quitGame: function(pointer) {
		//Borrar lo que fue loaded

		this.state.start('MainMenu');
	}
}

function startMusic()
{
	music.fadeIn(4000, true);
}
