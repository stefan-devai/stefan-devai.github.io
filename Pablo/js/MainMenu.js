GameControl.MainMenu = function(game) {
	this.playButton = null;
};

GameControl.MainMenu.prototype = {
	create: function() {
		this.add.sprite(0, 0, 'MenuBG');
		this.playButton = this.add.button(295, 240, 'PlayButton', this.startGame, this, 0, 0, 0);
	},

	update: function() {

	},

	startGame: function(pointer) {
		this.state.start('InGame');
	}
};
