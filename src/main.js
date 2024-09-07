const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

canvas.width = 1280 * 0.7;
canvas.height = 720 * 0.7;
const background = new Image();
background.src = 'assets/background3.jpg';

// Player settings
const playerWidth = 50;
const playerHeight = 50;
const playerSpeed = 10;
const gravity = 1;
const jumpStrength = 20;
const centerX = (canvas.width / 2) - (playerWidth / 2);
const groundY = canvas.height - 2.5 * playerHeight;

const player1 = {
    x: centerX - 260,
    y: groundY,
    width: playerWidth,
    height: playerHeight,
    color: 'red',
    speed: playerSpeed,
    velocityY: 0,
    isJumping: false,
    isOnGround: true,
    health: 100,
};

const player2 = {
    x: centerX + 260,
    y: groundY,
    width: playerWidth,
    height: playerHeight,
    color: 'blue',
    speed: playerSpeed,
    velocityY: 0,
    isJumping: false,
    isOnGround: true,
    health: 100,
};

// Movement
var allowKeyEvents = false;
const keys = {};

function drawPlayer(character) {
    context.fillStyle = character.color;
    context.fillRect(character.x, character.y, character.width, character.height);
}

function updatePlayer(character) {
    // Gravity
    if (!character.isOnGround) {
        character.velocityY += gravity;
        character.y += character.velocityY;
    }

    // Player is on the ground
    if (character.y >= groundY) {
        character.isOnGround = true;
        character.velocityY = 0;
        character.y = groundY;
    }

    drawPlayer(character);
}

function drawBackground() {
    context.drawImage(background, 0, 0, canvas.width, canvas.height);
}

function update() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    if (allowKeyEvents) {
        updatePlayer(player1);
        updatePlayer(player2);
    }
}

function movePlayers() {
    if (allowKeyEvents) {
        if (keys['q'] && player1.x > 0) player1.x -= player1.speed;
        if (keys['d'] && player1.x + player1.width < canvas.width) player1.x += player1.speed;

        if (keys['ArrowLeft'] && player2.x > 0) player2.x -= player2.speed;
        if (keys['ArrowRight'] && player2.x + player2.width < canvas.width) player2.x += player2.speed;

        // Jumping logic
        if (keys['z'] && player1.isOnGround) {
            player1.isJumping = true;
            player1.isOnGround = false;
            player1.velocityY = -jumpStrength;
        }

        if (keys['ArrowUp'] && player2.isOnGround) {
            player2.isJumping = true;
            player2.isOnGround = false;
            player2.velocityY = -jumpStrength;
        }
    }
}

function keyDownHandler(event) {
    if (event.key === 'Enter' && !allowKeyEvents) {
        startGame();
    } else if (allowKeyEvents) {
        keys[event.key] = true;
        movePlayers();
    }
}

function keyUpHandler(event) {
    keys[event.key] = false;
}

window.addEventListener('keydown', keyDownHandler);
window.addEventListener('keyup', keyUpHandler);

// Timer
var timeLeft = 60;
const timerElement = document.querySelector('.timer');
const resultElement = document.querySelector('.result');

function updateTimer() {
    timerElement.textContent = timeLeft;
}

const timerInterval = setInterval(() => {
    if (timeLeft > 0 && allowKeyEvents) {
        timeLeft--;
        updateTimer();
    } else if (timeLeft <= 0) {
        clearInterval(timerInterval);
        checkWin(true);
    }
}, 1000);

function checkWin(timeUp = false) {
    if (player1.health <= 0) {
        displayResult("Player 2 Wins!");
    } else if (player2.health <= 0) {
        displayResult("Player 1 Wins!");
    } else if (timeUp) {
        if (player1.health > player2.health) {
            displayResult("Player 1 Wins!");
        } else if (player2.health > player1.health) {
            displayResult("Player 2 Wins!");
        } else {
            displayResult("It's a Draw!");
        }
    }
}

var gameloopId;

function displayResult(message) {
    resultElement.textContent = message;
    resultElement.style.display = 'block';
    cancelAnimationFrame(gameloopId); 
    window.removeEventListener('keydown', keyDownHandler);
    window.removeEventListener('keyup', keyUpHandler);
}

function gameLoop() {
    movePlayers();
    update();
    gameloopId = requestAnimationFrame(gameLoop);
}

function startGame() {
    const startMessage = document.querySelector('.start-message');
    startMessage.style.display = 'none';
    allowKeyEvents = true;
    gameLoop();
}

// Initialize game
function initializeGame() {
    drawBackground();
    updateTimer();
}

initializeGame();
