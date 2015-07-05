GameControl.Load = function(game) {
	this.background = null;
	this.preloadBar = null;
};

GameControl.Load.prototype = {
	preload: function() {
		// Load stuff
		this.background = this.add.sprite(0, 0, 'PreloaderBG');
		this.preloadBar = this.add.sprite(120, 320, 'PreloaderBar');
		this.load.setPreloadSprite(this.preloadBar);

		// Menu assets
		this.load.image('MenuBG', 'src/img/bgmenu.png');
		this.load.spritesheet('PlayButton', 'src/img/playb.png', 189, 74, 1);

		// Game assets
		this.load.spritesheet('spritesheet', 'src/sprites/spritesheet.png', 32, 32);
		this.load.spritesheet('player', 'src/sprites/character.png', 40, 60);
		this.load.spritesheet('robot1', 'src/sprites/robot1.png', 28, 64);
		this.load.tilemap('map', 'src/maps/tmapf.json', null, Phaser.Tilemap.TILED_JSON);

		this.load.audio('barricadas', 'src/sound/barricadas.ogg');
		this.load.audio('glass-break', 'src/sound/glass-break.ogg');
		this.load.audio('fire-loop', 'src/sound/fire-loop.ogg');
	},

	create: function() {
		this.preloadBar.cropEnabled = false;
	},

	update: function() {
		this.state.start('MainMenu');
	}
};
