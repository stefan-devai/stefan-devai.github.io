// Good particle example: http://codepen.io/vincentscotto/pen/eAgjK

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

	this.facingLeft = false;
	this.onGround = false;
	this.pointerRot = 0;
};

GameControl.InGame.prototype = {
	create: function() {
		// GENERAL settings
		this.GRAVITY = 1200;
		this.JUMP_SPEED = -500;
		this.MAX_SPEED = 300;
		this.ACCELERATION = 1200;
		this.DRAG = 1000;

		this.THROW_DELAY = 700;
		this.MOLOTOV_SPEED = 700;
		this.NUMBER_OF_MOLOTOVS = 100;

		this.stage.backgroundColor = '#2e2d2d';
		this.game.input.keyboard.addKeyCapture([Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT, Phaser.Keyboard.UP, Phaser.Keyboard.DOWN]);
		this.time.advancedTiming = true;
		this.molotovAmmo = this.add.text(100, 100, "");

		// MAP settings - BACKGROUND
    	this.map = this.add.tilemap('map');
		this.map.addTilesetImage('spritesheet');
		this.lBackground = this.map.createLayer('background');

		// PLAYER settings
		this.player = this.game.add.sprite(256, 300, 'player');
		this.player.anchor.setTo(0.5, 1.0);
		this.player.smoothed = false;

		this.game.physics.enable(this.player, Phaser.Physics.ARCADE);
		this.player.body.collideWorldBounds = true;
		this.player.body.gravity.y = this.GRAVITY;
		this.player.body.allowRotation = false;
		this.player.body.maxVelocity.setTo(this.MAX_SPEED, this.MAX_SPEED * 10);
		this.player.body.drag.setTo(this.DRAG, 0);

    	this.camera.follow(this.player, Phaser.Camera.FOLLOW_PLATFORMER);

    	// PARTICLES settings
	    this.fire_emitter = this.add.emitter(0, 0, 400);
	    this.fire_emitter.makeParticles('spritesheet', [21,22,23,24]);
	    this.fire_emitter.gravity = 700;
	    this.fire_emitter.setAlpha(0.9, 0.7, 500);
	    this.fire_emitter.setScale(0.9, 0.2, 0.7, 0.2, 500);
	    this.fire_emitter.setRotation(0, 90);
	    this.fire_emitter.start(false, 300, 3);
	    this.fire_emitter.on = false;
	    

    	// MOLOTOV settings
    	this.molotovPool = this.game.add.group();
    	for(var i = 0; i < this.NUMBER_OF_MOLOTOVS; ++i) {
    		var molotov = this.game.add.sprite(0, 0, 'spritesheet', 20);
    		this.molotovPool.add(molotov);
    		molotov.anchor.setTo(0.5, 0.5);
    		this.game.physics.enable(molotov, Phaser.Physics.ARCADE);
    		molotov.body.gravity.y = this.GRAVITY;
    		molotov.kill();
    	}

    	this.molotov_itens = this.game.add.group();
    	this.molotov_itens.enableBody = true;

    	this.map.createFromObjects('collectable', 21, 'spritesheet', 20, true, false, this.molotov_itens);

    	this.molotovIcon = this.game.add.sprite(this.game.width - 90, 8, 'spritesheet', 20);
    	this.molotovIcon.fixedToCamera = true;

    	// MAP settings - COLLISION/FOREGROUND
		this.lCollision = this.map.createLayer('collision');
		//this.lForeground = this.map.createLayer('foreground');

		this.lCollision.resizeWorld();
		this.map.setCollisionBetween(0, 100, true, this.lCollision, true);


	},

	update: function() {
		this.physics.arcade.collide(this.player, this.lCollision);
		this.physics.arcade.collide(this.molotovPool, this.lCollision, function(molotov, lCollision) {
			this.fire_emitter.on = false;
			molotov.kill();
		}, null, this);
		this.physics.arcade.overlap(this.player, this.molotov_itens, this.collectMolotov, null, this);

		this.pointerRot = this.game.physics.arcade.angleToPointer(this.player);

		this.molotovPool.forEachAlive(function(molotov) {
			var px = molotov.body.velocity.x;
			var py = molotov.body.velocity.y;
			px *= -1;
			py *= -1;

			this.fire_emitter.minParticleSpeed.set(px, py);
			this.fire_emitter.maxParticleSpeed.set(px, py);

			this.fire_emitter.x = molotov.x;
			this.fire_emitter.y = molotov.y;
		}, this);

		if(this.player.body.blocked.down) this.onGround = true;
		else this.onGround = false;

		// Jump
		if(this.onGround && this.input.keyboard.downDuration(Phaser.Keyboard.UP, 10)) {
			this.player.body.velocity.y = this.JUMP_SPEED;
		}

		// Movement
		if(this.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
			this.player.body.acceleration.x = -this.ACCELERATION;
			if(this.facingLeft == false) this.facingLeft = true;
		}
		else if(this.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
			this.player.body.acceleration.x = this.ACCELERATION;
			if(this.facingLeft == true) this.facingLeft = false;
		}
		else if(this.onGround){
			this.player.body.acceleration.x = 0;
		}

		// Sprite transform
		if(this.facingLeft == true) this.player.scale.x = -1;
		else this.player.scale.x = 1

		// Throw molotov
		if(this.NUMBER_OF_MOLOTOVS > 0 && this.game.input.activePointer.isDown) {
			this.throwMolotov();
		}

	},

	render: function() {
		// Debug FPS
	  	this.game.debug.text(this.game.time.fps + " FPS" || '--', 2, 14, "#ffffff");
	  	this.game.debug.text("x " + this.NUMBER_OF_MOLOTOVS, this.game.width - 50, 30, "#ffffff");
	},

	throwMolotov: function() {
		this.fire_emitter.on = true;

		if(this.lastMolotovShotAt == undefined) this.lastMolotovShotAt = 0;
		if(this.game.time.now - this.lastMolotovShotAt < this.THROW_DELAY) return;
    	this.lastMolotovShotAt = this.game.time.now;

    	var molotov = this.molotovPool.getFirstDead();

    	if(molotov == null || molotov == undefined) return;
    	molotov.revive();
    	molotov.checkWorldBounds = true;
    	molotov.outOfBoundsKill = true;

    	molotov.reset(this.player.x, this.player.y - 30);
    	molotov.body.velocity.x = Math.cos(this.pointerRot) * this.MOLOTOV_SPEED;
    	molotov.body.velocity.y = Math.sin(this.pointerRot) * this.MOLOTOV_SPEED;
    	this.NUMBER_OF_MOLOTOVS--;
	},

	collectMolotov: function(player, molotov) {
		this.NUMBER_OF_MOLOTOVS++;
		molotov.kill();	
	}
};
