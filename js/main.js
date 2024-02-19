//Import the THREE.js library
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
// To allow for the camera to move around the scene
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
// To allow for importing the .gltf file
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

//Create a Three.JS Scene
const scene = new THREE.Scene();
//create a new camera with positions and angles
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

//Keep track of the mouse position, so we can make the skateboard-1 move
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

//Keep the 3D object on a global variable so we can access it later
let object;

//OrbitControls allow the camera to move around the scene
let controls;

//Set which object to render
let objToRender = 'skateboard-1';

//Instantiate a loader for the .gltf file
const loader = new GLTFLoader();

//Load the file
loader.load(
  `models/${objToRender}/scene.gltf`,
  function (gltf) {
    //If the file is loaded, add it to the scene
    object = gltf.scene;
    scene.add(object);
  },
  function (xhr) {
    //While it is loading, log the progress
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
  },
  function (error) {
    //If there is an error, log it
    console.error(error);
  }
);

//Instantiate a new renderer and set its size
const renderer = new THREE.WebGLRenderer({ alpha: true }); //Alpha: true allows for the transparent background
renderer.setSize(window.innerWidth*4, window.innerHeight*4);

//Add the renderer to the DOM
document.getElementById("container3D").appendChild(renderer.domElement);

//Set how far the camera will be from the 3D model
camera.position.z = objToRender === "skateboard-1" ? 1 : 500;

//Add lights to the scene, so we can actually see the 3D model
const topLight = new THREE.DirectionalLight(0xffffff, 1); // (color, intensity)
topLight.position.set(500, 500, 500) //top-left-ish
topLight.castShadow = true;
scene.add(topLight);

const ambientLight = new THREE.AmbientLight(0x333333, objToRender === "skateboard-1" ? 5 : 1);
scene.add(ambientLight);

//This adds controls to the camera, so we can rotate / zoom it with the mouse
if (objToRender === "skateboard-1") {
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false; // Désactiver le zoom
}

//Render the scene
function animate() {
  requestAnimationFrame(animate);
  //Here we could add some code to update the scene, adding some automatic movement

  //Make the skateboard-1 move
  if (object && objToRender === "skateboard-1") {
    //I've played with the constants here until it looked good 
    // object.rotation.y = -3 + mouseX / window.innerWidth * 3;
    // object.rotation.x = -1.2 + mouseY * 2.5 / window.innerHeight;
  }
  renderer.render(scene, camera);
}

//Add a listener to the window, so we can resize the window and the camera
window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// //add mouse position listener, so we can make the skateboard-1 move
// document.onmousemove = (e) => {
//   mouseX = e.clientX;
//   mouseY = e.clientY;
// }

// Initialize a variable to keep track of the total scroll height
let totalScrollHeight = document.documentElement.scrollHeight - window.innerHeight;

// // Add the scroll event listener
// window.addEventListener('scroll', () => {
//     // Calculate the current scroll progress as a fraction
//     let scrollFraction = window.scrollY / totalScrollHeight;

//     // Convert the scroll fraction to a full rotation (in radians)
//     let rotationY = scrollFraction * Math.PI * 3; // 2 * PI for a full rotation

//     // Apply the rotation to the object
//     if (object) {
//         object.rotation.y = rotationY;
//     }
// });

// Sélectionner l'élément déclencheur
const triggerElement = document.getElementById('trigger-skate-1');

// Fonction pour démarrer l'animation de rotation
let isAnimating = false;
let startRotation = 0;
let endRotation = 0;
const rotationIncrement = Math.PI * 2; // 360 degrés en radians
const rotationSpeed = 0.06; // Ajustez cette valeur pour contrôler la vitesse de l'animation



///////////////////////// sans ease ////////////////////////////////
// function animateRotation() {
//     if (!object || isAnimating) return; // Si l'objet n'est pas défini ou l'animation est déjà en cours, ne rien faire
    
//     isAnimating = true;
//     let startYRotation = object.rotation.y;
//     let startXRotation = object.rotation.x;
//     let endYRotation = startYRotation + Math.PI * 2; // 360 degrés sur l'axe Y
//     let endXRotation = startXRotation - Math.PI * 2; // 360 degrés sur l'axe X, dans le sens inverse
  
//     function rotate() {
//       // Vérifier si l'une des animations doit continuer
//       if (object.rotation.y < endYRotation || object.rotation.x > endXRotation) {
//         if (object.rotation.y < endYRotation) {
//           object.rotation.y += rotationSpeed;
//         }
//         if (object.rotation.x > endXRotation) {
//           object.rotation.x -= rotationSpeed;
//         }
//         requestAnimationFrame(rotate); // Continuer l'animation
//       } else {
//         // Ajuster pour s'assurer que les rotations atteignent exactement 360 degrés
//         object.rotation.y = endYRotation;
//         object.rotation.x = endXRotation;
//         isAnimating = false; // Réinitialiser le contrôle de l'animation
//       }
//     }
  
//     rotate();
//   }
  
//   // Attachez l'écouteur d'événement de clic pour déclencher l'animation
//   triggerElement.addEventListener('click', animateRotation);
  
///////////////////////// avec ease ////////////////////////////////
// Fonction d'ease-in-out qui commence et finit lentement mais est plus rapide au milieu
function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }
  
  function animateRotation() {
    if (!object || isAnimating) return; // Ne rien faire si l'objet n'est pas défini ou si l'animation est déjà en cours
    
    isAnimating = true;
    const duration = 1500; // Durée de l'animation en millisecondes
    const startTime = Date.now();
  
    function rotate() {
      const now = Date.now();
      const elapsedTime = now - startTime;
      let progress = elapsedTime / duration;
      if (progress > 1) progress = 1; // S'assurer que le progrès ne dépasse pas 1
  
      // Appliquer la fonction d'ease au progrès
      const easedProgress = easeInOutQuad(progress);
  
      // Calculer et appliquer les rotations en utilisant le progrès ajusté par l'ease
      object.rotation.y = easedProgress * Math.PI * 2; // Rotation complète sur Y
      object.rotation.x = easedProgress * Math.PI * 2; // Rotation complète sur X, dans le même sens pour simplifier
  
      if (progress < 1) {
        requestAnimationFrame(rotate); // Continuer l'animation
      } else {
        isAnimating = false; // Fin de l'animation
      }
    }
  
    rotate();
  }
  
  // Attachez l'écouteur d'événement de clic pour déclencher l'animation
  triggerElement.addEventListener('click', animateRotation);
  
//Start the 3D rendering
animate();