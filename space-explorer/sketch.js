const CHUNK_SIZE = 400;
const OBSTACLES_PER_CHUNK = 4;
const BULLET_SPEED = 10;
const BULLET_LIFE = 60;
const PLAYER_SPEED = 4;
const PLAYER_SIZE = 16;
const PLAYER_RADIUS = 12;
const CULL_DISTANCE = 3000;
const ENEMY_SPAWN_DIST = 600;
const ENEMY_SPAWN_INTERVAL = 90;
const RED_SPEED = 3;
const BLUE_SPEED = 1.2;
const BLUE_STOP_DIST = 250;
const BLUE_SHOOT_INTERVAL = 100;
const ENEMY_BULLET_SPEED = 6;
const ENEMY_SIZE = 12;
const MAX_ENEMIES = 20;

let player;
let bullets = [];
let enemyBullets = [];
let enemies = [];
let chunks = {};
let stars = [];
let gameOver = false;
let spawnTimer = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  resetGame();
}

function resetGame() {
  player = { x: 0, y: 0, angle: 0 };
  bullets = [];
  enemyBullets = [];
  enemies = [];
  chunks = {};
  gameOver = false;
  spawnTimer = 0;

  stars = [];
  for (let i = 0; i < 200; i++) {
    stars.push({
      x: random(-2000, 2000),
      y: random(-2000, 2000),
      s: random(1, 3),
      brightness: random(80, 200),
    });
  }
}

function chunkKey(cx, cy) {
  return cx + ',' + cy;
}

function generateChunk(cx, cy) {
  let key = chunkKey(cx, cy);
  if (chunks[key]) return;
  if (cx === 0 && cy === 0) { chunks[key] = []; return; }

  let obstacles = [];
  let ox = cx * CHUNK_SIZE;
  let oy = cy * CHUNK_SIZE;

  for (let i = 0; i < OBSTACLES_PER_CHUNK; i++) {
    let type = floor(random(3));
    let x = ox + random(CHUNK_SIZE);
    let y = oy + random(CHUNK_SIZE);

    if (type === 0) {
      obstacles.push({ type: 'circle', x, y, r: random(15, 50) });
    } else if (type === 1) {
      let s = random(20, 60);
      obstacles.push({ type: 'square', x, y, w: s, h: s });
    } else {
      obstacles.push({ type: 'rect', x, y, w: random(30, 100), h: random(15, 50) });
    }
  }
  chunks[key] = obstacles;
}

function collidesObstacle(x, y, radius) {
  for (let key in chunks) {
    for (let o of chunks[key]) {
      if (o.type === 'circle') {
        if (dist(x, y, o.x, o.y) < radius + o.r) return o;
      } else {
        let cx = constrain(x, o.x - o.w / 2, o.x + o.w / 2);
        let cy = constrain(y, o.y - o.h / 2, o.y + o.h / 2);
        if (dist(x, y, cx, cy) < radius) return o;
      }
    }
  }
  return null;
}

function pushOutOfObstacle(entity, radius) {
  for (let key in chunks) {
    for (let o of chunks[key]) {
      if (o.type === 'circle') {
        let d = dist(entity.x, entity.y, o.x, o.y);
        if (d < radius + o.r && d > 0) {
          let overlap = radius + o.r - d;
          entity.x += ((entity.x - o.x) / d) * overlap;
          entity.y += ((entity.y - o.y) / d) * overlap;
        }
      } else {
        let cx = constrain(entity.x, o.x - o.w / 2, o.x + o.w / 2);
        let cy = constrain(entity.y, o.y - o.h / 2, o.y + o.h / 2);
        let d = dist(entity.x, entity.y, cx, cy);
        if (d < radius && d > 0) {
          let overlap = radius - d;
          entity.x += ((entity.x - cx) / d) * overlap;
          entity.y += ((entity.y - cy) / d) * overlap;
        } else if (d === 0) {
          entity.x += radius;
        }
      }
    }
  }
}

function draw() {
  background(0);

  if (gameOver) {
    drawGameOver();
    return;
  }

  handleInput();
  pushOutOfObstacle(player, PLAYER_RADIUS);
  spawnEnemies();
  updateEnemies();
  updateBullets();
  updateEnemyBullets();

  let viewChunksX = ceil(width / CHUNK_SIZE) + 2;
  let viewChunksY = ceil(height / CHUNK_SIZE) + 2;
  let pcx = floor(player.x / CHUNK_SIZE);
  let pcy = floor(player.y / CHUNK_SIZE);

  for (let dx = -viewChunksX; dx <= viewChunksX; dx++) {
    for (let dy = -viewChunksY; dy <= viewChunksY; dy++) {
      generateChunk(pcx + dx, pcy + dy);
    }
  }

  cullFarChunks(pcx, pcy);

  push();
  translate(width / 2 - player.x, height / 2 - player.y);

  drawStars();
  drawObstacles();
  drawBullets();
  drawEnemyBullets();
  drawEnemies();
  drawPlayer();

  pop();
}

