
/* eslint-disable no-unused-vars */



// ooooo
// `888'
//  888  ooo. .oo.   oooo    ooo  .ooooo.  oooo d8b  .oooo.o  .ooooo.
//  888  `888P"Y88b   `88.  .8'  d88' `88b `888""8P d88(  "8 d88' `88b
//  888   888   888    `88..8'   888ooo888  888     `"Y88b.  888ooo888
//  888   888   888     `888'    888    .o  888     o.  )88b 888    .o
// o888o o888o o888o     `8'     `Y8bod8P' d888b    8""888P' `Y8bod8P'



// oooo         o8o                                                        .    o8o
// `888         `"'                                                      .o8    `"'
//  888  oooo  oooo  ooo. .oo.    .ooooo.  ooo. .oo.  .oo.    .oooo.   .o888oo oooo   .ooooo.   .oooo.o
//  888 .8P'   `888  `888P"Y88b  d88' `88b `888P"Y88bP"Y88b  `P  )88b    888   `888  d88' `"Y8 d88(  "8
//  888888.     888   888   888  888ooo888  888   888   888   .oP"888    888    888  888       `"Y88b.
//  888 `88b.   888   888   888  888    .o  888   888   888  d8(  888    888 .  888  888   .o8 o.  )88b
// o888o o888o o888o o888o o888o `Y8bod8P' o888o o888o o888o `Y888""8o   "888" o888o `Y8bod8P' 8""888P'




class IK {

	constructor( material ) {

		this.rnd = 0.2 + Math.random() * 999;
		this.base = new THREE.Vector3();
		this.direction = new THREE.Vector3();

		this.num_segments = 6;
		this.length = this.num_segments;
		this.segmentLength = this.length / this.num_segments;
		this.segments = [];

		this.initSegments( material );

	}

	initSegments( material ) {

		this.segments[ 0 ] = new Segment( this.base, this.direction, this.segmentLength, material );

		for ( let i = 1; i < this.num_segments; i ++ ) {

			this.segments[ i ] = new Segment(
				this.segments[ i - 1 ].pointB,
				this.direction,
				this.segmentLength,
				material
			);

		}

	}

	pointSegments( target ) {

		this.segments[ this.segments.length - 1 ].follow( target );

		for ( let i = this.segments.length - 2; i >= 0; i -- ) {

			this.segments[ i ].follow( this.segments[ i + 1 ].pointA );

		}

	}

	translateToBase() {

		this.segments[ 0 ].setA( this.base );

		for ( let i = 1; i < this.segments.length; i ++ ) {

			this.segments[ i ].setA( this.segments[ i - 1 ].pointB );

		}

	}

	setLength( length ) {

		this.length = length;
		this.segmentLength = this.length / this.num_segments;

		this.segments.forEach( segment => {

			segment.setLength( this.segmentLength );

		} );

	}

	show() {

		this.segments.forEach( segment => {

			segment.show();

		} );

	}

}






// ooooo oooo    oooo       .oooooo..o                                                                  .
// `888' `888   .8P'       d8P'    `Y8                                                                .o8
//  888   888  d8'         Y88bo.       .ooooo.   .oooooooo ooo. .oo.  .oo.    .ooooo.  ooo. .oo.   .o888oo
//  888   88888[            `"Y8888o.  d88' `88b 888' `88b  `888P"Y88bP"Y88b  d88' `88b `888P"Y88b    888
//  888   888`88b.              `"Y88b 888ooo888 888   888   888   888   888  888ooo888  888   888    888
//  888   888  `88b.       oo     .d8P 888    .o `88bod8P'   888   888   888  888    .o  888   888    888 .
// o888o o888o  o888o      8""88888P'  `Y8bod8P' `8oooooo.  o888o o888o o888o `Y8bod8P' o888o o888o   "888"
//                                               d"     YD
//                                               "Y88888P'



class Segment {

