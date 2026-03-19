let cubies = [];
let cubeSize = 50;

// Colors for faces (you can tweak these)
let colR, colL, colU, colD, colF, colB;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  angleMode(RADIANS);

  colR = color(220, 0, 0);    // Right  (R)
  colL = color(255, 140, 0);  // Left   (L)
  colU = color(255, 255, 0);  // Up     (U)
  colD = color(255);          // Down   (D)
  colF = color(0, 155, 72);   // Front  (F)
  colB = color(0, 0, 255);    // Back   (B)

  initCube();
  createControls();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function initCube() {
  cubies = [];
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        let c = {
          x,
          y,
          z,
          // Face colors keyed by direction:
          // px(+x), nx(-x), py(+y), ny(-y), pz(+z), nz(-z)
          colors: {
            px: null,
            nx: null,
            py: null,
            ny: null,
            pz: null,
            nz: null
          }
        };

        if (x === 1)  c.colors.px = colR; // Right
        if (x === -1) c.colors.nx = colL; // Left
        if (y === 1)  c.colors.py = colU; // Up
        if (y === -1) c.colors.ny = colD; // Down
        if (z === 1)  c.colors.pz = colF; // Front
        if (z === -1) c.colors.nz = colB; // Back

        cubies.push(c);
      }
    }
  }
}

function createControls() {
  const faces = ['U', 'D', 'L', 'R', 'F', 'B'];

  createP('Face rotations:');
  faces.forEach(f => {
    const btn = createButton(f);
    btn.mousePressed(() => rotateFace(f));
  });
}

function draw() {
  background(20);

  // Allow mouse drag to orbit around the cube
  orbitControl();

  // Some nice default orientation
  rotateX(-0.7);
  rotateY(0.9);

  // Simple lighting
  ambientLight(120);
  directionalLight(255, 255, 255, 0.5, 1, -0.5);

  // Draw all cubies
  for (let c of cubies) {
    drawCubie(c);
  }
}

function drawCubie(c) {
  push();
  translate(c.x * cubeSize, c.y * cubeSize, c.z * cubeSize);

  // Base black cube
  noStroke();
  fill(0);
  box(cubeSize * 0.98);

  // Draw colored sticker planes
  stroke(0);
  strokeWeight(1);

  if (c.colors.px) drawFace(c.colors.px, 'px');
  if (c.colors.nx) drawFace(c.colors.nx, 'nx');
  if (c.colors.py) drawFace(c.colors.py, 'py');
  if (c.colors.ny) drawFace(c.colors.ny, 'ny');
  if (c.colors.pz) drawFace(c.colors.pz, 'pz');
  if (c.colors.nz) drawFace(c.colors.nz, 'nz');

  pop();
}

function drawFace(col, dir) {
  push();
  fill(col);

  const s = cubeSize * 0.9;      // sticker size
  const h = cubeSize * 0.5;      // half cube

  switch (dir) {
    case 'px': // +X
      translate(h, 0, 0);
      rotateY(HALF_PI);
      break;
    case 'nx': // -X
      translate(-h, 0, 0);
      rotateY(-HALF_PI);
      break;
    case 'py': // +Y
      translate(0, h, 0);
      rotateX(-HALF_PI);
      break;
    case 'ny': // -Y
      translate(0, -h, 0);
      rotateX(HALF_PI);
      break;
    case 'pz': // +Z
      translate(0, 0, h);
      break;
    case 'nz': // -Z
      translate(0, 0, -h);
      rotateY(PI);
      break;
  }

  plane(s, s);
  pop();
}

// Keyboard shortcuts for faces
function keyPressed() {
  if (key === undefined || key === null) return;
  const k = String(key).toUpperCase();
  if (k.length === 1 && 'UDLRFB'.includes(k)) {
    rotateFace(k);
  }
}

// Rotate a single face (90 degrees each time)
function rotateFace(face) {
  if (!face || typeof face !== 'string') return;
  switch (face) {
    case 'U': // Up layer: y = +1, around Y
      rotateLayer('y', 1, 1);
      break;
    case 'D': // Down layer: y = -1, around Y (opposite)
      rotateLayer('y', -1, -1);
      break;
    case 'R': // Right: x = +1, around X
      rotateLayer('x', 1, 1);
      break;
    case 'L': // Left: x = -1, around X (opposite)
      rotateLayer('x', -1, -1);
      break;
    case 'F': // Front: z = +1, around Z
      rotateLayer('z', 1, 1);
      break;
    case 'B': // Back: z = -1, around Z (opposite)
      rotateLayer('z', -1, -1);
      break;
  }
}

