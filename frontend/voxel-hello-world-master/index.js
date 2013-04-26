var createGame = require('voxel-engine')
var highlight = require('voxel-highlight')
var player = require('voxel-player')
var texturePath = require('painterly-textures')(__dirname)
var voxel = require('voxel')
var extend = require('extend')
var createBuilder = require('builder')
var createRoad = require('road');

var start = require('./assets/start_platform.json');

//production
//var pTextureUrl = '/static/assets/textures/';

console.log('start');

module.exports = function(opts, setup) {
  setup = setup || defaultSetup

  var defaults = {
    generate: function(x, y, z) {
      return 0;
    },
    chunkDistance: 2,
    materials: [
      ['grass', 'dirt', 'grass_dirt'],
      'obsidian',
      'brick',
      'grass',
      'plank'
    ],
    texturePath: '/static/scripts/' + texturePath,
    worldOrigin: [0, 0, 0],
    controls: { discreteFire: false },
    generateChunks: true,
    fogDisabled: true,
    lightsDisabled: false,
    mesher: voxel.meshers.monotome
  }


  opts = extend({}, defaults, opts || {})

  // setup the game and add some trees
  var game = createGame(opts)
  window.game = game;
  var builder = createBuilder(game)
  window.builder = builder;
  window.createRoad = createRoad;
  /*
  var road = createRoad(game, builder, '/assets/instafoto.jpg');
  
  road.connect([ new game.THREE.Vector3(0, 1, 7), new game.THREE.Vector3(-5, 1, 7) ]);

  road.on('complete', function() {
    var r = createRoad( game, builder, '/assets/instafoto.jpg' );
    console.log(road.getConnectionPoints()[1]);
    r.connect( road.getLiveConnectionPoints()[1].reverse() );
      r.on('complete', function() {
        var a = createRoad( game, builder, '/assets/instafoto.jpg' );
        a.connect( r.getLiveConnectionPoints()[1].reverse() );
      });
  });

  window.road = road;
*/
  builder.placeObject( start );


  var container = opts.container || document.body
  window.game = game // for debugging
  game.appendTo(container)
  if (game.notCapable()) return game
  
  var createPlayer = player(game)

  // create the player from a minecraft skin file and tell the
  // game to use it as the main player
  var avatar = createPlayer(opts.playerSkin || '/static/player.png')
  avatar.possess()
  avatar.yaw.position.set(0, 5, 0)

  setup(game, avatar)
  
  return game

}

function defaultSetup(game, avatar) {
  // highlight blocks when you look at them, hold <Ctrl> for block placement
  var blockPosPlace, blockPosErase
  var hl = game.highlighter = highlight(game, { color: 0xff0000 })
  hl.on('highlight', function (voxelPos) { blockPosErase = voxelPos })
  hl.on('remove', function (voxelPos) { blockPosErase = null })
  hl.on('highlight-adjacent', function (voxelPos) { blockPosPlace = voxelPos })
  hl.on('remove-adjacent', function (voxelPos) { blockPosPlace = null })

  // toggle between first and third person modes
  window.addEventListener('keydown', function (ev) {
    if (ev.keyCode === 'R'.charCodeAt(0)) avatar.toggle()
  })

  // block interaction stuff, uses highlight data
  var currentMaterial = 1

  game.on('fire', function (target, state) {
    var position = blockPosPlace
    if (position) {
      game.createBlock(position, currentMaterial)
    }
    else {
      position = blockPosErase
      console.log(position);
      //if (position) game.setBlock(position, 0)
    }
  })

}
