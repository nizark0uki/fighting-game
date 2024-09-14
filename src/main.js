const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

canvas.width = 1280;
canvas.height = 610;
const background = new Image();
background.src = 'assets/background.jpg';


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
    lastAttackTime: 0,
    hasDeathAnimationPlayed: false,
    health: 100,
    displayedHealth: 100,  
    state: 'idle', 
    frameIndex: 0,
    frameElapsedTime: 0,
    image: new Image(),
    facingDirection: 'right', 
    states: {
        idle: { imageSrc: 'assets/idle-player1.png', frames: 8, frameDuration: 90 },
        run: { imageSrc: 'assets/run-player1.png', frames: 8, frameDuration: 90 },
        jump: { imageSrc: 'assets/jump-player1.png', frames: 2, frameDuration: 90 },
        fall: { imageSrc: 'assets/fall-player1.png', frames: 2, frameDuration: 90 },
        attack: { imageSrc: 'assets/attack-player1.png', frames: 2, frameDuration: 250 },
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
    lastAttackTime: 0,
    hasDeathAnimationPlayed: false,
    health: 100,
    displayedHealth: 100,
    state: 'idle',
    frameIndex: 0,
    frameElapsedTime: 0,
    image: new Image(),
    facingDirection: 'right', 
    states: {
        idle: { imageSrc: 'assets/idle-player2.png', frames: 4, frameDuration: 110 },
        run: { imageSrc: 'assets/run-player2.png', frames: 8, frameDuration: 90 },
        jump: { imageSrc: 'assets/jump-player2.png', frames: 2, frameDuration: 90 },
        fall: { imageSrc: 'assets/fall-player2.png', frames: 2, frameDuration: 90 },
        attack: { imageSrc: 'assets/attack-player2.png', frames: 4, frameDuration: 50 },
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
                        character.hasDeathAnimationPlayed = true; 
                        character.frameIndex = character.states[character.state].frames - 1;
                    }
                }
            }
        } else {
            
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
        character.facingDirection = direction; 
    }
}

