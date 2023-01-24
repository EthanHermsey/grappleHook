/* eslint-disable no-unused-vars */


//title animation
let titleAnimation = {

	time: 0,
	max: 10,
	inc: 0.05,
	step() {

		//check if the timer is in the top 2 range
		if ( ( this.time += this.inc ) >= this.max - 2 ) {

			//slow down the timer, longer blur time.
			this.time -= this.inc * 0.6;

			//save blur factor
			let blurFactor = this.max - this.time;

			//if time is over max-time, restart with different increment speed.
			if ( this.time > this.max ) {

				this.inc = 0.05 + ( Math.random() * 0.3 );
				this.time = 0;

			}

			//return the blur factor
			return blurFactor;

		}

		return false;

	}
};

//audio context
window.AudioContext = window.AudioContext || window.webkitAudioContext;
let context = new AudioContext();

// three.js variables
const clock = new THREE.Clock( false );
const raycaster = new THREE.Raycaster();
let scene = new THREE.Scene();
let renderer = null;

// objects
const player = new Player();
const game = new GameManager();
let shaders = null;

// keypress variables
let keyIsDown = null;
const keyIsPressed = {};
const key = {
	up: 87,
	down: 83,
	left: 65,
	right: 68,
	shift: 16,
	space: 32,
	reset: 82,
	escape: 27
};








// oooo                            .o8
// `888                           "888
//  888   .ooooo.   .oooo.    .oooo888
//  888  d88' `88b `P  )88b  d88' `888
//  888  888   888  .oP"888  888   888
//  888  888   888 d8(  888  888   888
// o888o `Y8bod8P' `Y888""8o `Y8bod88P"

window.addEventListener( 'load', function () {

	fetch( './resources/shaders.html' ).then( body =>{

		body.text().then( text=>{

			shaders = document.createElement( 'div' );
			shaders.innerHTML = text;

			initTHREE();

			initUI();

			game.loadScene();

			render();

		} );

	} );

} );






//  o8o               o8o      .
//  `"'               `"'    .o8
// oooo  ooo. .oo.   oooo  .o888oo
// `888  `888P"Y88b  `888    888
//  888   888   888   888    888
//  888   888   888   888    888 .
// o888o o888o o888o o888o   "888"



//     .   oooo
//   .o8   `888
// .o888oo  888 .oo.   oooo d8b  .ooooo.   .ooooo.
//   888    888P"Y88b  `888""8P d88' `88b d88' `88b
//   888    888   888   888     888ooo888 888ooo888
//   888 .  888   888   888     888    .o 888    .o
//   "888" o888o o888o d888b    `Y8bod8P' `Y8bod8P'


function initTHREE() {

	// renderer
	renderer = new THREE.WebGLRenderer( { antialias: true, logarithmicDepthBuffer: true } );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.getElementById( 'three' ).appendChild( renderer.domElement );

	// lights!
	scene.add( new THREE.AmbientLight( 'rgb(255,255,200)', 0.3 ) );

	scene.add( new THREE.HemisphereLight( 'deeppink', 'purple', 0.3 ) );

	for ( let i = 0; i < 3; i ++ ) {

		let a = i * ( Math.PI / 1.5 );
		let x = - 100000 * Math.cos( a );
		let z = 100000 * Math.sin( a );

		let dLight = new THREE.DirectionalLight( 'white', 0.35 );
		dLight.position.set( x, 100000, z );

		scene.add( dLight );

	}

}




//  o8o               o8o      .
//  `"'               `"'    .o8
// oooo  ooo. .oo.   oooo  .o888oo
// `888  `888P"Y88b  `888    888
//  888   888   888   888    888
//  888   888   888   888    888 .
// o888o o888o o888o o888o   "888"



// ooooo     ooo ooooo
// `888'     `8' `888'
//  888       8   888
//  888       8   888
//  888       8   888
//  `88.    .8'   888
//    `YbodP'    o888o



