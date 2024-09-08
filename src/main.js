const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

canvas.width = 1280 * 0.7;
canvas.height = 720 * 0.7;
const background = new Image();
background.src = 'assets/background3.jpg';


// Player settings 
const playerWidth = 500;  
const playerHeight = 500; 
const playerSpeed = 10;
const gravity = 1;
const jumpStrength = 20;
const centerX = (canvas.width / 2) - (playerWidth / 2);
const groundY = canvas.height - 400 ;

const player1 = {
    x: centerX - 260,
    y: -100,
    width: playerWidth,
    height: playerHeight,
    speed: playerSpeed,
    velocityY: 0,
    isJumping: true,
    isOnGround: false,
    isAttacking: false,
    hasDeathAnimationPlayed: false,
    health: 100,
    displayedHealth: 100,  // Added for smooth animation of health bar
    state: 'idle', 
    frameIndex: 0,
    frameElapsedTime: 0,
    frameDuration: 90,
    image: new Image(),
    facingDirection: 'right', // Added for facing direction
    states: {
        idle: { imageSrc: 'assets/idle-player1.png', frames: 8, frameDuration: 90 },
        run: { imageSrc: 'assets/run-player1.png', frames: 8, frameDuration: 90 },
        jump: { imageSrc: 'assets/jump-player1.png', frames: 2, frameDuration: 90 },
        fall: { imageSrc: 'assets/fall-player1.png', frames: 2, frameDuration: 90 },
        attack: { imageSrc: 'assets/attack-player1.png', frames: 6, frameDuration: 200 },
        death: { imageSrc: 'assets/death-player1.png', frames: 6, frameDuration: 90 },
    },
};

const player2 = {
    x: centerX + 260,
    y: -100,
    width: playerWidth,
    height: playerHeight,
    speed: playerSpeed,
    velocityY: 0,
    isJumping: true,
    isOnGround: false,
    isAttacking: false,
    hasDeathAnimationPlayed: false,
    health: 100,
    displayedHealth: 100,
    state: 'idle',
    frameIndex: 0,
    frameElapsedTime: 0,
    frameDuration: 110,
    image: new Image(),
    facingDirection: 'right', // Added for facing direction
    states: {
        idle: { imageSrc: 'assets/idle-player2.png', frames: 4, frameDuration: 90 },
        run: { imageSrc: 'assets/run-player2.png', frames: 8, frameDuration: 90 },
        jump: { imageSrc: 'assets/jump-player2.png', frames: 2, frameDuration: 90 },
        fall: { imageSrc: 'assets/fall-player2.png', frames: 2, frameDuration: 90 },
        attack: { imageSrc: 'assets/attack-player2.png', frames: 4, frameDuration: 250 }, // Increased frameDuration
        death: { imageSrc: 'assets/death-player2.png', frames: 7, frameDuration: 90 },
    },
};

// Load images for players
player1.image.src = player1.states.idle.imageSrc;
player2.image.src = player2.states.idle.imageSrc;
player1.image.onload = () => player1.imageLoaded = true;
player2.image.onload = () => player2.imageLoaded = true;

var allowKeyEvents = false;
const keys = {};

// Animation function
function updateAnimation(character) {
    if (character.state) {
        if (character.state === 'death') {
            if (!character.hasDeathAnimationPlayed) {
                character.frameElapsedTime += 20;
                if (character.frameElapsedTime >= character.states[character.state].frameDuration) {
                    character.frameElapsedTime = 0;
                    character.frameIndex = (character.frameIndex + 1) % character.states[character.state].frames;
                    
                    // Check if the animation has finished playing
                    if (character.frameIndex === 0) {
                        character.hasDeathAnimationPlayed = true; // Mark animation as played
                        character.frameIndex = character.states[character.state].frames - 1;
                    }
                }
            }
        } else {
            // Handle other states
            character.frameElapsedTime += 20;
            if (character.frameElapsedTime >= character.states[character.state].frameDuration) {
                character.frameElapsedTime = 0;
                character.frameIndex = (character.frameIndex + 1) % character.states[character.state].frames;
            }
        }
    }
}


function switchSprite(character, action, direction) {
    if (character.state !== action || character.facingDirection !== direction) {
        character.state = action;
        character.image.src = character.states[action].imageSrc;
        character.frameIndex = 0;
        character.facingDirection = direction; // Update facing direction
    }
}

function drawPlayer(character) {
    if (character.imageLoaded) {
        updateAnimation(character);
        const frameWidth = character.image.width / character.states[character.state].frames;
        const frameHeight = character.image.height;

        // Draw image based on facing direction
        if (character.facingDirection === 'right') {
            context.drawImage(
                character.image,
                frameWidth * character.frameIndex,
                0,
                frameWidth,
                frameHeight,
                character.x,
                character.y,
                character.width,
                character.height
            );
        } else {
            // Flip image horizontally
            context.save();
            context.translate(character.x + character.width, character.y);
            context.scale(-1, 1);
            context.drawImage(
                character.image,
                frameWidth * character.frameIndex,
                0,
                frameWidth,
                frameHeight,
                0,
                0,
                character.width,
                character.height
            );
            context.restore();
        }
    }
}




const playerHealthElement = document.querySelector('.player');
const enemyHealthElement = document.querySelector('.ennemy');

