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
		this.load.image('MenuBG', 'src/img/menubg.png');
		this.load.spritesheet('PlayButton', 'src/img/playb.png', 189, 74, 1);

		// Game assets
		this.load.spritesheet('spritesheet', 'src/sprites/spritesheet.png', 32, 32);
		this.load.spritesheet('player', 'src/sprites/character.png', 40, 60);
		this.load.tilemap('map', 'src/maps/tmapf.json', null, Phaser.Tilemap.TILED_JSON);
	},

	create: function() {
		this.preloadBar.cropEnabled = false;
	},

	update: function() {
		this.state.start('MainMenu');
	}
};
