/* eslint-disable no-unused-vars */

class GameManager {

	constructor() {


		this.levelNames = [

			'Block Islands',
			'Test Environment 1',
			'Test Environment 2',
			'Floating Islands 1',
			'Test Environment 3',
			'Floating Islands 2',
			'Test Environment 4',
			'Test Environment 5',
			'Big City 1',
			'Big City 2',

		];

		this.level = 0;
		this.maxLevels = this.levelNames.length;
		this.running = false;

		this.timer = null;
		this.time = 0;

		this.sceneScale = 75;
		this.scene = null;

		this.targets = [];
		this.blocks = [];


		//preload target texture
		this.targetLensflareTexture = new THREE.TextureLoader().load( './resources/img/lensflare.png' );

		//preload sound for target capture
		this.targetSound = {
			source: './resources/sound/beep.mp3',
			volume: 50,
			snd: null,
			finish: false,
			stop() {

				document.body.removeChild( this.snd );

			},
			start() {

				if ( this.finish ) return false;
				this.snd = document.createElement( "embed" );
				this.snd.setAttribute( "src", this.source );
				this.snd.setAttribute( "hidden", "true" );
				this.snd.setAttribute( "volume", this.volume );
				this.snd.setAttribute( "autostart", "true" );
				document.body.appendChild( this.snd );

			}
		};

		//preload block textures
		let loader = new THREE.TextureLoader();
		this.blockRoughness = loader.load( './resources/img/blockTexture/blockRoughness.png' );
		this.blockNormal = loader.load( './resources/img/blockTexture/blockNormal.png' );
		this.blockBump = loader.load( './resources/img/blockTexture/blockBump.png' );
		this.blockDiffuse = loader.load( './resources/img/blockTexture/blockDiff.png' );

		this.blockRoughness.anisotropy = 8;
		this.blockNormal.anisotropy = 8;
		this.blockBump.anisotropy = 8;
		this.blockDiffuse.anisotropy = 8;


		//load scoreboard values
		let savedScoreboard = localStorage.getItem( 'grappleHookScoreboard' );
		savedScoreboard = ( savedScoreboard ) ? JSON.parse( savedScoreboard ) : { levels: [] };

		//add score incrementer function
		this.scoreboard = new Scoreboard( savedScoreboard, this.maxLevels, this.levelNames );

	}


	//                              .o8                .
	//                             "888              .o8
	// oooo  oooo  oo.ooooo.   .oooo888   .oooo.   .o888oo  .ooooo.
	// `888  `888   888' `88b d88' `888  `P  )88b    888   d88' `88b
	//  888   888   888   888 888   888   .oP"888    888   888ooo888
	//  888   888   888   888 888   888  d8(  888    888 . 888    .o
	//  `V88V"V8P'  888bod8P' `Y8bod88P" `Y888""8o   "888" `Y8bod8P'
	//              888
	//             o888o

	update() {

		let total = 0;
		this.targets.forEach( target =>{

			target.checkCapture();

			if ( target.active ) total ++;

		} );

		if ( total == 0 ) {

			this.showLevelScreen();

		}

	}

	updatePointsDisplay( ) {

		let min = Math.floor( Math.floor( ( this.time * 0.01 ) ) / 60 ) || 0;
		let sec = Math.floor( ( this.time * 0.01 ) ) % 60 || 0;
		if ( sec < 10 ) sec = "0" + sec;

		document.getElementById( 'time' ).innerText = min + ':' + sec;

	}




	//              .                          .
	//            .o8                        .o8
	//  .oooo.o .o888oo  .oooo.   oooo d8b .o888oo
	// d88(  "8   888   `P  )88b  `888""8P   888
	// `"Y88b.    888    .oP"888   888       888
	// o.  )88b   888 . d8(  888   888       888 .
	// 8""888P'   "888" `Y888""8o d888b      "888"
	//              .
	//            .o8
	//  .oooo.o .o888oo  .ooooo.  oo.ooooo.
	// d88(  "8   888   d88' `88b  888' `88b
	// `"Y88b.    888   888   888  888   888
	// o.  )88b   888 . 888   888  888   888
	// 8""888P'   "888" `Y8bod8P'  888bod8P'
	//                             888
	//                           .o888o.
	//                                         .o8
	// oooo d8b  .ooooo.   .oooo.o  .ooooo.  .o888oo
	// `888""8P d88' `88b d88(  "8 d88' `88b   888
	//  888     888ooo888 `"Y88b.  888ooo888   888
	//  888     888    .o o.  )88b 888    .o   888 .
	// d888b    `Y8bod8P' 8""888P' `Y8bod8P'   "888"




