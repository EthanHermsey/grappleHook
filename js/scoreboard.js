
class Scoreboard {

	constructor( savedScoreboard, levelNames, levelCategories ) {

		console.log( typeof ( savedScoreboard ) );

		this.scores = ( Array.isArray( savedScoreboard ) ) ? savedScoreboard : [];

		this.levelNames = levelNames;
		this.levelCategories = levelCategories;

	}

	reset() {

		this.scores = [];
		this.save();
		this.updateScoreboardGrid();

	}

	save() {

		localStorage.setItem( 'grappleHookScoreboard', JSON.stringify( this.scores ) );

	}

	addScore( category, level, score, min, sec, millis ) {

		if ( ! this.scores[ category ] ) this.scores[ category ] = [];

		if ( ! this.scores[ category ][ level ] || score < this.scores[ category ][ level ].score ) {

			this.scores[ category ][ level ] = {
				score: score,
				min: min,
				sec: sec,
				millis: millis
			};

		}

	}







	saveScore() {

		//get time
		let time = game.time;

		let min = Math.floor( Math.floor( ( game.time * 0.01 ) ) / 60 ) || 0;
		let sec = Math.floor( ( game.time * 0.01 ) ) % 60 || 0;
		let millis = time.toString().slice( - 2 );

		if ( sec < 10 ) sec = "0" + sec;

		let timeString = `<span id="sec">${sec}</span>:` + `<span id="milli">${millis}</span>`;
		if ( min > 0 ) timeString = `<span id="min">${min}</span>:` + timeString;

		//check if new record
		this.addScore( game.category, game.level, time, min, sec, millis );

		//display scores
		document.getElementById( 'levelTime' ).innerHTML = timeString;


		//level record
		let recordString = `<span id="sec">${this.scores[ game.category ][ game.level ].sec}</span>:` + `<span id="milli">${this.scores[ game.category ][ game.level ].millis}</span>`;
		if ( this.scores[ game.category ][ game.level ].min > 0 ) recordString = `<span id="min">${this.scores[ game.category ][ game.level ].min}</span>:` + recordString;
		document.getElementById( 'scoreboardTime' ).innerHTML = recordString;

		this.save();

		this.updateScoreboardGrid();

	}








	updateScoreboardGrid() {

		//update scoreboard grid on main menu
		let grid = document.getElementById( 'scoreboardGrid' );
		grid.className = '';
		grid.innerHTML = '';



		for ( let i = 0; i < this.levelCategories.length; i ++ ) {

			let categoryDiv = document.createElement( 'div' );
			categoryDiv.id = 'levelCategory';

			let categoryTitle = document.createElement( 'p' );
			categoryTitle.textContent = this.levelCategories[ i ];
			categoryTitle.style.gridColumn = 'span 3';
			categoryTitle.id = 'levelCategoryTitle';
			categoryDiv.appendChild( categoryTitle );

			for ( let j = 0; j < this.levelNames[ this.levelCategories[ i ] ].length; j ++ ) {

				let pb = document.createElement( 'div' );
				let p1 = document.createElement( 'p' );
				let p2 = document.createElement( 'p' );

				pb.id = 'playbutton';
				pb.onclick = function () {

					game.category = i;
					game.level = j;
					game.start();

				};

				//level name
				p1.textContent = this.levelNames[ this.levelCategories[ i ] ][ j ];

				if ( this.scores[ i ] && this.scores[ i ][ j ] ) {

					let timeString = `<span id="sec">${this.scores[ i ][ j ].sec}</span>:` + `<span id="milli">${this.scores[ i ][ j ].millis}</span>`;
					if ( this.scores[ i ][ j ].min > 0 ) timeString = `<span id="min">${this.scores[ i ][ j ].min}</span>:` + timeString;

					p2.innerHTML = timeString;

				} else {

					p2.textContent = '--:--:--';

				}

				categoryDiv.appendChild( pb );
				categoryDiv.appendChild( p1 );
				categoryDiv.appendChild( p2 );

			}

			grid.appendChild( categoryDiv );

		}

	}

}
