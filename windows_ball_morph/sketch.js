// Three.js Bouncing Cube with Colored Faces
let scene, camera, renderer;
let cube, boundingBox;
let cubeVelocity;
let cubeSize = 3;
let time = 0; // For sine wave animation

function setup() {
  // Create fullscreen canvas
  createCanvas(windowWidth, windowHeight, WEBGL);
  
  // Initialize Three.js
  initThreeJS();
  
  // Create the morphing colored cube
  createMorphingCube();
  
  // Create the bounding box wireframe
  // createBoundingBox();
  
  // Set initial cube velocity
  cubeVelocity = {
    x: (Math.random() - 0.5) * 1,
    y: (Math.random() - 0.5) * 1,
    z: (Math.random() - 0.5) * 1
  };
}

function draw() {
  // Update time for morphing animation
  time += 0.05;
  
  // Update cube position
  updateCube();
  
  // Update cube morphing
  morphCube();
  
  // Render the scene
  renderer.render(scene, camera);
}

function initThreeJS() {
  // Create scene
  scene = new THREE.Scene();
  
  // Create camera - position it to look straight at one face
  camera = new THREE.PerspectiveCamera(75, windowWidth / windowHeight, 0.1, 1000);
  camera.position.set(0, 0, 25); // Position camera directly in front, looking down Z-axis
  camera.lookAt(0, 0, 0);
  
  // Create renderer
  renderer = new THREE.WebGLRenderer({ canvas: canvas });
  renderer.setSize(windowWidth, windowHeight);
  renderer.setClearColor(0x000000); // Black background
  
  // Add brighter lighting
  const ambientLight = new THREE.AmbientLight(0x404040, 1.2); // Increased brightness
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5); // Increased brightness
  directionalLight.position.set(10, 10, 5);
  scene.add(directionalLight);
}

function createMorphingCube() {
  // Create custom geometry for morphing cube
  const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize, 2, 2, 2); // More segments for morphing
  
  // Create materials for each face
  const materials = [
    new THREE.MeshLambertMaterial({ color: 0xff0000 }), // Right - Red
    new THREE.MeshLambertMaterial({ color: 0x00ff00 }), // Left - Green
    new THREE.MeshLambertMaterial({ color: 0x0000ff }), // Top - Blue
    new THREE.MeshLambertMaterial({ color: 0xffff00 }), // Bottom - Yellow
    new THREE.MeshLambertMaterial({ color: 0xff8800 }), // Front - Orange
    new THREE.MeshLambertMaterial({ color: 0xff00ff })  // Back - Pink
  ];
  
  cube = new THREE.Mesh(geometry, materials);
  cube.position.set(0, 0, 0);
  
  // Store original vertex positions for morphing
  cube.geometry.originalPositions = cube.geometry.attributes.position.array.slice();
  
  scene.add(cube);
}

function updateCube() {
  // Update cube position
  cube.position.x += cubeVelocity.x;
  cube.position.y += cubeVelocity.y;
  cube.position.z += cubeVelocity.z;
  
  // Calculate screen boundaries based on camera and window size
  const halfCube = cubeSize / 2;
  const distance = camera.position.z; // Distance from camera to origin
  const fov = camera.fov * Math.PI / 180; // Convert FOV to radians
  const screenHeight = 2 * Math.tan(fov / 2) * distance;
  const screenWidth = screenHeight * (windowWidth / windowHeight);
  
  const boundaryX = screenWidth / 2; // Half screen width
  const boundaryY = screenHeight / 2; // Half screen height  
  const boundaryZ = 1; // Fixed Z boundary
  
  // X-axis collision (left/right)
  if (cube.position.x + halfCube >= boundaryX || cube.position.x - halfCube <= -boundaryX) {
    cubeVelocity.x *= -1;
    cube.position.x = Math.max(-boundaryX + halfCube, Math.min(boundaryX - halfCube, cube.position.x));
  }
  
  // Y-axis collision (top/bottom)
  if (cube.position.y + halfCube >= boundaryY || cube.position.y - halfCube <= -boundaryY) {
    cubeVelocity.y *= -1;
    cube.position.y = Math.max(-boundaryY + halfCube, Math.min(boundaryY - halfCube, cube.position.y));
  }
  
  // Z-axis collision (front/back)
  if (cube.position.z + halfCube >= boundaryZ || cube.position.z - halfCube <= -boundaryZ) {
    cubeVelocity.z *= -1;
    cube.position.z = Math.max(-boundaryZ + halfCube, Math.min(boundaryZ - halfCube, cube.position.z));
  }
  
  // Rotate cube as it moves for better visualization
  cube.rotation.x += 0.02;
  cube.rotation.y += 0.02;
  cube.rotation.z += 0.01;
}

function morphCube() {
  const positions = cube.geometry.attributes.position.array;
  const originalPositions = cube.geometry.originalPositions;
  
  // Morphing factor using sine wave (ranges from -0.5 to 0.5)
  const morphFactor = Math.sin(time) * 2 -1;
  
  for (let i = 0; i < positions.length; i += 3) {
    const x = originalPositions[i];
    const y = originalPositions[i + 1];
    const z = originalPositions[i + 2];
    
    // Calculate distance from center for each vertex
    const distance = Math.sqrt(x * x + y * y + z * z);
    
    // Only morph corner vertices (those further from center)
    if (distance > cubeSize * 0.8) { // Only affect corner vertices
      // Calculate radial direction
      const normalizedX = x / distance;
      const normalizedY = y / distance;
      const normalizedZ = z / distance;
      
      // Apply radial morphing
      positions[i] = x + normalizedX * morphFactor;
      positions[i + 1] = y + normalizedY * morphFactor;
      positions[i + 2] = z + normalizedZ * morphFactor;
    } else {
      // Keep face center vertices in original position
      positions[i] = x;
      positions[i + 1] = y;
      positions[i + 2] = z;
    }
  }
  
  // Update the geometry
  cube.geometry.attributes.position.needsUpdate = true;
  cube.geometry.computeVertexNormals(); // Recalculate normals for proper lighting
}

function createBoundingBox() {
  // Calculate screen boundaries (same as in updateCube)
  const distance = 25; // Camera Z position
  const fov = 75 * Math.PI / 180; // Camera FOV in radians
  const screenHeight = 2 * Math.tan(fov / 2) * distance;
  const screenWidth = screenHeight * (windowWidth / windowHeight);
  
  const boundaryX = screenWidth / 2;
  const boundaryY = screenHeight / 2;
  const boundaryZ = 1;
  
  const geometry = new THREE.BoxGeometry(boundaryX * 2, boundaryY * 2, boundaryZ * 2);
  const edges = new THREE.EdgesGeometry(geometry);
  const material = new THREE.LineBasicMaterial({ color: 0xff0000 }); // Red color
  
  boundingBox = new THREE.LineSegments(edges, material);
  scene.add(boundingBox);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  camera.aspect = windowWidth / windowHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(windowWidth, windowHeight);
}