// axis: 'x','y','z'
// coord: which slice (-1,0,1)
// dir: +1 => -90 degrees; -1 => +90 degrees (right-hand rule)
function rotateLayer(axis, coord, dir) {
  if (!Array.isArray(cubies)) return;
  for (let c of cubies) {
    if (
      (axis === 'x' && c.x === coord) ||
      (axis === 'y' && c.y === coord) ||
      (axis === 'z' && c.z === coord)
    ) {
      // --- Update position on the 3x3 grid ---
      let x = c.x, y = c.y, z = c.z;

      if (axis === 'y') {
        // rotate in XZ-plane
        if (dir === 1) {
          c.x = -z;
          c.z = x;
        } else {
          c.x = z;
          c.z = -x;
        }
        rotateColorsAroundY(c.colors, dir);
      } else if (axis === 'x') {
        // rotate in YZ-plane
        if (dir === 1) {
          c.y = z;
          c.z = -y;
        } else {
          c.y = -z;
          c.z = y;
        }
        rotateColorsAroundX(c.colors, dir);
      } else if (axis === 'z') {
        // rotate in XY-plane
        if (dir === 1) {
          c.x = y;
          c.y = -x;
        } else {
          c.x = -y;
          c.y = x;
        }
        rotateColorsAroundZ(c.colors, dir);
      }
    }
  }
}

// --- Color orientation updates ---
// Using direction labels: px, nx, py, ny, pz, nz

function rotateColorsAroundY(colors, dir) {
  let old = Object.assign({}, colors);
  if (dir === 1) {
    // theta = -90° around Y
    // inverse_y_neg: { pz: px, nz: nx, py: py, ny: ny, nx: pz, px: nz }
    colors.pz = old.px;
    colors.nz = old.nx;
    colors.py = old.py;
    colors.ny = old.ny;
    colors.nx = old.pz;
    colors.px = old.nz;
  } else {
    // theta = +90° around Y
    // inverse_y_pos: { nz: px, pz: nx, py: py, ny: ny, px: pz, nx: nz }
    colors.nz = old.px;
    colors.pz = old.nx;
    colors.py = old.py;
    colors.ny = old.ny;
    colors.px = old.pz;
    colors.nx = old.nz;
  }
}

function rotateColorsAroundX(colors, dir) {
  let old = Object.assign({}, colors);
  if (dir === 1) {
    // theta = -90° around X
    // inverse_x_neg: { px: px, nx: nx, nz: py, pz: ny, py: pz, ny: nz }
    colors.px = old.px;
    colors.nx = old.nx;
    colors.nz = old.py;
    colors.pz = old.ny;
    colors.py = old.pz;
    colors.ny = old.nz;
  } else {
    // theta = +90° around X
    // inverse_x_pos: { px: px, nx: nx, pz: py, nz: ny, ny: pz, py: nz }
    colors.px = old.px;
    colors.nx = old.nx;
    colors.pz = old.py;
    colors.nz = old.ny;
    colors.ny = old.pz;
    colors.py = old.nz;
  }
}

function rotateColorsAroundZ(colors, dir) {
  let old = Object.assign({}, colors);
  if (dir === 1) {
    // theta = -90° around Z
    // inverse_z_neg: { ny: px, py: nx, px: py, nx: ny, pz: pz, nz: nz }
    colors.ny = old.px;
    colors.py = old.nx;
    colors.px = old.py;
    colors.nx = old.ny;
    colors.pz = old.pz;
    colors.nz = old.nz;
  } else {
    // theta = +90° around Z
    // inverse_z_pos: { py: px, ny: nx, nx: py, px: ny, pz: pz, nz: nz }
    colors.py = old.px;
    colors.ny = old.nx;
    colors.nx = old.py;
    colors.px = old.ny;
    colors.pz = old.pz;
    colors.nz = old.nz;
  }
}