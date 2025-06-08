// Three.js White Scene
let scene, camera, renderer;
let butterflies = [];
let maxButterflies = 100;

function setup() {
  // Create fullscreen canvas
  createCanvas(windowWidth, windowHeight, WEBGL);
  
  // Initialize Three.js
  initThreeJS();
  
  // Create initial butterflies
  for (let i = 0; i < maxButterflies; i++) {
    butterflies.push(new Butterfly());
  }
}

function draw() {
  // Update all butterflies
  for (let i = butterflies.length - 1; i >= 0; i--) {
    butterflies[i].update();
    
    // Remove butterflies that reach the top (y > 4) and add new ones
    if (butterflies[i].position.y > 4) {
      scene.remove(butterflies[i].group);
      butterflies.splice(i, 1);
      
      // Add a new butterfly to replace the removed one
      butterflies.push(new Butterfly());
    }
  }

  // Render the scene
  renderer.render(scene, camera);
  
  // Randomly add and remove butterflies simultaneously
  if (Math.random() < 0.02 && butterflies.length > 0) { 
    // Remove a random butterfly
    const randomIndex = Math.floor(Math.random() * butterflies.length);
    scene.remove(butterflies[randomIndex].group);
    butterflies.splice(randomIndex, 1);
    
    // Add a new butterfly
    butterflies.push(new Butterfly());
  }
}

function initThreeJS() {
  // Create scene
  scene = new THREE.Scene();
  
  // Create camera
  camera = new THREE.PerspectiveCamera(75, windowWidth / windowHeight, 0.1, 1000);
  camera.position.set(0, 0, 5);
  camera.lookAt(0, 0, 0);
  
  // Create renderer
  renderer = new THREE.WebGLRenderer({ canvas: canvas });
  renderer.setSize(windowWidth, windowHeight);
  renderer.setClearColor(0xffffff); // White background
  
  // Add lighting
  const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(0, 0, 5);
  scene.add(directionalLight);
}
class Butterfly {
  constructor() {
    this.group = new THREE.Group();
    this.position = { 
      x: (Math.random() - 0.5) * 8, 
      y: -5 + Math.random()*2, // Start at bottom of screen
      z: (Math.random() - 0.5) * 2 
    };
    this.velocity = { 
      x: (Math.random() - 0.5) * 1/20, 
      y: Math.random() * 0.01 + 0.01, // Always positive upward speed
      z: (Math.random() - 0.5) * 1/20
    };
    this.time = Math.random() * 50; // Random starting phase
    this.age = 0; // Track age for removal
    
    this.createButterfly();
    scene.add(this.group);
  }
  createButterfly() {
    // Create butterfly head (flat circle)
    const headGeometry = new THREE.CircleGeometry(0.03, 16);
    const headMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xff0000, // Red head
      side: THREE.DoubleSide 
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, 0.12, 0);
    this.group.add(head);
    
    // Create butterfly body (rectangle)
    const bodyGeometry = new THREE.BoxGeometry(0.02, 0.1, 0.02);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 }); // Red
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    this.group.add(body);
    
    // Create left wing using custom shape (epsilon-like)
    const leftWingShape = new THREE.Shape();
    leftWingShape.moveTo(-0.0, 0.1);  // Start point
    leftWingShape.lineTo(-0.1, 0.15);  // Top outer point
    leftWingShape.lineTo(-0.15, 0.08); // Middle outer point (jagged)
    leftWingShape.lineTo(-0.08, 0.05); // Middle inner point
    leftWingShape.lineTo(-0.12, -0.02); // Lower outer point (jagged)
    leftWingShape.lineTo(-0.05, -0.08); // Bottom outer point
    leftWingShape.lineTo(-0.0, -0.05); // Bottom inner point
    leftWingShape.lineTo(-0.0, 0.1);  // Back to start
    
    const leftWingGeometry = new THREE.ShapeGeometry(leftWingShape);
    const wingMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xff0000, // Red
      side: THREE.DoubleSide 
    });
    
    const leftWing = new THREE.Mesh(leftWingGeometry, wingMaterial);
    this.group.add(leftWing);
    
    // Create right wing using custom shape (epsilon-like, mirrored)
    const rightWingShape = new THREE.Shape();
    rightWingShape.moveTo(0.0, 0.1);   // Start point
    rightWingShape.lineTo(0.1, 0.15);   // Top outer point
    rightWingShape.lineTo(0.15, 0.08);  // Middle outer point (jagged)
    rightWingShape.lineTo(0.08, 0.05);  // Middle inner point
    rightWingShape.lineTo(0.12, -0.02); // Lower outer point (jagged)
    rightWingShape.lineTo(0.05, -0.08); // Bottom outer point
    rightWingShape.lineTo(0.0, -0.05); // Bottom inner point
    rightWingShape.lineTo(0.0, 0.1);   // Back to start
    
    const rightWingGeometry = new THREE.ShapeGeometry(rightWingShape);
    const rightWing = new THREE.Mesh(rightWingGeometry, wingMaterial);
    this.group.add(rightWing);
    
    // Store wing references for animation
    this.leftWing = leftWing;
    this.rightWing = rightWing;
    
    // Add random initial rotation to each butterfly
    this.group.rotation.x = (Math.random() - 0.5) * Math.PI;
    this.group.rotation.y = (Math.random() - 0.5) * Math.PI;
    this.group.rotation.z = (Math.random() - 0.5) * Math.PI;
  }
  
  update() {
    this.time += 0.05;
    this.age++; // Increment age
    
    // Animate wing flapping (less vibration)
    const flapAngle = Math.sin(this.time * 6) * 0.2;
    this.leftWing.rotation.y = flapAngle;
    this.rightWing.rotation.y = -flapAngle;
    
    // Move butterfly in a gentle pattern (less vibration)
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y + Math.sin(this.time * 2) * -0.01;
    this.position.z += this.velocity.z;
    
    // Bounce off boundaries
    if (this.position.x > 4 || this.position.x < -4) {
      this.velocity.x *= -1;
    }
    if (this.position.z > 4 || this.position.z < 0) {
      this.velocity.z *= -1;
    }
    // if (this.position.y > 2 || this.position.y < -2) {
    //   this.velocity.y *= -1;
    // }
    
    this.group.position.set(this.position.x, this.position.y, this.position.z);
    
    // Gentle rotation (less vibration)
    this.group.rotation.y += 0.005;
    
    // Periodic body rotation - butterfly tilts and rolls periodically
    this.group.rotation.x = Math.sin(this.time ) * 0.3; // Pitch rotation
    this.group.rotation.z = Math.cos(this.time) * 0.2; // Roll rotation
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  camera.aspect = windowWidth / windowHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(windowWidth, windowHeight);
}
