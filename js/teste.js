var game = new Phaser.Game(800, 600, Phaser.AUTO, 'm-game', { preload: preload, create: create, update: update });

function preload() 
{
    game.load.spritesheet('huasteca', 'img/spritesheet1.png', 23, 51, 16);
    game.load.tilemap('woods', 'maps/woods.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tileset', 'img/maptileset.png');
}

var map;
var layer;

function create() 
{
    game.stage.backgroundColor = '#576f4b';

    map = game.add.tilemap('woods');
    map.addTilesetImage('woodstiles', 'tileset');
    
    layer = map.createLayer('world1');
    layer.scale.x = 3;
    layer.scale.y = 3;
    layer.smoothed = false;
    layer.resizeWorld();

}

function update() 
{

}