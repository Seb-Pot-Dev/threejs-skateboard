// Imports
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

// Configuration
const CONFIG = {
    objToRender: 'skateboard-1',
    animationDuration: {
        flip360: 1500,
        kickflip: 1000
    },
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

function animateKickflip() {
    if (isAnimating) return;
    
    isAnimating = true;
    const startTime = Date.now();

    function rotate() {
        const now = Date.now();
        const elapsedTime = now - startTime;
        let progress = Math.min(elapsedTime / CONFIG.animationDuration.kickflip, 1);
        const easedProgress = easeInOutQuad(progress);

        object.rotation.x = easedProgress * Math.PI * 2;

        if (progress < 1) {
            requestAnimationFrame(rotate);
        } else {
            isAnimating = false;
        }
    }

    rotate();
}

// Event listeners
function setupEventListeners() {
    window.addEventListener('resize', onWindowResize, false);
    document.getElementById('triggerElement360flip').addEventListener('click', animate360flip);
    document.getElementById('triggerElementKickflip').addEventListener('click', animateKickflip);
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