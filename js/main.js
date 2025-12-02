const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const STATE_AIMING = 0;
const STATE_POWERING = 1;
const STATE_SHOOTING = 2;
const STATE_RESULT = 3;

let gameState = STATE_AIMING;
let score = 0;
let attempts = 0;
let message = "";
let messageColor = "#fff";

const COLOR_BALL = "#fff";
const COLOR_GOAL = "#fff";
const COLOR_KEEPER = "#ff00ff";
const COLOR_WALL = "#00ffff";
const COLOR_ACCENT = "#ffcc00";

const goal = {
  x: 100,
  y: 20,
  width: 200,
  height: 10,
};

const ball = {
  x: canvas.width / 2,
  y: canvas.height - 100,
  radius: 8,
  dx: 0,
  dy: 0,
  speed: 0,
};

const keeper = {
  x: canvas.width / 2 - 15,
  y: 40,
  width: 30,
  height: 10,
  speed: 1,
  direction: 1,
};

const wall = {
  x: canvas.width / 2 - 40,
  y: 200,
  width: 80,
  height: 10,
  active: false,
};

let angle = -Math.PI / 2;
let angleSpeed = 0.015;
let maxAngle = -Math.PI / 2 + 0.8;
let minAngle = -Math.PI / 2 - 0.8;

let power = 0;
let powerSpeed = 1;
let maxPower = 100;
let powerDirection = 1;

function handleInput() {
  if (gameState === STATE_AIMING) {
    gameState = STATE_POWERING;
  } else if (gameState === STATE_POWERING) {
    shoot();
  } else if (gameState === STATE_RESULT) {
    resetShot();
  }
}

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") handleInput();
});
canvas.addEventListener("mousedown", handleInput);
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  handleInput();
});

function shoot() {
  gameState = STATE_SHOOTING;

  const speed = (power / 100) * 12 + 3;

  ball.dx = Math.cos(angle) * speed;
  ball.dy = Math.sin(angle) * speed;

  attempts++;
}

function resetShot() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height - 100;
  ball.dx = 0;
  ball.dy = 0;

  gameState = STATE_AIMING;
  power = 0;
  message = "";

  wall.active = Math.random() > 0.5;
  if (wall.active) {
    wall.x = Math.random() * (canvas.width - wall.width - 100) + 50;
  }

  keeper.speed = 1 + score * 0.1;
}

function update() {
  keeper.x += keeper.speed * keeper.direction;
  if (keeper.x <= goal.x || keeper.x + keeper.width >= goal.x + goal.width) {
    keeper.direction *= -1;
  }

  if (gameState === STATE_AIMING) {
    angle += angleSpeed;
    if (angle > maxAngle || angle < minAngle) {
      angleSpeed *= -1;
    }
  } else if (gameState === STATE_POWERING) {
    power += powerSpeed * powerDirection;
    if (power >= maxPower || power <= 0) {
      powerDirection *= -1;
    }
  } else if (gameState === STATE_SHOOTING) {
    ball.x += ball.dx;
    ball.y += ball.dy;

    ball.dx *= 0.99;
    ball.dy *= 0.99;

    if (ball.y <= goal.y + goal.height && ball.y >= goal.y) {
      if (ball.x >= goal.x && ball.x <= goal.x + goal.width) {
        if (ball.x >= keeper.x && ball.x <= keeper.x + keeper.width) {
          gameState = STATE_RESULT;
          message = "SAVED!";
          messageColor = COLOR_KEEPER;
        } else {
          gameState = STATE_RESULT;
          score++;
          message = "GOAL!";
          messageColor = COLOR_ACCENT;
        }
      }
    }

    if (wall.active) {
      if (
        ball.y <= wall.y + wall.height &&
        ball.y >= wall.y &&
        ball.x >= wall.x &&
        ball.x <= wall.x + wall.width
      ) {
        ball.dy *= -1;
        gameState = STATE_RESULT;
        message = "BLOCKED!";
        messageColor = COLOR_WALL;
      }
    }

    if (
      ball.y < 0 ||
      ball.x < 0 ||
      ball.x > canvas.width ||
      ball.y > canvas.height
    ) {
      gameState = STATE_RESULT;
      if (message === "") {
        message = "MISS!";
        messageColor = "#aaa";
      }
    }

    if (Math.abs(ball.dx) < 0.1 && Math.abs(ball.dy) < 0.1) {
      gameState = STATE_RESULT;
      if (message === "") {
        message = "STOPPED";
        messageColor = "#aaa";
      }
    }
  }
}

function draw() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#333";
  ctx.lineWidth = 2;
  ctx.strokeRect(50, 20, 300, 560);
  ctx.strokeRect(100, 20, 200, 100);

  ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
  ctx.fillRect(goal.x, goal.y, goal.width, goal.height);
  ctx.strokeStyle = COLOR_GOAL;
  ctx.lineWidth = 4;
  ctx.strokeRect(goal.x, goal.y, goal.width, goal.height);

  ctx.fillStyle = COLOR_KEEPER;
  ctx.shadowBlur = 10;
  ctx.shadowColor = COLOR_KEEPER;
  ctx.fillRect(keeper.x, keeper.y, keeper.width, keeper.height);
  ctx.shadowBlur = 0;

  if (wall.active) {
    ctx.fillStyle = COLOR_WALL;
    ctx.shadowBlur = 10;
    ctx.shadowColor = COLOR_WALL;
    ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
    ctx.shadowBlur = 0;
  }

  ctx.fillStyle = COLOR_BALL;
  ctx.shadowBlur = 10;
  ctx.shadowColor = COLOR_BALL;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  if (gameState === STATE_AIMING || gameState === STATE_POWERING) {
    const arrowLen = 50;
    const endX = ball.x + Math.cos(angle) * arrowLen;
    const endY = ball.y + Math.sin(angle) * arrowLen;

    ctx.strokeStyle = COLOR_ACCENT;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ball.x, ball.y);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }

  if (gameState === STATE_POWERING || gameState === STATE_SHOOTING) {
    ctx.fillStyle = "#333";
    ctx.fillRect(canvas.width - 30, canvas.height - 120, 20, 100);

    ctx.fillStyle = power > 80 ? "#ff0000" : power > 50 ? "#ffff00" : "#00ff00";
    const barHeight = power;
    ctx.fillRect(
      canvas.width - 30,
      canvas.height - 20 - barHeight,
      20,
      barHeight
    );

    ctx.strokeStyle = "#fff";
    ctx.strokeRect(canvas.width - 30, canvas.height - 120, 20, 100);
  }

  ctx.fillStyle = "#fff";
  ctx.font = "16px 'Press Start 2P'";
  ctx.fillText("SCORE: " + score, 20, canvas.height - 20);

  if (gameState === STATE_RESULT) {
    ctx.fillStyle = messageColor;
    ctx.font = "30px 'Press Start 2P'";
    ctx.textAlign = "center";
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
    ctx.font = "12px 'Press Start 2P'";
    ctx.fillStyle = "#fff";
    ctx.fillText("PRESS SPACE", canvas.width / 2, canvas.height / 2 + 30);
    ctx.textAlign = "start";
  }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