function drawGameOver() {
  fill(255, 0, 0);
  textAlign(CENTER, CENTER);
  textSize(48);
  text('GAME OVER', width / 2, height / 2 - 30);
  textSize(20);
  fill(255);
  text('Press R to restart', width / 2, height / 2 + 30);
}

function handleInput() {
  let turnSpeed = 0.1;

  if (keyIsDown(LEFT_ARROW)) player.angle -= turnSpeed;
  if (keyIsDown(RIGHT_ARROW)) player.angle += turnSpeed;

  let thrust = 0;
  if (keyIsDown(UP_ARROW)) thrust = PLAYER_SPEED;
  if (keyIsDown(DOWN_ARROW)) thrust = -PLAYER_SPEED;

  let ax = 0, ay = 0;
  if (keyIsDown(65)) ax -= 1;
  if (keyIsDown(68)) ax += 1;
  if (keyIsDown(87)) ay -= 1;
  if (keyIsDown(83)) ay += 1;

  if (ax !== 0 || ay !== 0) {
    let mag = sqrt(ax * ax + ay * ay);
    player.x += (ax / mag) * PLAYER_SPEED;
    player.y += (ay / mag) * PLAYER_SPEED;
    player.angle = atan2(ay, ax);
  }

  if (thrust !== 0) {
    player.x += cos(player.angle) * thrust;
    player.y += sin(player.angle) * thrust;
  }
}

function spawnEnemies() {
  spawnTimer++;
  if (spawnTimer < ENEMY_SPAWN_INTERVAL || enemies.length >= MAX_ENEMIES) return;
  spawnTimer = 0;

  let angle = random(TWO_PI);
  let ex = player.x + cos(angle) * ENEMY_SPAWN_DIST;
  let ey = player.y + sin(angle) * ENEMY_SPAWN_DIST;

  if (collidesObstacle(ex, ey, ENEMY_SIZE)) return;

  let type = random() < 0.5 ? 'red' : 'blue';
  enemies.push({
    x: ex,
    y: ey,
    angle: angle + PI,
    type: type,
    shootTimer: floor(random(BLUE_SHOOT_INTERVAL)),
  });
}

function updateEnemies() {
  for (let i = enemies.length - 1; i >= 0; i--) {
    let e = enemies[i];

    let toPlayerX = player.x - e.x;
    let toPlayerY = player.y - e.y;
    let distToPlayer = Math.sqrt(toPlayerX * toPlayerX + toPlayerY * toPlayerY);

    if (distToPlayer > 0) {
      e.angle = Math.atan2(toPlayerY, toPlayerX);
    }

    if (e.type === 'red') {
      updateRedEnemy(e, toPlayerX, toPlayerY, distToPlayer);
      if (distToPlayer < PLAYER_RADIUS + ENEMY_SIZE) {
        gameOver = true;
      }
    } else {
      updateBlueEnemy(e, distToPlayer);
    }

    if (distToPlayer > CULL_DISTANCE) {
      enemies.splice(i, 1);
    }
  }
}

function updateRedEnemy(e, toPlayerX, toPlayerY, distToPlayer) {
  if (distToPlayer <= 0) return;
  let nx = toPlayerX / distToPlayer;
  let ny = toPlayerY / distToPlayer;
  let newX = e.x + nx * RED_SPEED;
  let newY = e.y + ny * RED_SPEED;

  if (!collidesObstacle(newX, newY, ENEMY_SIZE)) {
    e.x = newX;
    e.y = newY;
  } else if (!collidesObstacle(e.x + nx * RED_SPEED, e.y, ENEMY_SIZE)) {
    e.x += nx * RED_SPEED;
  } else if (!collidesObstacle(e.x, e.y + ny * RED_SPEED, ENEMY_SIZE)) {
    e.y += ny * RED_SPEED;
  }
}

function updateBlueEnemy(e, distToPlayer) {
  if (distToPlayer > BLUE_STOP_DIST) {
    let mx = Math.cos(e.angle) * BLUE_SPEED;
    let my = Math.sin(e.angle) * BLUE_SPEED;
    let newX = e.x + mx;
    let newY = e.y + my;

    if (!collidesObstacle(newX, newY, ENEMY_SIZE)) {
      e.x = newX;
      e.y = newY;
    } else if (!collidesObstacle(e.x + mx, e.y, ENEMY_SIZE)) {
      e.x += mx;
    } else if (!collidesObstacle(e.x, e.y + my, ENEMY_SIZE)) {
      e.y += my;
    }
  }

  e.shootTimer++;
  if (e.shootTimer >= BLUE_SHOOT_INTERVAL && distToPlayer > 0 && distToPlayer < 500) {
    e.shootTimer = 0;
    let frontX = cos(e.angle);
    let frontY = sin(e.angle);
    enemyBullets.push({
      x: e.x + frontX * ENEMY_SIZE,
      y: e.y + frontY * ENEMY_SIZE,
      vx: frontX * ENEMY_BULLET_SPEED,
      vy: frontY * ENEMY_BULLET_SPEED,
      life: BULLET_LIFE,
    });
  }
}