function drawPlayer(character) {
    if (character.imageLoaded) {
        updateAnimation(character);
        const frameWidth = character.image.width / character.states[character.state].frames;
        const frameHeight = character.image.height;

        // player 2 sprite position     
        var verticalOffset = 0;
        if (character === player2){
                verticalOffset = -13;
        }
        

        // Draw image based on facing direction
        if (character.facingDirection === 'right') {
            context.drawImage(
                character.image,
                frameWidth * character.frameIndex,
                0,
                frameWidth,
                frameHeight,
                character.x,
                character.y + verticalOffset,  // Apply vertical offset
                character.width,
                character.height
            );
        } else {
            // Flip image horizontally
            context.save();
            context.translate(character.x + character.width, character.y + verticalOffset);  // Apply vertical offset
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




// health bar

const playerHealthElement = document.querySelector('.player');
const enemyHealthElement = document.querySelector('.ennemy');

function drawHealthBar(character, element) {
    const decreaseSpeed = 0.5; 
    if (character.displayedHealth > character.health) {
        character.displayedHealth = Math.max(character.displayedHealth - decreaseSpeed, character.health);
    }

    // const barWidth = 50; 
    // const barHeight = 10; 
    const healthPercentage = character.displayedHealth / 100;

    
    // context.fillStyle = 'black';
    // context.fillRect(character.x + 225, character.y + 160, barWidth, barHeight);
    // context.fillStyle = 'red';
    // context.fillRect(character.x + 225, character.y + 160, barWidth * healthPercentage, barHeight);

    

    if (element) {
        element.style.width = (healthPercentage * 100) + '%';
    }
}


// Function to draw the attack square and check for collisions


function drawAttack(character) {
    const attackSize = 120;
    let attackX, attackY;

    if (character.isAttacking) {
        if (character === player1) {
            player1.facingDirection === 'right'?attackX = character.x + 90 : attackX = character.x + 300; 
        } else if (character === player2) {
            player2.facingDirection === 'right'?attackX = character.x + 300 : attackX = character.x + 90;
        }

       
        const opponent = character === player1 ? player2 : player1;
        if (opponent.isOnGround) {
            attackY = character.y + character.height / 2 - attackSize / 2; 
        } else {
            attackY = character.y + character.height / 2 - attackSize / 2 - 500; 
        }



        // Check for collision with the opponent and decrease health if hit
        if (checkCollision(attackX, attackY, attackSize, character, opponent)) {
            opponent.health -= 7;
            opponent.health = Math.max(opponent.health, 0);

            // damage effect
            const effect = document.querySelector('.effect');
            effect.style.display = 'block';
            setTimeout(() => {
                effect.style.display = 'none';
            }, 100);

        }


        character.isAttacking = false;
    }
}



// Collision detection


function checkCollision(attackX, attackY, attackSize, player, opponent) {
    // Check if player is facing the opponent
    const isFacingOpponent = (player === player1 && player.facingDirection === 'right' && player.x < opponent.x) ||
                             (player === player1 && player.facingDirection === 'left' && player.x > opponent.x) ||
                             (player === player2 && player.facingDirection === 'right' && player.x > opponent.x) ||
                             (player === player2 && player.facingDirection === 'left' && player.x < opponent.x);

    if (!isFacingOpponent) {
        return false; 
    }

    if (!(player.isOnGround || opponent.isOnGround)){
        return attackX < opponent.x + opponent.width &&
        attackX + attackSize > opponent.x
    }
    
    
    return attackX < opponent.x + opponent.width &&
    attackX + attackSize > opponent.x &&
    attackY +400 > opponent.y + opponent.height  &&        
    attackY + attackSize > opponent.y;
    
}


// update player status


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

    // Stop actions if the player is dead
    if (character.health <= 0) {
        character.isDead = true;
        character.velocityY = 0;
        character.y += 20;
        switchSprite(character, 'death', character.facingDirection);
        drawPlayer(character);
        drawHealthBar(character, character === player1 ? playerHealthElement : enemyHealthElement);
        return;  // Exit early to prevent other state changes
    }

    // Update states based on actions
    if (character.isAttacking) {
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


// Players mouvements

function movePlayers() {
    if (allowKeyEvents) {


        // Player 1 Movement
        if (!player1.isDead) {
            if (keys['q'] && player1.x > -230) {
                player1.x -= player1.speed;
                player1.facingDirection = 'left'; 
            }
            if (keys['d'] && player1.x + player1.width < canvas.width + 230) {
                player1.x += player1.speed;
                player1.facingDirection = 'right'; 
            }

            // Jumping logic for Player 1
            if (keys['z'] && player1.isOnGround) {
                player1.isJumping = true;
                player1.isOnGround = false;
                player1.velocityY = -jumpStrength;
            }
        }


        // Player 2 Movement
        if (!player2.isDead) {
            if (keys['ArrowLeft'] && player2.x > -230) {
                player2.x -= player2.speed;
                player2.facingDirection = 'right'; 
            }
            if (keys['ArrowRight'] && player2.x + player2.width < canvas.width + 230) {
                player2.x += player2.speed;
                player2.facingDirection = 'left'; 
            }

            // Jumping logic for Player 2
            if (keys['ArrowUp'] && player2.isOnGround) {
                player2.isJumping = true;
                player2.isOnGround = false;
                player2.velocityY = -jumpStrength;
            }
        }
    }
}

function attack(character) {
    const currentTime = Date.now();
    const attackCooldown = 200; 

    if (!character.isAttacking && (currentTime - character.lastAttackTime >= attackCooldown)) {


        character.isAttacking = true;
        character.lastAttackTime = currentTime; 
        switchSprite(character, 'attack', character.facingDirection);
        const attackDuration = character.states.attack.frameDuration * character.states.attack.frames;

        
        setTimeout(() => {
            character.isAttacking = false;
            
            if (character.state === 'attack') {
                switchSprite(character, 'idle', character.facingDirection);
            }
        }, attackDuration);

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
            attack(player1);
        }

        // Attack logic for player2 (0 key)
        if (event.key === '0') {
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

const timerElement = document.querySelector('.timer');

var timeLeft = 60;
function updateTimer() {
    timerElement.textContent = timeLeft;
}
updateTimer();


var timerInterval
function startTimer (){
    timerInterval = setInterval(() => {
        if (timeLeft > 0 && allowKeyEvents) {
            timeLeft--;
            updateTimer();
        } else if (timeLeft <= 0) {
            clearInterval(timerInterval);
            checkWin(true);
        }
    }, 1000);
}


function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null; 
    }
}






function checkWin(timeUp = false) {
    const player1Name = document.getElementById('player1Name').value.trim() || "Player 1";
    const player2Name = document.getElementById('player2Name').value.trim() || "Player 2";

    if (player1.health <= 0) {
        displayResult(player2Name + ' Wins!');
        player2.isAttacking = false; 
        stopTimer(); 
    } else if (player2.health <= 0) {
        displayResult(player1Name + ' Wins!');
        stopTimer();
    } else if (timeUp) {
        switchSprite(player1, 'idle', player1.facingDirection);
        switchSprite(player2, 'idle', player2.facingDirection);
        
        // Determine the winner based on health
        if (player1.health > player2.health) {
            displayResult(player1Name + ' Wins!');
        } else if (player2.health > player1.health) {
            displayResult(player2Name + ' Wins!');
        } else {
            displayResult("It's a Draw!");
        }

        stopTimer(); // Stop the timer
    }

    

    
}


const resultElement = document.querySelector('.result');

function displayResult(message) {

    resultElement.textContent = message;
    resultElement.style.display = 'block';
    window.removeEventListener('keydown', keyDownHandler);
    window.removeEventListener('keyup', keyUpHandler);
    Object.keys(keys).forEach(key => {
        keys[key] = false;
    });
    
    window.addEventListener('keydown', handleEscapeKeyForReset);
}

function handleEscapeKeyForReset(event) {
    if (event.key === 'Escape') {
        resetGame();
        window.removeEventListener('keydown', handleEscapeKeyForReset);
    }
}


var gameloopId;

function gameLoop() {
    movePlayers();
    update();
    gameloopId = requestAnimationFrame(gameLoop);
}


const startMessage = document.querySelector('.start-message');

function startGame() {
    if(gameloopId){
        cancelAnimationFrame(gameloopId)
    }
    startMessage.style.display = 'none';
    allowKeyEvents = true;
    gameLoop();
    startTimer();
}







// Restart game

function resetGame() {

    if (timerInterval) {
        clearInterval(timerInterval);
    }

    document.getElementById('player1Name').value = '';
    document.getElementById('player2Name').value = '';
    
    player1.x = centerX - 260;
    player1.y = -100;
    player1.health = 100;
    player1.displayedHealth = 100;
    player1.state = 'idle';
    player1.frameIndex = 0;
    player1.velocityY = 0;
    player1.isOnGround = false;
    player1.isJumping = true;
    player1.isAttacking = false;
    player1.hasDeathAnimationPlayed = false;
    player1.isDead = false;
    player1.speed = playerSpeed;
    player1.image.src = player1.states.idle.imageSrc;
    player1.facingDirection = 'right';

    player2.x = centerX + 260;
    player2.y = -100;
    player2.health = 100;
    player2.displayedHealth = 100;
    player2.state = 'idle';
    player2.frameIndex = 0;
    player2.velocityY = 0;
    player2.isOnGround = false;
    player2.isJumping = true;
    player2.isAttacking = false;
    player2.hasDeathAnimationPlayed = false;
    player2.isDead = false;
    player2.speed = playerSpeed;
    player2.image.src = player2.states.idle.imageSrc;
    player2.facingDirection = 'right';



    
    timeLeft = 60;
    updateTimer();
    drawHealthBar(player1, playerHealthElement);
    drawHealthBar(player2, enemyHealthElement);


    resultElement.style.display = 'none';
    startMessage.style.display = 'block';


    allowKeyEvents = false;
    window.addEventListener('keydown', keyDownHandler);
    window.addEventListener('keyup', keyUpHandler);
}

