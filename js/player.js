/* eslint-disable no-unused-vars */
const mobile = false;

class Player {

	constructor() {

		this.camera = this.object = new THREE.PerspectiveCamera(
			65,
			window.innerWidth / window.innerHeight,
			0.01,
			100000
		);
		this.cameraDirection = new THREE.Vector3();
		this.object.rotation.order = "YXZ";
		this.object.position.set( 0, 200, 0 );
		this.object.rotation.set( 0, Math.PI * 0.5, 0 );

		this.skybox = new THREE.Mesh(
			new THREE.SphereBufferGeometry( 90000, 32, 32 ),
			new THREE.MeshLambertMaterial( {
				map: new THREE.TextureLoader().load( './resources/img/sky.png' ),
				side: THREE.BackSide
			} )
		);
		scene.add( this.skybox );

		this.velocity = new THREE.Vector3();
		this.nextVelocity = new THREE.Vector3();
		this.nextPosition = new THREE.Vector3();
		this.down = new THREE.Vector3( 0, - 1, 0 );
		this.gravity = 38;

		this.points = 0;
		this.height = 100;
		this.mouseSensitivity = 0.0012;
		this.mouseButtonPressed = undefined;

		this.walkSpeed = ( mobile ) ? 1.5 : 2;
		this.airwalkSpeed = 0.25;
		this.jumpStrength = 13;

		this.grounded = false;
		this.onRope = false;

		this.ropeLength = 0;
		this.ropeClimbSpeed = 275;

		this.ropeTarget = new THREE.Vector3();
		this.positionOnEndOfRope = new THREE.Vector3();
		this.ropePositionDifference = new THREE.Vector3();

		this.ropeObject = new Rope();

		//load mobile controls
		if ( mobile ) {

			this.mobileController = new MobileControls();

			this.mobileController.buttonPressedCallback = ()=>{

				this.mouseDown();

			};

			this.mobileController.buttonReleasedCallback = ()=>{

				this.mouseUp();

			};

		}


		//load wind-noise

		//create buffersources
		this.windNoise = context.createBufferSource();
		//create pink-noise buffer
		let bufferSize = 2 * context.sampleRate;
		let pinkBuffer = context.createBuffer( 1, bufferSize, context.sampleRate );
		let noiseData = pinkBuffer.getChannelData( 0 );
		let b0, b1, b2, b3, b4, b5, b6;
		b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
		for ( let i = 0; i < bufferSize; i ++ ) {

			let white = Math.random() * 2 - 1;
			b0 = 0.99886 * b0 + white * 0.0555179;
			b1 = 0.99332 * b1 + white * 0.0750759;
			b2 = 0.96900 * b2 + white * 0.1538520;
			b3 = 0.86650 * b3 + white * 0.3104856;
			b4 = 0.55000 * b4 + white * 0.5329522;
			b5 = - 0.7616 * b5 - white * 0.0168980;
			noiseData[ i ] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
			noiseData[ i ] *= 0.11;

			b6 = white * 0.115926;

		}
		//set pin-noise buffer on buffersource
		this.windNoise.buffer = pinkBuffer;
		this.windNoise.loop = true;
		this.windNoise.start();

		//create low-pass filter
		this.filter = context.createBiquadFilter();
		this.filter.type = 'lowpass';
		this.filter.Q.value = 10;
		this.filter.frequency.value = 600;

		//add a gain
		this.gain = context.createGain();
		this.gain.gain.value = 0;

		//connect it up!
		this.windNoise.connect( this.filter );
		this.filter.connect( this.gain );
		this.gain.connect( context.destination );

	}

	get position() {

		return this.object.position;

	}

