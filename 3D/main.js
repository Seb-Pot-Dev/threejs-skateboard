// Imports
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

// Configuration
const CONFIG = {
    objToRender: 'skateboard-1',
    scale: { x: 0.5, y: 0.5, z: 0.5 }, // Nouvelle propriété pour définir l'échelle
    animationDuration: {
        flip360: 1500,
        kickflip: 750,
        popThenFlick: 1200
    },
    maxVerticalOffset: 0.15,
    camera: {
        fov: 50,
        near: 0.1,
        far: 1000
    }
};

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    CONFIG.camera.fov,
    window.innerWidth / window.innerHeight,
    CONFIG.camera.near,
    CONFIG.camera.far
);
const renderer = new THREE.WebGLRenderer({ alpha: true });

// Global variables
let object;
let controls;
let isAnimating = false;
let container = new THREE.Object3D();
let modelLoader;

// Initialize scene
function initScene() {
    modelLoader = document.querySelector('three-model-loader');
    
    renderer.setSize(window.innerWidth * 2, window.innerHeight * 2);
    document.getElementById("container3D").appendChild(renderer.domElement);
    camera.position.z = CONFIG.objToRender === "skateboard-1" ? 1 : 500;
    scene.add(container);
    
    setupLights();
    setupControls();
    loadModel();
    setupEventListeners();
}

// Lighting setup
function setupLights() {
    const topLight = new THREE.DirectionalLight(0xffffff, 1);
    topLight.position.set(500, 500, 500);
    topLight.castShadow = true;
    scene.add(topLight);

    const ambientLight = new THREE.AmbientLight(0x333333, CONFIG.objToRender === "skateboard-1" ? 5 : 1);
    scene.add(ambientLight);
}

// Controls setup
function setupControls() {
    if (CONFIG.objToRender === "skateboard-1") {
        controls = new OrbitControls(camera, renderer.domElement);
    }
}

// Model loading
function loadModel() {
    const loadingManager = new THREE.LoadingManager();
    
    loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
        const progress = itemsLoaded / itemsTotal;
        modelLoader.updateProgress(progress, CONFIG.objToRender);
    };

    loadingManager.onLoad = () => {
        modelLoader.updateProgress(1.0, CONFIG.objToRender);
        setTimeout(() => {
            modelLoader.hide();
            document.getElementById("container3D").style.opacity = 1;
        }, 200);
    };

    const loader = new GLTFLoader(loadingManager);
    loader.load(`models/${CONFIG.objToRender}/scene.gltf`, function (gltf) {
        object = gltf.scene;
        object.scale.set(CONFIG.scale.x, CONFIG.scale.y, CONFIG.scale.z);

        container.add(object);
    });
}

// Animation functions
function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function animate360flip() {
    if (isAnimating) return;
    
    isAnimating = true;

    const delay = 30
    setTimeout(() => {
        animatePopThenFlick();
    }, delay);

    const startTime = Date.now();
    function rotate() {
        const now = Date.now();
        const elapsedTime = now - startTime;
        let progress = Math.min(elapsedTime / CONFIG.animationDuration.flip360, 1);
        const easedProgress = easeInOutQuad(progress);

        object.rotation.x = easedProgress * Math.PI * 2;
        container.rotation.y = easedProgress * Math.PI * 2;

        if (progress < 1) {
            requestAnimationFrame(rotate);
        } else {
            isAnimating = false;
            }
        }

    rotate();
}



function animatePopThenFlick() {
    const startTime = Date.now();

    function animate() {
        const now = Date.now();
        const elapsedTime = now - startTime;
        let progress = Math.min(elapsedTime / CONFIG.animationDuration.popThenFlick, 1);

        // Smooth phase-based rotation
        let rotationZ = 0;

        if (progress < 0.25) {
            // Phase 1: Tail pop
            const phase1Progress = easeInOutQuad(progress * 4);
            rotationZ = phase1Progress * (Math.PI / 4); // Up to 45 degrees
        } else if (progress < 0.5) {
            // Phase 2: Level out to -15 degrees
            const phase2Progress = easeInOutQuad((progress - 0.25) * 4);
            const startAngle = Math.PI / 4; // From 45 degrees
            const targetAngle = -Math.PI / 12; // To -15 degrees
            rotationZ = startAngle + phase2Progress * (targetAngle - startAngle);
        } else if (progress < 0.75) {
            // Phase 3: Right side down
            const phase3Progress = easeInOutQuad((progress - 0.5) * 4);
            const startAngle = -Math.PI / 12; // From -15 degrees
            const targetAngle = -Math.PI / 4; // To -45 degrees
            rotationZ = startAngle + phase3Progress * (targetAngle - startAngle);
        } else {
            // Phase 4: Return to initial position
            const phase4Progress = easeInOutQuad((progress - 0.75) * 4);
            const startAngle = -Math.PI / 4; // From -45 degrees
            const targetAngle = 0; // Back to 0
            rotationZ = startAngle + phase4Progress * (targetAngle - startAngle);
        }

        object.rotation.z = rotationZ;

        // Smooth vertical movement across all phases
        let verticalOffset = 0;
        if (progress < 0.5) {
            // Upward movement in the first half
            verticalOffset = easeInOutQuad(progress * 2) * CONFIG.maxVerticalOffset;
        } else {
            // Downward movement in the second half
            verticalOffset = easeInOutQuad((1 - progress) * 2) * CONFIG.maxVerticalOffset;
        }
        object.position.y = verticalOffset;

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            isAnimating = false;
            object.rotation.z = 0; // Ensure we end at 0
            object.position.y = 0; // Reset position
        }
    }

    animate();
}




function animateKickflip() {
    if (isAnimating) return;

    isAnimating = true;

    // Start the pop animation immediately
    animatePopThenFlick();

    // Delay the kickflip rotation animation
    const kickflipDelay = 110; // Adjust this delay as needed (in milliseconds)
    setTimeout(() => {
        const startTime = Date.now();

        // Rotate animation for the kickflip
        function rotate() {
            const now = Date.now();
            const elapsedTime = now - startTime;
            let progress = Math.min(elapsedTime / CONFIG.animationDuration.kickflip, 1);
            const easedProgress = easeInOutQuad(progress);

            object.rotation.x = easedProgress * Math.PI * 2;

            // slightly push the board down on right side like phase 2 of popThenFlick 
            setTimeout(() => {
                object.rotation.y = easedProgress * CONFIG.maxVerticalOffset;
            }, 100);

            if (progress < 1) {
                requestAnimationFrame(rotate);
            } else {
                isAnimating = false;
            }
        }

        rotate(); // Start the kickflip rotation
    }, kickflipDelay);
}


// Event listeners
function setupEventListeners() {
    window.addEventListener('resize', onWindowResize, false);
    document.getElementById('triggerElement360flip').addEventListener('click', animate360flip);
    document.getElementById('triggerElementKickflip').addEventListener('click', animateKickflip);
    document.getElementById('triggerElementOllie').addEventListener('click', animatePopThenFlick);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Render loop
function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

// Initialize and start
initScene();
render();