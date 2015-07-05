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

	this.facingLeft = false;
	this.onGround = false;
	this.pointerRot = 0;
	this.maxVol = 0.55;
	this.lastTimeHit = 0;
};

GameControl.InGame.prototype = {
	create: function() {
		// GENERAL settings
		this.TILE_WIDTH = 32;
		this.TILE_HEIGHT = 32;

		this.GRAVITY = 1200;
		this.JUMP_SPEED = -500;
		this.MAX_SPEED = 300;
		this.ACCELERATION = 1500;
		this.DRAG = 1400;

		this.THROW_DELAY = 700;
		this.MOLOTOV_SPEED = 800;
		this.NUMBER_OF_MOLOTOVS = 5;

		this.HIT_DELAY = 700;

		this.stage.backgroundColor = '#2e2d2d';
		this.game.input.keyboard.addKeyCapture([Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT, Phaser.Keyboard.UP, Phaser.Keyboard.DOWN]);
		this.time.advancedTiming = true;
		//this.game.physics.arcade.gravity.y = this.GRAVITY;

		// MAP settings - BACKGROUND
    	this.map = this.add.tilemap('map');
		this.map.addTilesetImage('spritesheet');
		this.lBackground = this.map.createLayer('background');

		// PLAYER settings
		this.player = this.game.add.sprite(0, 390, 'player');
		this.player.anchor.setTo(0.5, 0.5);
		this.player.smoothed = false;
		this.player.health = 100;

		this.game.physics.enable(this.player, Phaser.Physics.ARCADE);
		this.player.body.collideWorldBounds = true;
		this.player.body.gravity.y = this.GRAVITY;
		this.player.body.allowRotation = false;
		this.player.body.maxVelocity.setTo(this.MAX_SPEED, this.MAX_SPEED * 10);
		this.player.body.drag.setTo(this.DRAG, 0);
		this.player.body.setSize(25, 50, 0, 5);

    	this.camera.follow(this.player, Phaser.Camera.FOLLOW_PLATFORMER);

    	// MOLOTOV settings
    	this.molotovPool = this.game.add.group();
    	for(var i = 0; i < this.NUMBER_OF_MOLOTOVS; ++i) {
    		var molotov = this.game.add.sprite(0, 0, 'spritesheet', 20);
    		this.molotovPool.add(molotov);
    		molotov.animations.add('flames', [20, 21, 22], 5, true);
    		molotov.anchor.setTo(0.5, 0.5);
    		this.game.physics.enable(molotov, Phaser.Physics.ARCADE);
    		molotov.body.gravity.y = this.GRAVITY;
    		molotov.kill();
    	}

    	this.molotov_itens = this.game.add.group();
    	this.molotov_itens.enableBody = true;

    	this.map.createFromObjects('obj', 21, 'spritesheet', 20, true, false, this.molotov_itens);
    	this.molotov_itens.forEach(function(molotov) {
    		molotov.animations.add('flames', [20, 21, 22], 5, true);
    		molotov.animations.play('flames');
    	}, this);

    	// MAP settings - COLLISION/FOREGROUND
		this.lCollision = this.map.createLayer('collision');
		//this.lForeground = this.map.createLayer('foreground');

		this.lCollision.resizeWorld();
		this.map.setCollisionBetween(0, 100, true, this.lCollision, true);

		// FIRE settings
		this.fires = this.game.add.group();
		for(var i = 0; i < 100; ++i) {
			var fire = this.add.emitter(0, 0, 50);
			this.fires.add(fire);
			fire.makeParticles('spritesheet', [23, 24, 25, 26]);
			fire.lifespan = 500;
			fire.setRotation(0, 100);
			fire.setScale(0.7, 0.95, 0.7, 0.95, 500);
			fire.maxParticleSpeed = new Phaser.Point(100, 0);
			fire.kill();
		}

		// SOUND settings
		this.main_song = this.add.audio('barricadas', 0.25, true);
		this.glass_break = this.add.audio('glass-break', 0.6, false);
		this.fire_loop = this.add.audio('fire-loop', 0.0, true);

		this.main_song.play();
		this.fire_loop.play();

		// GUI settings
		this.molotovIcon = this.game.add.sprite(this.game.width - 90, 8, 'spritesheet', 20);
    	this.molotovIcon.animations.add('flames', [20, 21, 22], 5, true);
    	this.molotovIcon.fixedToCamera = true;
    	this.molotovIcon.animations.play('flames');

	},

	update: function() {
		this.update_player();
		this.update_molotovs();
		this.update_fires();
	},

	render: function() {
		// Debug FPS
	  	//this.game.debug.text(this.game.time.fps + " FPS" || '--', 2, 14, "#ffffff");
	  	this.game.debug.text("HEALTH: " + this.player.health, 10, 30, "#ffffff");
	  	this.game.debug.text("x " + this.NUMBER_OF_MOLOTOVS, this.game.width - 50, 30, "#ffffff");
	},

	update_player: function() {
		this.physics.arcade.collide(this.player, this.lCollision); // Make the player collide with the collision layer
		this.physics.arcade.overlap(this.player, this.molotov_itens, this.collectMolotov, null, this); // Collect molotovs

		// If player dies
		if(this.player.health == 0) {
			this.fire_loop.stop();
			this.main_song.stop();
			this.state.start("MainMenu");
		}

		if(this.player.body.blocked.down) this.onGround = true;
		else this.onGround = false;

		// Jump
		if(this.onGround && (this.input.keyboard.downDuration(Phaser.Keyboard.W, 10) || this.input.keyboard.downDuration(Phaser.Keyboard.UP, 10))) {
			this.player.body.velocity.y = this.JUMP_SPEED;
		}

		// Left/Right movement
		if(this.input.keyboard.isDown(Phaser.Keyboard.A) || this.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
			this.player.body.acceleration.x = -this.ACCELERATION;
			if(this.facingLeft == false) this.facingLeft = true;
		}
		else if(this.input.keyboard.isDown(Phaser.Keyboard.D) || this.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
			this.player.body.acceleration.x = this.ACCELERATION;
			if(this.facingLeft == true) this.facingLeft = false;
		}
		else {
			this.player.body.acceleration.x = 0;
		}

		// Sprite transform
		if(this.facingLeft == true) this.player.scale.x = -1;
		else this.player.scale.x = 1
	},

	update_molotovs: function() {
		this.physics.arcade.collide(this.molotovPool, this.lCollision, function(molotov) {
			var hit_sin = Math.sin(molotov.rotation);
			var hit_cos = Math.cos(molotov.rotation);
			var tiles_in_fire = Math.ceil((Math.abs(hit_cos)*52 - 27)/3.5);
			var tile_hitX = this.lCollision.getTileX(molotov.x);
			var tile_hitY = this.lCollision.getTileY(molotov.y);

			// Play glass breaking sound - the nearer, the louder.
			var current_tile = Math.abs(this.player.x)/this.TILE_WIDTH;
			this.glass_break.volume = 1/(Math.abs(Math.abs(tile_hitX) - current_tile) + 1) + 0.1;
			this.glass_break.play();

			if(hit_cos >= 0) {
				for(var i = tile_hitX; i <= tile_hitX + tiles_in_fire && i < this.world.width/this.TILE_WIDTH; i++) {
					var tile = this.map.getTile(i, tile_hitY, 'collision', true);
					if(tile.index != -1) break; // If it's not an empty tile, break.
					if(tile_hitY + 1 > this.world.height/this.TILE_HEIGHT) break;

					tile = this.map.getTile(i, tile_hitY + 1, 'collision', true);
					while(tile.index == -1) {
						tile_hitY++;
						tile = this.map.getTile(i, tile_hitY + 1, 'collision', true);
					}
					this.getFire(i*this.TILE_WIDTH, tile_hitY*this.TILE_HEIGHT, hit_sin);
					hit_sin *= 1.45;
				}
			}
			else {
				for(var i = tile_hitX; i >= tile_hitX - tiles_in_fire && i > 0; i--) {
					var tile = this.map.getTile(i, tile_hitY, 'collision', true);
					if(tile.index != -1) break; // If it's not an empty tile, break.
					if(tile_hitY + 1 > this.world.height/this.TILE_HEIGHT) break;

					tile = this.map.getTile(i, tile_hitY + 1, 'collision', true);
					while(tile.index == -1) {
						tile_hitY++;
						tile = this.map.getTile(i, tile_hitY + 1, 'collision', true);
					}

					this.getFire(i*this.TILE_WIDTH, tile_hitY*this.TILE_HEIGHT, hit_sin);
					hit_sin *= 1.45;
				}
			}

			// Kill the molotov that reached the ground and turn its emitter off.
			molotov.fire_emitter.on = false;
			molotov.kill();

		}, null, this);

		// Gets the angle from the player to the pointer. Used to calculate molotov trajectory.
		this.pointerRot = this.game.physics.arcade.angleToPointer(this.player);
		
		this.molotovPool.forEachAlive(function(molotov) {
			if(Math.cos(molotov.iniRot) >= 0) molotov.rotation = Math.atan2(molotov.body.velocity.y, molotov.body.velocity.x + 600);
			else molotov.rotation = Math.atan2(molotov.body.velocity.y, molotov.body.velocity.x - 600);
			// Update the position of the fire emitter on each step and emit a particle 
			molotov.fire_emitter.x = molotov.x;
			molotov.fire_emitter.y = molotov.y;
			molotov.fire_emitter.emitParticle();
		}, this);

		// Throw molotov
		if(this.NUMBER_OF_MOLOTOVS > 0 && this.game.input.activePointer.isDown) {
			this.throwMolotov();
		}
	},

	update_fires: function() {
		var dst_fire = 100000;
		this.fires.forEachAlive(function(fire) {
			if(Math.sqrt(Math.pow(this.player.x - fire.x, 2) + Math.pow(this.player.y - fire.y, 2)) < dst_fire) {
			 	dst_fire = Math.sqrt(Math.pow(this.player.x - fire.x, 2) + Math.pow(this.player.y - fire.y, 2));
			 	this.maxVol = fire.alpha*0.7;
			 	if(this.maxVol > 0.55) this.maxVol = 0.55;
			}
			fire.emitParticle();
			if(fire.alpha < 0.05) fire.kill();
			else fire.alpha *= 0.997;
		}, this);
		if(dst_fire < 50) {
			this.fire_loop.volume = this.maxVol;

			// Player gets hit when he touches fire
			if(this.maxVol > 0.15 && this.game.time.now - this.lastTimeHit > this.HIT_DELAY && this.player.health > 0) {
				this.lastTimeHit = this.game.time.now;
				this.player.health -= 10;
			}
		}
		else if(dst_fire < 900) {
		 	this.fire_loop.volume = Math.pow(250/dst_fire, 2);
		 	if(this.fire_loop.volume > this.maxVol) this.fire_loop.volume = this.maxVol;
		}
		else this.fire_loop.volume = 0;
	},

	throwMolotov: function() {
		if(this.lastMolotovShotAt == undefined) this.lastMolotovShotAt = 0;
		if(this.game.time.now - this.lastMolotovShotAt < this.THROW_DELAY) return;
    	this.lastMolotovShotAt = this.game.time.now;

    	var molotov = this.molotovPool.getFirstDead();

    	if(molotov == null || molotov == undefined) return;
    	molotov.revive();
    	molotov.checkWorldBounds = true;
    	molotov.outOfBoundsKill = true;

    	molotov.reset(this.player.x, this.player.y - 30);
    	molotov.iniRot = this.pointerRot;
    	molotov.body.velocity.x = Math.cos(molotov.iniRot) * this.MOLOTOV_SPEED;
    	molotov.body.velocity.y = Math.sin(molotov.iniRot) * this.MOLOTOV_SPEED;
    	this.NUMBER_OF_MOLOTOVS--;

    	// Create a particle emitter for the molotov
	    molotov.fire_emitter = this.add.emitter(molotov.x, molotov.y, 70);
	    molotov.fire_emitter.makeParticles('spritesheet', [23, 24, 25, 26]);
	    molotov.fire_emitter.lifespan = 500;
	    molotov.fire_emitter.setAlpha(0.9, 0.0, 700);
	    molotov.fire_emitter.setScale(1.0, 0.2, 1.0, 0.2, 1000);
	    molotov.fire_emitter.setRotation(0, 100);
	    molotov.fire_emitter.maxParticleSpeed = new Phaser.Point(-80,40);
  		molotov.fire_emitter.minParticleSpeed = new Phaser.Point(-190,-40);

  		molotov.animations.play('flames');
	},

	collectMolotov: function(player, molotov) {
		this.NUMBER_OF_MOLOTOVS++;
		molotov.kill();	
	},

	getFire: function(x, y, size) {
  		var fire = this.fires.getFirstDead();
  		if(fire == null || fire == undefined) return;
  		fire.revive();
  		fire.x = x;
		fire.y = y + 20;
  		fire.checkWorldBounds = true;
		fire.outOfBoundsKill = true;
		fire.alpha = 1.0;
		fire.setAlpha(0.9, 0.0, 1000);
		fire.maxParticleSpeed = new Phaser.Point(100, 0);
  		fire.minParticleSpeed = new Phaser.Point(-100, -220*Math.abs(size) - 100);
	}
};
