
class Scoreboard {

	constructor( savedScoreboard, maxLevels, levelNames ) {

		this.maxLevels = maxLevels;
		this.levels = savedScoreboard.levels;
		this.levelNames = levelNames;

	}

	newScore( level, score, min, sec, millis ) {

		if ( ! this.levels[ level ] || score < this.levels[ level ].score ) {

			this.levels[ level ] = {
				score: score,
				min: min,
				sec: sec,
				millis: millis
			};

		}

	}

	update() {

		//get time
		let time = game.time;

		let min = Math.floor( Math.floor( ( game.time * 0.01 ) ) / 60 ) || 0;
		let sec = Math.floor( ( game.time * 0.01 ) ) % 60 || 0;
		let milliString = game.time.toString();
		let millis = milliString.slice( - 2 );

		if ( sec < 10 ) sec = "0" + sec;

		let timeString = `<span id="sec">${sec}</span>:` + `<span id="milli">${millis}</span>`;
		if ( min > 0 ) timeString = `<span id="min">${min}</span>:` + timeString;

		//check if new record
		this.newScore( game.level, time, min, sec, millis );

		//display scores
		document.getElementById( 'levelTime' ).innerHTML = timeString;


		//level record
		let recordString = `<span id="sec">${this.levels[ game.level ].sec}</span>:` + `<span id="milli">${this.levels[ game.level ].millis}</span>`;
		if ( this.levels[ game.level ].min > 0 ) recordString = `<span id="min">${this.levels[ game.level ].min}</span>:` + recordString;
		document.getElementById( 'scoreboardTime' ).innerHTML = recordString;

		this.save();

		this.updateScoreboardGrid();

	}

	updateScoreboardGrid() {

		//update scoreboard grid on main menu
		let grid = document.getElementById( 'scoreboardGrid' );
		grid.className = '';
		grid.innerHTML = '';

		for ( let i = 0; i < this.maxLevels; i ++ ) {

			let pb = document.createElement( 'div' );
			let p1 = document.createElement( 'p' );
			let p2 = document.createElement( 'p' );

			pb.id = 'playbutton';
			pb.onclick = function () {

				game.level = i;
				game.start();

			};

			//level name
			// p1.textContent = `Level ${i + 1}`;
			p1.textContent = this.levelNames[ i ];

			if ( this.levels[ i ] ) {

				let timeString = `<span id="sec">${this.levels[ i ].sec}</span>:` + `<span id="milli">${this.levels[ i ].millis}</span>`;
				if ( this.levels[ i ].min > 0 ) timeString = `<span id="min">${this.levels[ i ].min}</span>:` + timeString;

				p2.innerHTML = timeString;

			} else {

				p2.textContent = '--:--:--';

			}

			grid.appendChild( pb );
			grid.appendChild( p1 );
			grid.appendChild( p2 );

		}

	}

	reset() {

		this.levels = [];
		this.save();
		this.updateScoreboardGrid();

	}

	save() {

		localStorage.setItem( 'grappleHookScoreboard', JSON.stringify( this ) );

	}

}
