GameControl.Load = function(game) {
	this.background = null;
	this.preloadBar = null;
	this.ready = false;
};

GameControl.Load.prototype = {
	preload: function() {

		this.background = this.add.sprite(0, 0, 'preloaderBG');
		this.preloadBar = this.add.sprite(120, 320, 'preloaderBar');
		this.load.setPreloadSprite(this.preloadBar);

		// Assets del menu
		this.load.image('menuBG', 'img/menubg.png');
		this.load.spritesheet('playButton', 'img/playb.png', 189, 74, 1);

		// Assets del juego
		this.load.spritesheet('insurgente', 'img/h_walk_jump.png', 23, 51, 23);
		this.load.tilemap('woods', 'maps/woods.json', null, Phaser.Tilemap.TILED_JSON);
		this.load.image('tileset', 'img/terrain.png');
		this.load.audio('lapartida', ['sound/lapartida.mp3']);
		this.load.audio('sunshine', ['sound/sunshine.mp3']);
	},

	create: function() {
		this.preloadBar.cropEnabled = false;
	},

	update: function() {
		if(this.cache.isSoundDecoded('lapartida') && this.ready == false) 
		{
			this.ready = true;
			this.state.start('MainMenu');
		}
	}
}