function updateEnemyBullets() {
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    let b = enemyBullets[i];
    b.x += b.vx;
    b.y += b.vy;
    b.life--;

    if (dist(b.x, b.y, player.x, player.y) < PLAYER_RADIUS) {
      gameOver = true;
    }

    if (b.life <= 0) {
      enemyBullets.splice(i, 1);
    }
  }
}

function drawStars() {
  for (let s of stars) {
    let sx = ((s.x - player.x * 0.3) % 2000 + 3000) % 2000 - 1000 + player.x;
    let sy = ((s.y - player.y * 0.3) % 2000 + 3000) % 2000 - 1000 + player.y;
    fill(255, s.brightness);
    circle(sx, sy, s.s);
  }
}

function drawObstacles() {
  fill(120);
  for (let key in chunks) {
    for (let obs of chunks[key]) {
      if (obs.type === 'circle') {
        circle(obs.x, obs.y, obs.r * 2);
      } else {
        rectMode(CENTER);
        rect(obs.x, obs.y, obs.w, obs.h);
      }
    }
  }
}

function drawBullets() {
  fill(255, 255, 100);
  for (let b of bullets) {
    circle(b.x, b.y, 5);
  }
}

function drawEnemyBullets() {
  fill(100, 150, 255);
  for (let b of enemyBullets) {
    circle(b.x, b.y, 7);
  }
}

function drawEnemies() {
  for (let e of enemies) {
    push();
    translate(e.x, e.y);
    rotate(e.angle);

    if (e.type === 'red') {
      fill(255, 50, 50);
    } else {
      fill(50, 100, 255);
    }

    triangle(
      ENEMY_SIZE, 0,
      -ENEMY_SIZE * 0.7, -ENEMY_SIZE * 0.6,
      -ENEMY_SIZE * 0.7, ENEMY_SIZE * 0.6
    );
    pop();
  }
}

function drawPlayer() {
  push();
  translate(player.x, player.y);
  rotate(player.angle);

  fill(255);
  triangle(
    PLAYER_SIZE, 0,
    -PLAYER_SIZE * 0.7, -PLAYER_SIZE * 0.6,
    -PLAYER_SIZE * 0.7, PLAYER_SIZE * 0.6
  );

  fill(255, 150, 50);
  triangle(
    -PLAYER_SIZE * 0.7, -PLAYER_SIZE * 0.3,
    -PLAYER_SIZE * 0.7, PLAYER_SIZE * 0.3,
    -PLAYER_SIZE * 1.1 - random(3), 0
  );

  pop();
}

function updateBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    let b = bullets[i];
    b.x += b.vx;
    b.y += b.vy;
    b.life--;

    let hitObs = checkBulletHitObstacle(b);
    let hitEnemy = checkBulletHitEnemy(b);
    if (b.life <= 0 || hitObs || hitEnemy) {
      bullets.splice(i, 1);
    }
  }
}

function checkBulletHitObstacle(b) {
  for (let key in chunks) {
    let obs = chunks[key];
    for (let j = obs.length - 1; j >= 0; j--) {
      let o = obs[j];
      let hit = false;
      if (o.type === 'circle') {
        hit = dist(b.x, b.y, o.x, o.y) < o.r;
      } else {
        hit = b.x > o.x - o.w / 2 && b.x < o.x + o.w / 2 &&
              b.y > o.y - o.h / 2 && b.y < o.y + o.h / 2;
      }
      if (hit) {
        obs.splice(j, 1);
        return true;
      }
    }
  }
  return false;
}

function checkBulletHitEnemy(b) {
  for (let i = enemies.length - 1; i >= 0; i--) {
    let e = enemies[i];
    if (dist(b.x, b.y, e.x, e.y) < ENEMY_SIZE) {
      enemies.splice(i, 1);
      return true;
    }
  }
  return false;
}

function cullFarChunks(pcx, pcy) {
  let maxDist = CULL_DISTANCE / CHUNK_SIZE;
  for (let key in chunks) {
    let parts = key.split(',');
    let cx = int(parts[0]);
    let cy = int(parts[1]);
    if (abs(cx - pcx) > maxDist || abs(cy - pcy) > maxDist) {
      delete chunks[key];
    }
  }
}

function shoot() {
  bullets.push({
    x: player.x + cos(player.angle) * PLAYER_SIZE,
    y: player.y + sin(player.angle) * PLAYER_SIZE,
    vx: cos(player.angle) * BULLET_SPEED,
    vy: sin(player.angle) * BULLET_SPEED,
    life: BULLET_LIFE,
  });
}

function keyPressed() {
  if (key === ' ' && !gameOver) shoot();
  if (key === 'r' || key === 'R') resetGame();
  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