function initUI() {

	// make mouse pointerlock work
	if ( 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document ) {

		renderer.domElement.requestPointerLock = renderer.domElement.requestPointerLock || renderer.domElement.mozRequestPointerLock || renderer.domElement.webkitRequestPointerLock;
		document.addEventListener( 'pointerlockchange', pointerlockCallback, false );
		document.addEventListener( 'mozpointerlockchange', pointerlockCallback, false );
		document.addEventListener( 'webkitpointerlockchange', pointerlockCallback, false );

	}

	//alt-tabbing when not in fullscreen mode.
	window.onfocus = function () {

		if ( game.running && ! document.getElementById( 'fullscreenCheck' ).checked ) {

			renderer.domElement.requestPointerLock();

		}

	};

	// keep track of pressed mousebutton
	document.body.onmousedown = function ( e ) {

		if ( ! document.pointerLockElement && game.running && ! document.getElementById( 'fullscreenCheck' ).checked ) {

			renderer.domElement.requestPointerLock();

		}

		player.mouseDown( e.button );

	};
	document.body.onmouseup = function ( e ) {

		player.mouseUp( e.button );

	};



	// keep track of pressed keys
	keyIsDown = function ( key ) {

		return keyIsPressed[ key ];

	};

	document.body.onkeydown = function ( e ) {

		if ( e.keyCode == key.reset ) game.reset();

		keyIsPressed[ e.keyCode ] = true;

	};

	document.body.onkeyup = function ( e ) {

		delete keyIsPressed[ e.keyCode ];

	};




	// add event to continue button on the 'inbetween levels' screen
	document.getElementById( 'continue' ).addEventListener( 'click', () => {

		renderer.domElement.requestPointerLock();
		game.nextLevel();

	} );

	// add event to retry button on the 'inbetween levels' screen
	document.getElementById( 'retry' ).addEventListener( 'click', () => {

		renderer.domElement.requestPointerLock();
		document.getElementById( 'levelScreen' ).classList.add( 'hidden' );
		game.startLevel();

	} );




	//upload custom level click event
	document.getElementById( 'uploadButton' ).addEventListener( 'click', function () {

		game.fileOpener.click();

	} );




	// preload scoreboard grid on main menu
	game.scoreboard.updateScoreboardGrid();


	//add event for scoreboard reset button
	document.getElementById( 'resetScoreboard' ).addEventListener( 'click', function () {

		if ( confirm( 'Are you sure that you want to reset the scoreboard?' ) ) {

			game.scoreboard.reset();

		}

	} );


	//sound checkbox fix
	document.getElementById( 'soundDisplay' ).onclick = function () {

		let checkbox = document.getElementById( 'soundCheck' );
		checkbox.checked = ! checkbox.checked;

	};


	//fullscreen checkbox fix
	document.getElementById( 'fullscreenDisplay' ).onclick = function () {

		let checkbox = document.getElementById( 'fullscreenCheck' );
		checkbox.checked = ! checkbox.checked;

	};


	// window resized event
	window.addEventListener( 'resize', function () {

		renderer.setSize( window.innerWidth, window.innerHeight );

		player.camera.aspect = window.innerWidth / window.innerHeight;
		player.camera.updateProjectionMatrix();

	} );

}


function pointerlockCallback() {

	// check if pointerlock is activated, or not.
	if ( document.pointerLockElement === renderer.domElement ||
		  document.mozPointerLockElement === renderer.domElement ||
		  document.webkitPointerLockElement === renderer.domElement ) {

		// add mouse move event
		document.addEventListener( "mousemove", onMouseMove, false );

	} else {

		// remove mouse move event
		document.removeEventListener( "mousemove", onMouseMove, false );

		// show 'inbetween levels' screen with score
		// Dont stop when not in fullscreen mode and tabbing-out
		if ( ( document.getElementById( 'fullscreenCheck' ).checked || document.hasFocus() ) && document.getElementById( 'levelScreen' ).classList.contains( 'hidden' ) ) game.stop();

	}

}


function onMouseMove( e ) {

	// transmit mousemove event to player object
	player.mouseMoved( e );

}












//                                      .o8
//                                     "888
// oooo d8b  .ooooo.  ooo. .oo.    .oooo888   .ooooo.  oooo d8b
// `888""8P d88' `88b `888P"Y88b  d88' `888  d88' `88b `888""8P
//  888     888ooo888  888   888  888   888  888ooo888  888
//  888     888    .o  888   888  888   888  888    .o  888
// d888b    `Y8bod8P' o888o o888o `Y8bod88P" `Y8bod8P' d888b



function render() {

	//get deltaTime
	let delta = clock.getDelta();

	// loop
	requestAnimationFrame( render );

	if ( ! game.running ) {

		// update title animation
		document.getElementById( 'titleEffect' ).style.backdropFilter = `blur(${ ( titleAnimation.step() || 0 ) }px)`;
		return;

	}

	// update and move player object
	player.update( delta );

	// update game, check target captures.
	game.update( );

	// render the scene to the canvas
	renderer.render( scene, player.camera );

}