function drawHealthBar(character, element) {
    const decreaseSpeed = 0.5; 
    if (character.displayedHealth > character.health) {
        character.displayedHealth = Math.max(character.displayedHealth - decreaseSpeed, character.health);
    }

    const barWidth = 50; 
    const barHeight = 10; 
    const healthPercentage = character.displayedHealth / 100;

    
    context.fillStyle = 'black';
    context.fillRect(character.x + 225, character.y + 160, barWidth, barHeight);
    context.fillStyle = 'red';
    context.fillRect(character.x + 225, character.y + 160, barWidth * healthPercentage, barHeight);

    

    if (element) {
        element.style.width = (healthPercentage * 100) + '%';
    }
}


// Function to draw the attack square and check for collisions
function drawAttack(character) {
    const attackSize = 100;
    let attackX;

    if (character.isAttacking) {
        if (character === player1) {
            attackX = character.x ; 
        } else if (character === player2) {
            attackX = character.x + 370; 
        }

        const attackY = character.y + character.height / 2 - attackSize / 2; 
        context.fillStyle = character.color;
        context.fillRect(attackX, attackY, attackSize, attackSize);

        // Check for collision with the opponent and decrease health if hit
        const opponent = character === player1 ? player2 : player1;
        if (checkCollision(attackX, attackY, attackSize, character, opponent)) {
            opponent.health -= 7;
            console.log(`${opponent === player1 ? 'Player1' : 'Player2'} Health: ${opponent.health}`);
            opponent.health = Math.max(opponent.health, 0);
        }

        character.isAttacking = false;
    }
}

// Function to check if two rectangles overlap (collision detection)
function checkCollision(attackX, attackY, attackSize, player, opponent) {
    // Check if player is facing the opponent
    const isFacingOpponent = (player === player1 && player.facingDirection === 'right' && player.x < opponent.x) ||
                             (player === player1 && player.facingDirection === 'left' && player.x > opponent.x) ||
                             (player === player2 && player.facingDirection === 'right' && player.x > opponent.x) ||
                             (player === player2 && player.facingDirection === 'left' && player.x < opponent.x);

    if (!isFacingOpponent) {
        return false; // No collision if not facing the opponent
    }

    // Collision detection logic
    return attackX < opponent.x + opponent.width &&
           attackX + attackSize > opponent.x &&
           attackY < opponent.y + opponent.height &&
           attackY + attackSize > opponent.y;
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

    // Determine image state
    if (character.health <= 0) {
        character.isDead = true;
        switchSprite(character, 'death', character.facingDirection);
    } else if (character.isAttacking) {
        switchSprite(character, 'attack', character.facingDirection);
    } else if (character.velocityY < 0) {
        switchSprite(character, 'jump', character.facingDirection);
    } else if (character.velocityY > 0) {
        switchSprite(character, 'fall', character.facingDirection);
    } else if ((keys['q'] && character === player1) || 
               (keys['d'] && character === player1) || 
               (keys['ArrowLeft'] && character === player2) || 
               (keys['ArrowRight'] && character === player2)) {
        switchSprite(character, 'run', character.facingDirection);
    } else {
        switchSprite(character, 'idle', character.facingDirection);
    }

    drawPlayer(character);
    drawHealthBar(character, character === player1 ? playerHealthElement : enemyHealthElement);
    drawAttack(character);
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

        // Draw attack squares
        if (player1.isAttacking) {
            drawAttack(player1);
        }
        if (player2.isAttacking) {
            drawAttack(player2);
        }

        // Check for win condition
        if (player1.health <= 0 || player2.health <= 0) {
            checkWin();
        }
    }
}

function movePlayers() {
    if (allowKeyEvents) {
        // Player 1 Movement
        if (keys['q'] && player1.x > -230) {
            player1.x -= player1.speed;
            player1.facingDirection = 'left'; // Update facing direction
        }
        if (keys['d'] && player1.x + player1.width < canvas.width + 230) {
            player1.x += player1.speed;
            player1.facingDirection = 'right'; // Update facing direction
        }

        // Player 2 Movement
        if (keys['ArrowLeft'] && player2.x > -230) {
            player2.x -= player2.speed;
            player2.facingDirection = 'right'; // Update facing direction
        }
        if (keys['ArrowRight'] && player2.x + player2.width < canvas.width + 230) {
            player2.x += player2.speed;
            player2.facingDirection = 'left'; // Update facing direction
        }

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

function attack(character) {
    if (!character.isAttacking) {
        character.isAttacking = true;
        // Maintain the current facing direction during attack
        switchSprite(character, 'attack', character.facingDirection); 
        setTimeout(() => {
            character.isAttacking = false;
            // Switch back to idle, maintaining the facing direction
            if (character.state !== 'attack') {
                switchSprite(character, 'idle', character.facingDirection);
            }
        }, character.states.attack.frameDuration * character.states.attack.frames); // Correct duration calculation
    }
}

function keyDownHandler(event) {
    if (event.key === 'Enter' && !allowKeyEvents) {
        startGame();
    } else if (allowKeyEvents) {
        keys[event.key] = true;
        movePlayers();

        // Attack logic for player1 (Space key)
        if (event.key === ' ') {
            // switchSprite(player1, 'attack')

            attack(player1);
        }

        // Attack logic for player2 (0 key)
        if (event.key === '0') {
            // switchSprite(player2, 'attack')
            attack(player2);
        }
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
        clearInterval(timerInterval); 
    } else if (player2.health <= 0) {
        displayResult("Player 1 Wins!");
        clearInterval(timerInterval); 
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
