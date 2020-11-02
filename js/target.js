
class Target {

	constructor( position ) {

		this.diameter = 200;
		this.active = true;

		this.object = new THREE.PointLight( 'lime', 1, 300 );
		this.object.position.copy( position );
		scene.add( this.object );

		this.lensFlare = new THREE.Sprite(
			new THREE.SpriteMaterial( {
				map: game.targetLensflareTexture,
				color: 'lime',
				sizeAttenuation: false,
				transparent: true,
				blending: THREE.AdditiveBlending,
			 } )
		);
		this.lensFlare.scale.setScalar( 0.2 );
		this.object.add( this.lensFlare );


	}

	dispose() {

		this.lensFlare.material.dispose();
		scene.remove( this.object );

	}

	reset() {

		this.active = true;
		this.object.color.set( 'lime' );
		this.lensFlare.material.color.set( 'lime' );

	}

	hide() {

		this.active = false;
		this.object.color.set( 'black' );
		this.lensFlare.material.color.set( 'black' );

	}


	resetPoints() {

		this.points = 0;

	}

	capture() {

		player.points ++;
		game.updatePointsDisplay();

		this.active = false;
		this.object.color.set( 'black' );
		this.lensFlare.material.color.set( 'black' );

		game.beep();

	}

	checkCapture() {

		if ( this.active && player.position.distanceToSquared( this.object.position ) < Math.pow( this.diameter, 2 ) * 3 ) {

			this.capture();

		}

	}

}