	start() {

		document.getElementById( 'main' ).classList.add( 'hidden' );
		document.getElementById( 'levelScreen' ).classList.add( 'hidden' );

		document.getElementById( 'three' ).classList.remove( 'hidden' );

		if ( mobile ) {

			window.addEventListener( 'deviceorientation', _phoneMovesCamera );

			 if ( document.getElementById( 'fullscreenCheck' ).checked ) document.documentElement.requestFullscreen().then( () =>{

				screen.orientation.lock( 'landscape-primary' );

			} );

			player.mobileController.show();

			document.documentElement.scrollTop = 0;

		} else {

			renderer.domElement.requestPointerLock();
			if ( document.getElementById( 'fullscreenCheck' ).checked ) document.body.requestFullscreen();

		}

		document.addEventListener( 'fullscreenchange', fullscreenStop );


		this.startLevel().then( ()=>{

			clock.start();

			this.timer = setInterval( ()=>{

				if ( ! this.running ) return;

				this.time ++;
				this.updatePointsDisplay( this.time );


			}, 10 );

		} );

	}

	startLevel() {

		return new Promise( ( resolve, reject ) =>{

			this.running = true;

			this.loadScene();

			this.reset();

			resolve();

		} );

	}

	stop() {


		if ( mobile ) {

			window.removeEventListener( 'deviceorientation', _phoneMovesCamera );

			player.mobileController.hide();

		}

		document.removeEventListener( 'fullscreenchange', fullscreenStop );

		clearInterval( this.timer );
		this.time = 0;

		clock.stop();

		this.running = false;
		document.getElementById( 'three' ).classList.add( 'hidden' );
		document.getElementById( 'levelScreen' ).classList.add( 'hidden' );
		document.getElementById( 'main' ).classList.remove( 'hidden' );

	}

	reset() {

		player.reset();

		this.targets.forEach( target =>{

			target.reset();

		} );

		this.time = 0;

		for ( let key in keyIsPressed ) {

			delete keyIsPressed[ key ];

		}

	}



	//                                       .
	//                                     .o8
	// ooo. .oo.    .ooooo.  oooo    ooo .o888oo
	// `888P"Y88b  d88' `88b  `88b..8P'    888
	//  888   888  888ooo888    Y888'      888
	//  888   888  888    .o  .o8"'88b     888 .
	// o888o o888o `Y8bod8P' o88'   888o   "888"

	// oooo                                  oooo
	// `888                                  `888
	//  888   .ooooo.  oooo    ooo  .ooooo.   888
	//  888  d88' `88b  `88.  .8'  d88' `88b  888
	//  888  888ooo888   `88..8'   888ooo888  888
	//  888  888    .o    `888'    888    .o  888
	// o888o `Y8bod8P'     `8'     `Y8bod8P' o888o

	nextLevel() {

		this.level ++;

		if ( this.level == this.maxLevels ) {

			this.level = 0;

		}

		this.startLevel();

		document.getElementById( 'levelScreen' ).classList.add( 'hidden' );

	}

	showLevelScreen() {

		this.running = false;

		this.scoreboard.update();

		document.exitPointerLock();

		document.getElementById( 'levelScreen' ).classList.remove( 'hidden' );

	}





	// oooo                            .o8
	// `888                           "888
	//  888   .ooooo.   .oooo.    .oooo888
	//  888  d88' `88b `P  )88b  d88' `888
	//  888  888   888  .oP"888  888   888
	//  888  888   888 d8(  888  888   888
	// o888o `Y8bod8P' `Y888""8o `Y8bod88P"





