// canvas config
const { body } = document;
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

const canvasWidth = 400;
const canvasHeight = 500;
const screenWidth = window.screen.width;
const canvasPositionX = (screenWidth - canvasWidth) / 2;
const isMobile = window.matchMedia('(max-width: 600px)');

// paddles config
const paddleHeight = 10;
const paddleWidth = 50;
const paddleDiff = 25;
let playerPaddleX = (canvasWidth - paddleWidth) / 2;
let compPaddleX = (canvasWidth - paddleWidth) / 2;
let playerMoved = false;
let paddleTouched = false;

// ball config
let ballRadius = 5;
let ballX = canvasWidth / 2;
let ballY = canvasHeight / 2;

// score and computer config
const winningScore = 5;
let playerScore = 0;
let compScore = 0;
let compSpeed;
let ballSpeedX;
let ballSpeedY;
let trajectoryX;

// change mobile settings
if (isMobile.matches) {
	ballSpeedY = -2;
	ballSpeedX = ballSpeedY;
	compSpeed = 4;
} else {
	ballSpeedY = -1;
	ballSpeedX = ballSpeedY;
	compSpeed = 3;
}

// overall game config
const gameOverPopup = document.createElement('div');
let isGameOver = true;
let isNewGame = true;

// CREATE CANVAS
const drawCanvas = () => {
	//game board
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, canvasWidth, canvasHeight);

	//paddles
	ctx.fillStyle = 'white';
	ctx.fillRect(
		playerPaddleX,
		canvasHeight - 10 - paddleHeight,
		paddleWidth,
		paddleHeight
	);
	ctx.fillRect(compPaddleX, 10, paddleWidth, paddleHeight);

	//middle line
	ctx.beginPath();
	ctx.setLineDash([6]);
	ctx.moveTo(0, canvasHeight / 2);
	ctx.lineTo(canvasWidth, canvasHeight / 2);
	ctx.strokeStyle = 'grey';
	ctx.stroke();

	//ball
	ctx.beginPath();
	ctx.arc(ballX, ballY, ballRadius, 2 * Math.PI, false);
	ctx.fillStyle = 'white';
	ctx.fill();

	//score
	ctx.font = '32px Courier New';
	ctx.fillText(playerScore, 20, canvasHeight / 2 + 50);
	ctx.fillText(compScore, 20, canvasHeight / 2 - 30);
};

const createCanvas = () => {
	canvas.width = canvasWidth;
	canvas.height = canvasHeight;
	body.appendChild(canvas);
	drawCanvas();
};

// BALL BEHAVIOUR
const ballReset = () => {
	ballX = canvasWidth / 2;
	ballY = canvasHeight / 2;
	ballSpeedY = -3;
	paddleTouched = false;
};

const ballMove = () => {
	if (playerMoved && paddleTouched) {
		ballX += ballSpeedX;
	}
	ballY += -ballSpeedY;
};

const ballBoundaries = () => {
	// bounce off left wall
	if (ballX < 0 && ballSpeedX < 0) {
		ballSpeedX = -ballSpeedX;
	}
	// bounce off right wall
	if (ballX > canvasWidth && ballSpeedX > 0) {
		ballSpeedX = -ballSpeedX;
	}
	// bounce off player paddle (bottom)
	if (ballY > canvasHeight - paddleDiff) {
		if (ballX > playerPaddleX && ballX < playerPaddleX + paddleWidth) {
			paddleTouched = true;
			// add ball speed on Hit
			if (playerMoved) {
				ballSpeedY -= 1;
				// max ball speed
				if (ballSpeedY < -5) {
					ballSpeedY = -5;
					compSpeed = 6;
				}
			}
			ballSpeedY = -ballSpeedY;
			trajectoryX = ballX - (playerPaddleX + paddleDiff);
			ballSpeedX = trajectoryX * 0.3;
		} else if (ballY > canvasHeight) {
			// reset ball, add to computer score
			ballReset();
			compScore++;
		}
	}
	// bounce off computer paddle (top)
	if (ballY < paddleDiff) {
		if (ballX > compPaddleX && ballX < compPaddleX + paddleWidth) {
			// add ball speed on hit
			if (playerMoved) {
				ballSpeedY += 1;
				// max ball speed
				if (ballSpeedY > 5) {
					ballSpeedY = 5;
				}
			}
			ballSpeedY = -ballSpeedY;
		} else if (ballY < 0) {
			// reset ball, add to player score
			ballReset();
			playerScore++;
		}
	}
};

// COMPUTER PLAY
const computerAI = () => {
	if (playerMoved) {
		if (compPaddleX + paddleDiff < ballX) {
			compPaddleX += compSpeed;
		} else {
			compPaddleX -= compSpeed;
		}
	}
};

// HANDLE GAME OVER
const showGameOverPopup = winner => {
	canvas.hidden = true;

	gameOverPopup.textContent = '';
	gameOverPopup.classList.add('game-over-popup');
	const result = document.createElement('h1');
	result.textContent = `${winner} wins!`;
	const playAgainBtn = document.createElement('button');
	playAgainBtn.textContent = 'Play again';
	gameOverPopup.append(result, playAgainBtn);
	body.appendChild(gameOverPopup);
	playAgainBtn.addEventListener('click', startGame);
};

const gameOver = () => {
	if (playerScore === winningScore || compScore === winningScore) {
		isGameOver = true;
		const winner = playerScore === winningScore ? 'Player' : 'Computer';
		showGameOverPopup(winner);
	}
};

// ANIMATE CHANGES ON CANVAS
const animate = () => {
	drawCanvas();
	ballMove();
	ballBoundaries();
	computerAI();
	gameOver();
	if (!isGameOver) {
		window.requestAnimationFrame(animate); //smoother than with setInterval
	}
};

// START GAME
const startGame = () => {
	if (isGameOver && !isNewGame) {
		body.removeChild(gameOverPopup);
		canvas.hidden = false;
	}

	isGameOver = false;
	isNewGame = false;

	// reset game progress
	ballReset();
	playerScore = 0;
	compScore = 0;
	createCanvas();

	animate();
	// setInterval(animate, 1000 / 60);

	canvas.addEventListener('mousemove', e => {
		// set paddle's position with each move
		playerMoved = true;
		playerPaddleX = e.offsetX;

		// do not let paddle go out of the game board
		if (playerPaddleX < paddleDiff) {
			playerPaddleX = 0;
		}

		if (playerPaddleX > canvasWidth - paddleWidth) {
			playerPaddleX = canvasWidth - paddleWidth;
		}

		// hide cursor while moving paddle
		canvas.style.cursor = 'none';
	});
};

// ON LOAD
startGame();