	constructor( base, dir, len, material ) {

		this.length = len;
		this.direction = dir.clone();
		this.direction.setLength( this.length );

		this.target = new THREE.Vector3();
		this.pointA = base.clone();

		this.pointB = new THREE.Vector3();
		this.pointB.copy( this.pointA );
		this.pointB.add( this.direction );

		//set repeat
		material.roughnessMap.repeat.set( 2, len * 50 );
		material.normalMap.repeat.set( 2, len * 50 );
		material.metalnessMap.repeat.set( 2, len * 50 );
		material.map.repeat.set( 2, len * 100 );

		this.object = new THREE.Mesh(
			new THREE.CylinderBufferGeometry( 0.1, 0.1, 1, 8, 16, true ),
			material
		);
		this.object.geometry.translate( 0, 0.5, 0 );
		this.object.visible = true;
		this.object.frustumCulled = false;
		this.object.updateMatrixWorld();
		scene.add( this.object );


	}

	follow( t ) {

		this.target.copy( t );

		this.pointB.copy( this.target );

		this.direction.copy( this.pointB );
		this.direction.sub( this.pointA );
		this.direction.setLength( this.length );


		this.pointA.subVectors( this.pointB, this.direction );


	}

	calculateB() {

		this.pointB.copy( this.pointA );
		this.pointB.add( this.direction );

	}

	setA( base ) {

		this.pointA.copy( base );
		this.calculateB();

	}

	setLength( length ) {

		this.length = length;
		this.direction.setLength( this.length );

		//set repeat
		this.object.material.roughnessMap.repeat.set( 2, length * 0.75 );
		this.object.material.normalMap.repeat.set( 2, length * 0.75 );
		this.object.material.metalnessMap.repeat.set( 2, length * 0.75 );
		this.object.material.displacementMap.repeat.set( 2, length * 0.75 );
		this.object.material.map.repeat.set( 2, length * 0.75 );

	}

	show() {

		this.object.scale.y = this.length;
		this.object.position.copy( this.pointA.clone() );
		this.object.quaternion.setFromUnitVectors( scene.up, this.direction.clone().normalize() );

		this.object.visible = true;

	}

	hide() {

		this.object.visible = false;
		this.object.scale.y = 1;

	}

}









// ooooooooo.
// `888   `Y88.
//  888   .d88'  .ooooo.  oo.ooooo.   .ooooo.
//  888ooo88P'  d88' `88b  888' `88b d88' `88b
//  888`88b.    888   888  888   888 888ooo888
//  888  `88b.  888   888  888   888 888    .o
// o888o  o888o `Y8bod8P'  888bod8P' `Y8bod8P'
//                         888
//                        o888o

class Rope extends IK {

	constructor() {

		let loader = new THREE.TextureLoader();
		let material = new THREE.MeshStandardMaterial( {
			map: loader.load( "./resources/img/ropeTexture/ropeDiff.png" ),
			displacementMap: loader.load( "./resources/img/ropeTexture/ropeDisplacement.png" ),
			metalnessMap: loader.load( "./resources/img/ropeTexture/ropeMetalic.png" ),
			normalMap: loader.load( "./resources/img/ropeTexture/ropeNormal.png" ),
			roughnessMap: loader.load( "./resources/img/ropeTexture/ropeRoughness.png" ),
			color: 'rgb( 50, 50, 50)',
			side: THREE.DoubleSide
		} );

		material.map.wrapT = material.map.wrapS = THREE.RepeatWrapping;

		material.displacementMap.wrapT = material.displacementMap.wrapS = THREE.RepeatWrapping;
		material.displacementScale = 0.05;

		material.metalnessMap.wrapT = material.metalnessMap.wrapS = THREE.RepeatWrapping;

		material.normalMap.wrapT = material.normalMap.wrapS = THREE.RepeatWrapping;

		material.roughnessMap.wrapT = material.roughnessMap.wrapS = THREE.RepeatWrapping;

		super( material );

	}

	update( base, target ) {

		this.base.copy( base );

		this.pointSegments( target );

		this.translateToBase();

		this.show();


	}

	set( base, length ) {

		this.base.copy( base );

		this.segments[ this.segments.length - 1 ].follow( base );

		this.setLength( length * 0.8 );

	}

	hide() {

		for ( let i = 0; i < this.segments.length; i ++ ) {

			this.segments[ i ].hide();

		}

	}

}