	//  .oooo.o  .ooooo.   .ooooo.  ooo. .oo.    .ooooo.
	// d88(  "8 d88' `"Y8 d88' `88b `888P"Y88b  d88' `88b
	// `"Y88b.  888       888ooo888  888   888  888ooo888
	// o.  )88b 888   .o8 888    .o  888   888  888    .o
	// 8""888P' `Y8bod8P' `Y8bod8P' o888o o888o `Y8bod8P'




	loadScene( json ) {

		if ( this.scene ) {

			scene.remove( this.scene );

		}

		let loader = new THREE.ObjectLoader();

		if ( json ) {

			loader.parse( json, ( model )=>{

				this.loadModel( model );

			} );

		} else {

			loader.load( './resources/levels/' + this.levelNames[ this.level ] + '.json', ( model )=>{

				this.loadModel( model );

			} );

		}

	}

	loadModel( model ) {

		//check if it is a custom of grapplehook level ( a native level is one with those tiled blocks)
		let custom = false;
		model.children.forEach( child =>{

			if ( child.name == "CUSTOM_LEVEL" ) custom = true;

		} );


		//reset
		this.blocks = [];
		this.targets.forEach( target =>{

			target.dispose();

		} );
		this.targets = [];


		//scale and add model
		if ( ! custom ) model.scale.setScalar( this.sceneScale );

		model.updateMatrixWorld( true );

		this.scene = model;
		scene.add( this.scene );


		//parse the blocks, player start and targets
		for ( let i = 0; i < model.children.length; i ++ ) {

			let block = model.children[ i ];

			if ( block.name == "TARGET" ) {

				block.visible = false;

				let targetPos = new THREE.Vector3();
				block.getWorldPosition( targetPos );

				this.targets.push( new Target( targetPos ) );
				continue;

			} else if ( block.name == "PLAYER_START" ) {

				block.visible = false;

				this.playerStartPoint = new THREE.Vector3();
				block.getWorldPosition( this.playerStartPoint );

				player.position.copy( this.playerStartPoint );
				player.position.y += player.height;

				player.object.rotation.y = block.rotation.y;
				player.object.rotation.y += Math.PI * 0.5;
				continue;

			}


			//if generic grapplehook level, load the tiling standard material
			if ( ! custom ) {

				//remove old material
				block.material.dispose();

				//add new custom material
				block.material = new THREE.ShaderMaterial( {
					vertexShader: shaders.children.blockVertexShader.textContent,
					fragmentShader: shaders.children.blockFragmentShader.textContent,

					uniforms: THREE.UniformsUtils.merge( [
						THREE.ShaderLib[ 'standard' ].uniforms,
						{
							blockScale: { value: block.scale }
						}
					] ),

					defines: {
						"STANDARD": "",
						"USE_NORMALMAP": "",
						"USE_ROUGHNESSMAP": "",
						"USE_BUMPMAP": "",
					},

					lights: true

				} );

				block.material.map = this.blockDiffuse;

				block.material.uniforms.map.value = this.blockDiffuse;
				block.material.uniforms.roughnessMap.value = this.blockRoughness;
				block.material.uniforms.normalMap.value = this.blockNormal;
				block.material.uniforms.bumpMap.value = this.blockBump;
				block.material.uniforms.bumpScale.value = 1.8;

				block.material.extensions.derivatives = true;
				block.material.uniformsNeedUpdate = true;

			}

			//add shadows
			block.castShadow = true;
			block.receiveShadow = true;

			//add bounding box
			block.boundingBox = new THREE.Box3().setFromObject( block );

			//add to ray-castable blocks
			this.blocks.push( block );

		}

	}


	//  .o8
	// "888
	//  888oooo.   .ooooo.   .ooooo.  oo.ooooo.
	//  d88' `88b d88' `88b d88' `88b  888' `88b
	//  888   888 888ooo888 888ooo888  888   888
	//  888   888 888    .o 888    .o  888   888
	//  `Y8bod8P' `Y8bod8P' `Y8bod8P'  888bod8P'
	//                                 888
	//                                o888o

	beep() {

		this.targetSound.start();

	}

}



function _phoneMovesCamera( e ) {

	player.phoneMoved( e );

}

function fullscreenStop() {

	if ( document.getElementById( 'fullscreenCheck' ).checked == true &&
		 document.getElementById( 'levelScreen' ).classList.contains( 'hidden' ) == false ) {

		game.stop();

	}

}
