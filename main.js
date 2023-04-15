import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

window.addEventListener('load', init)
let scene
let camera
let renderer
let sceneObjects = []
let rings = []

//create uniforms fo
const planetUniforms = {
  colorA: { value: new THREE.Color(0xd0431d) },
  colorB: { value: new THREE.Color(0x1dacd0) },

};

const ringUniforms = {
  colorA: { value: new THREE.Color(0x1ae963) },
  colorB: { value: new THREE.Color(0xd01d37) },
};


function init() {
  //boilerplate three.js code
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.z = 45;
  camera.position.y = 15;
  renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)

  adjustLighting();
  randomSpheres();
  createPlanet();
  createRings(35);
  createRings(45);
  createRings(55);

  const controls = initControls(camera, renderer.domElement);
  //prevents the user from scrolling closer than 35
  controls.minDistance = 35;
  controls.update();
  animate();
}

function adjustLighting() {
  //set ambient light to purple
  let ambientLight = new THREE.AmbientLight(0x663399)
  scene.add(ambientLight)
}

//adding random spheres 
function randomSpheres(){
  const material = new THREE.MeshPhongMaterial({
    color: 0xffaaff, // Default color
    shininess: 100,
  });
  
  // Create 50 spheres with random positions
  for (let i = 0; i < 50; i++) {
    const sphereRadius = Math.random() * 3 + 1; // Random radius between 1 and 4
    const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 32, 32);
    //const sphereColor = new THREE.Color(Math.random(), Math.random(), Math.random());
    material.color = new THREE.Color(340137); //= sphereColor; 
    const sphereMesh = new THREE.Mesh(sphereGeometry, material);
    
    // Random xyz position between 80 and 40 
    sphereMesh.position.set(
      Math.random() * 90 - 50, 
      Math.random() * 90 - 50, 
      Math.random() * 90 - 50 
    );
    scene.add(sphereMesh);
  }
}

//create ring around big sphere, pass in radius int value
function createRings(rad) {
  let radiy = rad
  let temp = false
  if(radiy == 35 || radiy == 55) {
    temp = true;
  }
  const ringGeometry = new THREE.TorusGeometry(radiy, 4, 6, 100, 21);
  const ringMaterial = new THREE.ShaderMaterial({
    wireframe: temp,
    uniforms: ringUniforms,
    vertexShader: vertexShader(),
    fragmentShader: fragmentShader(),
  });

  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.rotation.x = 5;
  scene.add(ring);
  rings.push(ring);
}

function createPlanet() {

  const planetGeometry = new THREE.SphereGeometry(30, 32, 32);
  const planetMaterial = new THREE.ShaderMaterial({
    //wireframe: true,
    uniforms: planetUniforms,
    vertexShader: vertexShader(),
    fragmentShader: fragmentShader(),
  });
  const planet = new THREE.Mesh(planetGeometry, planetMaterial);
  scene.add(planet);
  sceneObjects.push(planet);
  // Set the camera position and look at the black hole
  //camera.position.set( 0, 0, 7 );
  camera.lookAt(planet.position);

}
// Animate the black hole
function animate() {
  requestAnimationFrame(animate);

  // Update the shader uniforms


  for (let objects of sceneObjects) {
    objects.rotation.z += 0.01;
  }


  for (let ring of rings) {

    ring.rotation.z += 0.01;
  }


  // controls.update();
  renderer.render(scene, camera);
}


function vertexShader() {
  return `
    uniform float uTime;
    varying vec3 vPosition;
  
    void main() {
      vPosition = position;
  
    // calculate displacement
      float displacement = sin(uTime + vPosition.y) * 0.1;
  
    // move vertex along its normal based on displacement
      vec3 newPosition = position + normal * displacement;
  
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `
}

function fragmentShader() {
  return `
    uniform float uTime;
    uniform vec3 colorA;
    uniform vec3 colorB;
    varying vec3 vPosition;
  
    void main() {
    // calculate color based on position and time
    vec3 color = mix(colorA, colorB, (sin(uTime + vPosition.y * 0.1  ) + 1.0) * 0.5);
  
      gl_FragColor = vec4(color, 1.0);
    }
  `
}

function initControls(camera, canvas) {
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;
  controls.minDistance = 10;
  controls.maxDistance = 500;
  controls.maxPolarAngle = Math.PI / 2;

  return controls;
}

/*

alternative code for shader: 
function vertexShader() {
  return `
    varying vec3 vUv; 
    varying vec4 modelViewPosition; 
    varying vec3 vecNormal;

    void main() {
      vUv = position; 
      vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
      vecNormal = (modelViewMatrix * vec4(normal, 0.0)).xyz; //????????
      gl_Position = projectionMatrix * modelViewPosition; 
    }
  `
}

function fragmentShader() {
  return `
      uniform vec3 colorA; 
      uniform vec3 colorB; 
      varying vec3 vUv;

      void main() {
        
        gl_FragColor = vec4(mix(colorA, colorB, vUv.x), 1.0);
      }
  `
}
*/
