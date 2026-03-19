/**
 * Emoji Zombie Survivor
 * WASD — move | Mouse — aim, click to shoot
 * Zombies spawn outside the screen every 2s. Bullet pickups 🔫 drift; catch them for ammo.
 */

const PLAYER_SPEED = 4.5;
const ZOMBIE_SPEED = 1.4;
const PROJECTILE_SPEED = 9;
const ZOMBIE_SPAWN_MS = 2000;
const PICKUP_SPAWN_MS = 3500;
const PICKUP_SOLID_MS = 5000;
const PICKUP_FADE_MS = 5000;
const ZOMBIE_BITE_DAMAGE = 5;
const ZOMBIE_BITE_COOLDOWN_MS = 2000;
const PLAYER_RADIUS = 22;
const ZOMBIE_RADIUS = 26;
const PROJECTILE_RADIUS = 6;
const PICKUP_RADIUS = 20;
const SHOOT_COOLDOWN_MS = 180;
const PICKUP_RING_ALPHA = 175; // steady ring + flash "on" — same brightness
const PICKUP_RING_FLASH_OFF_ALPHA = 38; // dim between flashes

let player;
let zombies = [];
let projectiles = [];
let pickups = [];
let hp = 100;
let ammo = 0;
let gameOver = false;
let lastZombieSpawn = 0;
let lastPickupSpawn = 0;
let lastShotTime = 0;
let keys = {};
// Aim direction: from player toward mouse (triangle shows where you'll shoot)
let aimDir = { x: 0, y: -1 };

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  textFont("system-ui, Apple Color Emoji, Segoe UI Emoji, sans-serif");
  player = { x: width / 2, y: height / 2 };
  lastZombieSpawn = millis();
  // First ammo pickup arrives soon so you can restock after the opening clips
  lastPickupSpawn = millis() - PICKUP_SPAWN_MS + 1200;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(30, 35, 55);

  if (!gameOver) {
    updateAimFromMouse();
    updatePlayer();
    spawnZombieIfNeeded();
    spawnPickupIfNeeded();
    updateZombies();
    updateProjectiles();
    updatePickups();
    checkZombieBites();
  }

  // World
  drawPickups();
  drawProjectiles();
  drawZombies();
  drawPlayer();
  drawAimIndicator();

  drawHUD();

  if (gameOver) {
    drawGameOver();
  }
}

function keyPressed() {
  const k = key.toLowerCase();
  if (k === "w" || k === "a" || k === "s" || k === "d") keys[k] = true;
  return false;
}

function keyReleased() {
  const k = key.toLowerCase();
  if (k === "w" || k === "a" || k === "s" || k === "d") keys[k] = false;
  return false;
}

function updateAimFromMouse() {
  const dx = mouseX - player.x;
  const dy = mouseY - player.y;
  const d = Math.hypot(dx, dy);
  if (d > 5) {
    aimDir.x = dx / d;
    aimDir.y = dy / d;
  }
}

function mousePressed() {
  if (!gameOver && mouseButton === LEFT) tryShoot(aimDir.x, aimDir.y);
}

function updatePlayer() {
  let dx = 0,
    dy = 0;
  if (keys["w"]) dy -= 1;
  if (keys["s"]) dy += 1;
  if (keys["a"]) dx -= 1;
  if (keys["d"]) dx += 1;
  if (dx !== 0 || dy !== 0) {
    const len = Math.hypot(dx, dy);
    dx = (dx / len) * PLAYER_SPEED;
    dy = (dy / len) * PLAYER_SPEED;
  }
  player.x = constrain(player.x + dx, PLAYER_RADIUS, width - PLAYER_RADIUS);
  player.y = constrain(player.y + dy, PLAYER_RADIUS, height - PLAYER_RADIUS);
}

function tryShoot(vx, vy) {
  const now = millis();
  if (now - lastShotTime < SHOOT_COOLDOWN_MS) return;
  if (ammo <= 0) return;
  ammo--;
  lastShotTime = now;
  projectiles.push({
    x: player.x,
    y: player.y,
    vx: vx * PROJECTILE_SPEED,
    vy: vy * PROJECTILE_SPEED,
  });
}

function spawnZombieIfNeeded() {
  const now = millis();
  if (now - lastZombieSpawn < ZOMBIE_SPAWN_MS) return;
  lastZombieSpawn = now;

  const edge = floor(random(4));
  let x, y;
  const pad = ZOMBIE_RADIUS + 4;
  switch (edge) {
    case 0: // top
      x = random(pad, width - pad);
      y = -pad;
      break;
    case 1: // right
      x = width + pad;
      y = random(pad, height - pad);
      break;
    case 2: // bottom
      x = random(pad, width - pad);
      y = height + pad;
      break;
    default: // left
      x = -pad;
      y = random(pad, height - pad);
      break;
  }

  zombies.push({
    x,
    y,
    lastBite: 0,
  });
}

function spawnPickupIfNeeded() {
  const now = millis();
  if (now - lastPickupSpawn < PICKUP_SPAWN_MS) return;
  lastPickupSpawn = now;

  const margin = 40;
  pickups.push({
    x: random(margin, width - margin),
    y: random(margin, height - margin),
    spawnTime: now,
  });
}

function updateZombies() {
  for (const z of zombies) {
    const dx = player.x - z.x;
    const dy = player.y - z.y;
    const d = Math.hypot(dx, dy) || 1;
    z.x += (dx / d) * ZOMBIE_SPEED;
    z.y += (dy / d) * ZOMBIE_SPEED;
  }
}