	reset() {

		this.position.copy( game.playerStartPoint );
		this.object.rotation.set( 0, Math.PI * 0.5, 0 );

		this.velocity.multiplyScalar( 0 );

		this.grounded = false;
		this.onRope = false;
		this.points = 0;

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


	update( delta ) {

		//subtract gravity!
		this.velocity.y -= this.gravity * delta;

		//swing on rope
		if ( this.onRope ) this.swing();

		//walk/airwalk
		this.move( delta );

		//check if fallen
		this.checkOnBoundaries();

		//update the IK rope
		if ( this.onRope ) this.updateRope( delta );

		//move skybox
		this.skybox.position.copy( this.position );

		//update wind noise
		this.updateWindNoise();

	}

	updateRope( delta ) {

		//update the rope object
		if ( this.onRope ) {

			if ( ( mobile && this.mobileController.buttonPosition.value > 0 ) || keyIsDown( key.shift ) ) {

				this.ropeLength = Math.max( this.height * 2, this.ropeLength - ( this.ropeClimbSpeed * delta ) );
				this.ropeObject.set( this.position, this.ropeLength );

			}

			let ropePos = this.position.clone();
			ropePos.y -= 5;

			this.ropeObject.update( ropePos, this.ropeTarget );

		}

	}

	updateWindNoise() {

		if ( this.grounded ) {

			this.gain.gain.value = 0;

		} else {

			let speed = Math.min( this.velocity.length(), 100 );

			this.gain.gain.value = ( speed * speed ) * 0.00001;
			this.filter.frequency.value = 600 + ( 20 * speed );

		}

	}





	//                            o8o
	//                            `"'
	//  .oooo.o oooo oooo    ooo oooo  ooo. .oo.    .oooooooo
	// d88(  "8  `88. `88.  .8'  `888  `888P"Y88b  888' `88b
	// `"Y88b.    `88..]88..8'    888   888   888  888   888
	// o.  )88b    `888'`888'     888   888   888  `88bod8P'
	// 8""888P'     `8'  `8'     o888o o888o o888o `8oooooo.
	//                                             d"     YD
	//                                             "Y88888P'

	swing() {

		//calculate swing
		if ( this.ropeTarget.distanceToSquared( this.position ) > this.ropeLength * this.ropeLength ) {

			//calculate coordinate where ball is supposed to be (on end of rope)
			this.positionOnEndOfRope.subVectors( this.position, this.ropeTarget );
			this.positionOnEndOfRope.setLength( this.ropeLength );
			this.positionOnEndOfRope.add( this.ropeTarget );

			//the difference of current position to the positions on the end of the rope.
			this.ropePositionDifference.subVectors( this.position, this.positionOnEndOfRope );


			//remove bouncyness from rope..
			let d = Math.abs(
				this.positionOnEndOfRope.clone()
					.normalize()
					.dot( this.ropePositionDifference.clone().normalize() )
			);
			this.ropePositionDifference.multiplyScalar( 1 - ( d * 0.3 ) );

			//move ball to end of the rope and add to velocity
			this.velocity.sub( this.ropePositionDifference );

			this.position.copy( this.positionOnEndOfRope );

		}

	}




	// ooo. .oo.  .oo.    .ooooo.  oooo    ooo  .ooooo.
	// `888P"Y88bP"Y88b  d88' `88b  `88.  .8'  d88' `88b
	//  888   888   888  888   888   `88..8'   888ooo888
	//  888   888   888  888   888    `888'    888    .o
	// o888o o888o o888o `Y8bod8P'     `8'     `Y8bod8P'



	move( delta ) {

		//acceleration vector3 by user input
		const keyInput = this.getKeyInput();

		//add acceleration to velocity and velocity to postition.
		this.nextVelocity.copy( this.velocity ).add( keyInput );
		this.nextPosition.copy( this.position ).add( this.nextVelocity );

		//check if new position collides with raycasting ( and bounces from surface )
		this.raycastNextPosition();

		//copy actual position and velocity
		this.position.copy( this.nextPosition );
		this.velocity.copy( this.nextVelocity );

		//apply 'air resistance / ground friction'
		if ( ! this.onRope && this.grounded ) {

			this.velocity.x *= 0.8;
			this.velocity.y *= 0.99;
			this.velocity.z *= 0.8;

		} else {

			this.velocity.x *= 0.9995;
			this.velocity.y *= 0.9995;
			this.velocity.z *= 0.9995;

		}

		//jump
		if ( keyIsDown( key.space ) && this.grounded ) {

			this.grounded = false;
			this.velocity.y = this.jumpStrength;

		}

		//actually move player
		this.position.add( this.velocity.clone().multiplyScalar( delta ) );

	}







	// oooo  oooo   .oooo.o  .ooooo.  oooo d8b
	// `888  `888  d88(  "8 d88' `88b `888""8P
	//  888   888  `"Y88b.  888ooo888  888
	//  888   888  o.  )88b 888    .o  888
	//  `V88V"V8P' 8""888P' `Y8bod8P' d888b



	//  o8o                                         .
	//  `"'                                       .o8
	// oooo  ooo. .oo.   oo.ooooo.  oooo  oooo  .o888oo
	// `888  `888P"Y88b   888' `88b `888  `888    888
	//  888   888   888   888   888  888   888    888
	//  888   888   888   888   888  888   888    888 .
	// o888o o888o o888o  888bod8P'  `V88V"V8P'   "888"
	//                    888
	//                   o888o

	mouseMoved( e ) {

		this.object.rotateY( e.movementX * - this.mouseSensitivity );
		this.object.rotateX( e.movementY * - this.mouseSensitivity );

		let half_pi = Math.PI * 0.5;
		this.object.rotation.x = Math.max( - half_pi + 0.15, Math.min( this.object.rotation.x, half_pi - 0.15 ) );

		this.object.rotation.z = 0;

	}

	mouseDown( button ) {

		if ( this.onRope ) return;

		this.camera.getWorldDirection( this.cameraDirection );

		let intersectDirection = this.collideBlocks( this.position, this.cameraDirection );
		if ( intersectDirection ) {

			this.ropeTarget.copy( intersectDirection.point );
			this.ropeLength = this.position.distanceTo( this.ropeTarget );

			this.ropeObject.set( this.position, this.ropeLength );

			this.onRope = true;
			this.mouseButtonPressed = button;

		}

	}

	mouseUp( button ) {

		if ( button == this.mouseButtonPressed ) {

			this.onRope = false;
			this.ropeObject.hide();
			this.mouseButtonPressed = undefined;

		}

	}





	phoneMoved( event ) {

		let setRotation = function ( x, y, z ) {

			let rad = ( Math.PI / 180 );

			player.camera.rotation.x = x * rad;
			player.camera.rotation.y = y * rad + ( Math.PI * 0.5 );
			player.camera.rotation.z = z * rad;

		};

		if ( event.gamma > 0 ) {

			setRotation(

				90 - event.gamma,
				event.alpha - 180,
				event.beta - 180

			);

		} else {

			setRotation(

				- 90 - event.gamma,
				event.alpha,
				event.beta * - 1

			);

		}

	}






	rotateInput( input ) {

		//rotated to players y-axis rotation
		let playerRotation = new THREE.Euler( 0, this.object.rotation.y, 0, 'YXZ' );
		return input.normalize().applyEuler( playerRotation );

	}


	getMobileInput() {

		let d = new THREE.Vector3(

			( Math.abs( this.mobileController.joystickPosition.x ) > 25 ) ? this.mobileController.joystickPosition.x : 0,
			0,
			( Math.abs( this.mobileController.joystickPosition.y ) > 25 ) ? this.mobileController.joystickPosition.y : 0,

		);

		return this.rotateInput( d );

	}


	getKeyInput() {

		let keyInput;
		if ( mobile ) {

			keyInput = this.getMobileInput();

		} else {

			keyInput = this.getKeyBoardInput();

		}



		if ( this.grounded ) {

			if ( this.onRope ) {

				keyInput.multiplyScalar( this.walkSpeed * 0.2 );

			} else {

				keyInput.multiplyScalar( this.walkSpeed );

			}


		} else {

			keyInput.multiplyScalar( this.airwalkSpeed );

		}

		return keyInput;

	}

	getKeyBoardInput() {

		let d = new THREE.Vector3();

		//x axis (left/right)
		if ( keyIsDown( key.up ) ) {

			d.z -= 1;

		} else if ( keyIsDown( key.down ) ) {

			d.z += 1;

		}

		//z axis (front-back)
		if ( keyIsDown( key.left ) ) {

			d.x -= 1;

		} else if ( keyIsDown( key.right ) ) {

			d.x += 1;

		}

		return this.rotateInput( d );

	}




	//                     oooo  oooo   o8o        .o8
	//                     `888  `888   `"'       "888
	//  .ooooo.   .ooooo.   888   888  oooo   .oooo888   .ooooo.
	// d88' `"Y8 d88' `88b  888   888  `888  d88' `888  d88' `88b
	// 888       888   888  888   888   888  888   888  888ooo888
	// 888   .o8 888   888  888   888   888  888   888  888    .o
	// `Y8bod8P' `Y8bod8P' o888o o888o o888o `Y8bod88P" `Y8bod8P'

	raycastNextPosition() {

		let groundedOnBlocks = false;

		//raycast game.blocks
		game.blocks.forEach( block =>{

			//broad phase
			let bbDist = block.boundingBox.distanceToPoint( this.nextPosition );

			if ( bbDist < 100 ) {

				//narrow phase ( raycast )
				//first check down, to enable walking on surfaces. Otherwise check velocity direction

				//colliding downwards, otherwise in the velocity's direction
				let intersectDown = this.collide( block, this.nextPosition, this.down );

				if ( intersectDown && intersectDown.distance < this.height ) {

					//reflect velocity
					this.nextVelocity.y *= - 0.25;

					//set position from surface
					this.nextPosition.copy( intersectDown.point );
					this.nextPosition.add( scene.up.clone().multiplyScalar( this.height + 0.2 ) );

					//set grounded flag
					groundedOnBlocks = true;

				} else {

					//colliding in the direction of the velocity
					let intersectDirection = this.collide( block, this.nextPosition, this.nextVelocity.clone().normalize() );

					if ( intersectDirection && intersectDirection.distance < this.height ) {

						//bounce velocity
						let direction = new THREE.Vector3().subVectors( intersectDirection.point, this.nextPosition ).normalize();

						//calculate normal
						let normal = intersectDirection.face.normal;
						const normalMatrix = new THREE.Matrix3().getNormalMatrix( intersectDirection.object.matrixWorld );
						normal.applyMatrix3( normalMatrix ).normalize();

						this.nextVelocity.reflect( normal ).multiplyScalar( 0.4 );

						//set position from surface
						this.nextPosition.copy( intersectDirection.point );
						this.nextPosition.add( direction.multiplyScalar( - ( this.height + 0.2 ) ) );

						//set grounded flag
						groundedOnBlocks = true;

					}

				}

			}

		} );

		//set grounded flag
		this.grounded = groundedOnBlocks;

	}

	collide( object, point, direction ) {

		if ( ! object ) return;
		raycaster.set( point, direction );
		let intersects = raycaster.intersectObject( object, true );

		if ( intersects.length > 0 ) return intersects[ 0 ];

		return undefined;

	}

	collideBlocks( point, direction ) {

		raycaster.set( point, direction );
		let intersects = raycaster.intersectObjects( game.blocks, true );

		if ( intersects.length > 0 ) return intersects[ 0 ];

		return undefined;

	}

	vectorAxisDirectionAbsolute( v ) {

		let absDir = new THREE.Vector3( 1, 1, 1 );
		if ( Math.abs( v.x ) > Math.abs( v.y ) && Math.abs( v.x ) > Math.abs( v.z ) ) absDir.x = - restitution;
		if ( Math.abs( v.y ) > Math.abs( v.x ) && Math.abs( v.y ) > Math.abs( v.z ) ) absDir.y = - restitution;
		if ( Math.abs( v.z ) > Math.abs( v.x ) && Math.abs( v.z ) > Math.abs( v.y ) ) absDir.z = - restitution;
		return absDir;

	}

	checkOnBoundaries() {

		if ( this.position.y < - 1600 && ! this.onRope ) {

			game.reset();

		}

	}

}
