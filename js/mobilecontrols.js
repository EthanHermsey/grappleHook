class MobileControls {

	constructor() {

		this.joystick = this.createJoystick();
		this.button = this.createButton();

		this.joystickStartPosition = { x: 0, y: 0 };
		this.joystickPosition = { x: 0, y: 0 };
		this.stickTouchId = null;

		this.buttonPosition = { start: 0, value: 0 };
		this.buttonTouchId = null;
		this.buttonPressedCallback = null;

		document.documentElement.addEventListener( 'touchmove', ( e )=>{

			this.touchMoved( e );

		} );

		document.documentElement.addEventListener( 'touchend', ( e )=>{

			this.touchReleased( e );

		} );

		document.documentElement.addEventListener( 'touchcancel', ( e )=>{

			this.touchReleased( e );

		} );

	}

	show() {

		this.button.className = '';
		this.joystick.className = '';

	}

	hide() {

		this.button.className = 'mcHidden';
		this.joystick.className = 'mcHidden';

	}

	touchMoved( event ) {

		if ( event.targetTouches[ 0 ].identifier == this.buttonTouchId ) {

			this.buttonSlide( event );

		} else if ( event.targetTouches[ 0 ].identifier == this.stickTouchId ) {

			this.stickMoved( event );

		}

	}


	touchReleased( event ) {

		if ( event.touches.length > 0 ) {

			if ( event.touches[ 0 ].identifier == this.buttonTouchId ) {

				this.stickReleased();

			} else {

				this.buttonReleased();

			}

		} else {

			this.stickReleased();
			this.buttonReleased();

		}



	}






	//  .o8                       .       .
	// "888                     .o8     .o8
	//  888oooo.  oooo  oooo  .o888oo .o888oo  .ooooo.  ooo. .oo.
	//  d88' `88b `888  `888    888     888   d88' `88b `888P"Y88b
	//  888   888  888   888    888     888   888   888  888   888
	//  888   888  888   888    888 .   888 . 888   888  888   888
	//  `Y8bod8P'  `V88V"V8P'   "888"   "888" `Y8bod8P' o888o o888o




	buttonPressed( event ) {

		if ( this.buttonTouchId ) return;

		if ( this.buttonPressedCallback ) this.buttonPressedCallback();

		this.buttonTouchId = event.targetTouches[ 0 ].identifier;

		this.buttonPosition.start = event.targetTouches[ 0 ].screenY;

		this.button.children[ 1 ].className = 'mcPressed';

	}

	buttonSlide( event ) {

		this.buttonPosition.value = event.targetTouches[ 0 ].screenY - this.buttonPosition.start;
		this.buttonPosition.value = Math.min( this.buttonPosition.value, window.innerHeight * 0.12 );
		this.buttonPosition.value = Math.max( this.buttonPosition.value, 0 );

		this.slideButton();

	}

	buttonReleased() {

		if ( this.buttonReleasedCallback ) this.buttonReleasedCallback();

		this.buttonTouchId = null;
		this.buttonPosition.value = 0;
		this.slideButton();
		this.button.children[ 1 ].className = '';

	}

	slideButton() {

		this.button.children[ 1 ].style.marginTop = `${ this.buttonPosition.value }px`;

	}






	//              .    o8o            oooo
	//            .o8    `"'            `888
	//  .oooo.o .o888oo oooo   .ooooo.   888  oooo
	// d88(  "8   888   `888  d88' `"Y8  888 .8P'
	// `"Y88b.    888    888  888        888888.
	// o.  )88b   888 .  888  888   .o8  888 `88b.
	// 8""888P'   "888" o888o `Y8bod8P' o888o o888o




	stickPressed( event ) {

		if ( this.stickTouchId ) return;

		this.stickTouchId = event.targetTouches[ 0 ].identifier;

		this.joystickStartPosition.x = event.targetTouches[ 0 ].screenX;
		this.joystickStartPosition.y = event.targetTouches[ 0 ].screenY;

		this.joystick.children[ 0 ].className = 'mcPressed';

	}

	stickMoved( event ) {

		this.joystickPosition.x = event.targetTouches[ 0 ].screenX - this.joystickStartPosition.x;
		this.joystickPosition.y = event.targetTouches[ 0 ].screenY - this.joystickStartPosition.y;

		let max = window.innerHeight * 0.12;

		let d = this.joystickPosition.x * this.joystickPosition.x + this.joystickPosition.y * this.joystickPosition.y;

		if ( d > max * max ) {

			d = Math.sqrt( d );
			this.joystickPosition.x /= d || 1;
			this.joystickPosition.y /= d || 1;

			this.joystickPosition.x *= max;
			this.joystickPosition.y *= max;

		}

		this.slideStick();

	}

	stickReleased() {

		this.stickTouchId = null;
		this.joystickPosition = { x: 0, y: 0 };
		this.slideStick();

		this.joystick.children[ 0 ].className = '';

	}

	slideStick() {

		this.joystick.children[ 0 ].style.marginTop = `${ this.joystickPosition.y }px`;
		this.joystick.children[ 0 ].style.marginLeft = `${ this.joystickPosition.x }px`;

	}






	//                                            .
	//                                          .o8
	//  .ooooo.  oooo d8b  .ooooo.   .oooo.   .o888oo  .ooooo.
	// d88' `"Y8 `888""8P d88' `88b `P  )88b    888   d88' `88b
	// 888        888     888ooo888  .oP"888    888   888ooo888
	// 888   .o8  888     888    .o d8(  888    888 . 888    .o
	// `Y8bod8P' d888b    `Y8bod8P' `Y888""8o   "888" `Y8bod8P'



	//     o8o                                    .    o8o            oooo
	//     `"'                                  .o8    `"'            `888
	//    oooo  .ooooo.  oooo    ooo  .oooo.o .o888oo oooo   .ooooo.   888  oooo
	//    `888 d88' `88b  `88.  .8'  d88(  "8   888   `888  d88' `"Y8  888 .8P'
	//     888 888   888   `88..8'   `"Y88b.    888    888  888        888888.
	//     888 888   888    `888'    o.  )88b   888 .  888  888   .o8  888 `88b.
	//     888 `Y8bod8P'     .8'     8""888P'   "888" o888o `Y8bod8P' o888o o888o
	//     888           .o..P'
	// .o. 88P           `Y8P'
	// `Y888P

	createJoystick() {

		let div = document.createElement( 'div' );
		div.id = 'mcJoystickContainer';
		div.className = 'mcHidden';
		div.setAttribute( 'draggable', false );

		div.addEventListener( 'touchstart', ( event )=>{

			this.stickPressed( event );

		}, true );

		let stick = document.createElement( 'div' );
		stick.id = 'mcStick';
		stick.setAttribute( 'draggable', false );

		div.appendChild( stick );
		document.documentElement.appendChild( div );

		return div;

	}




	//                                            .
	//                                          .o8
	//  .ooooo.  oooo d8b  .ooooo.   .oooo.   .o888oo  .ooooo.
	// d88' `"Y8 `888""8P d88' `88b `P  )88b    888   d88' `88b
	// 888        888     888ooo888  .oP"888    888   888ooo888
	// 888   .o8  888     888    .o d8(  888    888 . 888    .o
	// `Y8bod8P' d888b    `Y8bod8P' `Y888""8o   "888" `Y8bod8P'



	//  .o8                       .       .
	// "888                     .o8     .o8
	//  888oooo.  oooo  oooo  .o888oo .o888oo  .ooooo.  ooo. .oo.
	//  d88' `88b `888  `888    888     888   d88' `88b `888P"Y88b
	//  888   888  888   888    888     888   888   888  888   888
	//  888   888  888   888    888 .   888 . 888   888  888   888
	//  `Y8bod8P'  `V88V"V8P'   "888"   "888" `Y8bod8P' o888o o888o



	createButton() {


		let div = document.createElement( 'div' );
		div.id = 'mcButtonContainer';
		div.className = 'mcHidden';
		div.setAttribute( 'draggable', false );

		div.addEventListener( 'touchstart', ( event )=>{

			this.buttonPressed( event );

		}, true );

		let button = document.createElement( 'div' );
		button.id = 'mcButton';
		button.setAttribute( 'draggable', false );

		let track = document.createElement( 'div' );
		track.id = 'mcButtonTrack';
		track.setAttribute( 'draggable', false );

		div.appendChild( track );
		div.appendChild( button );
		document.documentElement.appendChild( div );

		return div;

	}

}