function updateProjectiles() {
  const alive = [];
  for (const p of projectiles) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < -50 || p.x > width + 50 || p.y < -50 || p.y > height + 50) continue;

    let hit = false;
    for (let i = zombies.length - 1; i >= 0; i--) {
      const z = zombies[i];
      if (dist(p.x, p.y, z.x, z.y) < ZOMBIE_RADIUS + PROJECTILE_RADIUS) {
        zombies.splice(i, 1);
        hit = true;
        break;
      }
    }
    if (!hit) alive.push(p);
  }
  projectiles = alive;
}

/** True while the gun pickup is in its 5s delete phase (ring flashes) */
function pickupIsFlashingOut(pu) {
  const t = millis() - pu.spawnTime;
  return t >= PICKUP_SOLID_MS && t < PICKUP_SOLID_MS + PICKUP_FADE_MS;
}

/** Strobing ring alpha — same peak brightness as steady ring, no fade-to-brighter */
function pickupRingFlashAlpha(pu) {
  const t = millis() - pu.spawnTime;
  if (t < PICKUP_SOLID_MS) return 0;
  const fadeT = t - PICKUP_SOLID_MS;
  if (fadeT >= PICKUP_FADE_MS) return 0;
  const flashPeriodMs = 110;
  const flashOn = floor(fadeT / flashPeriodMs) % 2 === 0;
  return flashOn ? PICKUP_RING_ALPHA : PICKUP_RING_FLASH_OFF_ALPHA;
}

function updatePickups() {
  const now = millis();
  const alive = [];
  for (const pu of pickups) {
    const age = now - pu.spawnTime;
    if (age > PICKUP_SOLID_MS + PICKUP_FADE_MS) continue;

    if (dist(player.x, player.y, pu.x, pu.y) < PLAYER_RADIUS + PICKUP_RADIUS) {
      ammo += 5;
      continue;
    }
    alive.push(pu);
  }
  pickups = alive;
}

function checkZombieBites() {
  const now = millis();
  for (const z of zombies) {
    if (dist(player.x, player.y, z.x, z.y) < PLAYER_RADIUS + ZOMBIE_RADIUS * 0.85) {
      if (now - z.lastBite >= ZOMBIE_BITE_COOLDOWN_MS) {
        z.lastBite = now;
        hp -= ZOMBIE_BITE_DAMAGE;
        if (hp <= 0) {
          hp = 0;
          gameOver = true;
        }
      }
    }
  }
}

function drawPlayer() {
  push();
  translate(player.x, player.y);
  textSize(40);
  text("🧑", 0, 0);
  pop();
}

function drawAimIndicator() {
  // Triangle in front of character pointing toward mouse (shoot direction)
  const tipDist = 38;
  const baseDist = 18;
  const halfBase = 12;
  const tipX = player.x + aimDir.x * tipDist;
  const tipY = player.y + aimDir.y * tipDist;
  const perpX = -aimDir.y;
  const perpY = aimDir.x;
  const baseX = player.x + aimDir.x * baseDist;
  const baseY = player.y + aimDir.y * baseDist;
  const b1x = baseX + perpX * halfBase;
  const b1y = baseY + perpY * halfBase;
  const b2x = baseX - perpX * halfBase;
  const b2y = baseY - perpY * halfBase;
  fill(255, 200, 80);
  noStroke();
  triangle(tipX, tipY, b1x, b1y, b2x, b2y);
}

function drawZombies() {
  textSize(44);
  for (const z of zombies) {
    push();
    translate(z.x, z.y);
    text("🧟", 0, 0);
    pop();
  }
}

function drawProjectiles() {
  fill(255, 220, 80);
  noStroke();
  for (const p of projectiles) {
    circle(p.x, p.y, PROJECTILE_RADIUS * 2);
  }
}

function drawPickups() {
  textSize(36);
  const ringD = 52;
  for (const pu of pickups) {
    const t = millis() - pu.spawnTime;
    push();
    translate(pu.x, pu.y);
    // Draw emoji first so it's behind the ring; restore fill (noFill() for the ring would make text invisible)
    fill(255);
    noStroke();
    text("🔫", 0, 0);
    // Then draw ring around it (circle stroke only, center stays transparent)
    noFill();
    if (t < PICKUP_SOLID_MS) {
      stroke(255, 210, 90, PICKUP_RING_ALPHA);
      strokeWeight(2.5);
      circle(0, 0, ringD);
    }
    if (pickupIsFlashingOut(pu)) {
      const ringA = pickupRingFlashAlpha(pu);
      stroke(255, 210, 90, ringA);
      strokeWeight(2.5);
      circle(0, 0, ringD);
    }
    noStroke();
    pop();
  }
}

function drawHUD() {
  push();
  textAlign(CENTER, TOP);
  textSize(14);
  fill(180, 190, 220);
  if (!gameOver) {
    text("WASD move · Aim with mouse · Click to shoot · 🔫 steady ring 5s, then ring flashes 5s", width / 2, 10);
  }

  textAlign(LEFT, BOTTOM);
  textSize(18);
  fill(240);
  text(`❤️ Health: ${hp}`, 16, height - 16);

  textAlign(RIGHT, BOTTOM);
  text(`🔫 Bullets: ${ammo}`, width - 16, height - 16);
  pop();
}

function drawGameOver() {
  push();
  fill(0, 0, 0, 160);
  rect(0, 0, width, height);
  textAlign(CENTER, CENTER);
  textSize(42);
  fill(255);
  text("Game Over", width / 2, height / 2 - 20);
  textSize(20);
  fill(200);
  text("Refresh the page to play again", width / 2, height / 2 + 28);
  pop();
}
