// Imports
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

// Configuration
const CONFIG = {
    objToRender: 'skateboard-1',
    scale: { x: 0.5, y: 0.5, z: 0.5 }, // Nouvelle propriété pour définir l'échelle
    animationDuration: {
        flip360: 1200,
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

// Add raycaster and mouse vector
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Interactive zones and highlight boxes
let interactiveZones = {};
let highlightBoxes = {};

// Function to define an interactive zone
function defineInteractiveZone(zoneName, minVector, maxVector) {
    // Create a bounding box for the specified zone
    interactiveZones[zoneName] = new THREE.Box3(minVector, maxVector);
}

// Function to create a highlight box
function createHighlightBox(zoneName, color) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: color, wireframe: true });
    const highlightBox = new THREE.Mesh(geometry, material);
    highlightBox.visible = false; // Initially hidden
    scene.add(highlightBox);
    highlightBoxes[zoneName] = highlightBox;
}

// Function to handle mouse click
function onDocumentMouseClick(event) {
    event.preventDefault();

    // Calculate mouse position in normalized device coordinates (-1 to +1) for both components
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the raycaster with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObject(object, true);

    if (intersects.length > 0) {
        const intersectionPoint = intersects[0].point;

        // Check if the intersection point is within any defined interactive zone
        for (const [zoneName, zone] of Object.entries(interactiveZones)) {
            if (zone.containsPoint(intersectionPoint)) {
                // Trigger the corresponding animation based on the zone
                if (zoneName === 'tail') {
                    animatePopThenFlick();
                } else if (zoneName === 'kickflip') {
                    animateKickflip();
                } else if (zoneName === '360flip') {
                    animate360flip();
                }
                // Hide the highlight box after clicking
                highlightBoxes[zoneName].visible = false;
                break;
            }
        }
    }
}

// Function to handle mouse move
function onDocumentMouseMove(event) {
    event.preventDefault();

    // Calculate mouse position in normalized device coordinates (-1 to +1) for both components
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the raycaster with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObject(object, true);

    if (intersects.length > 0) {
        const intersectionPoint = intersects[0].point;

        // Check if the intersection point is within any defined interactive zone
        let isHovering = false;
        for (const [zoneName, zone] of Object.entries(interactiveZones)) {
            if (zone.containsPoint(intersectionPoint)) {
                // Position and show the corresponding highlight box
                const highlightBox = highlightBoxes[zoneName];
                highlightBox.position.copy(zone.getCenter(new THREE.Vector3()));
                highlightBox.scale.set(
                    zone.max.x - zone.min.x,
                    zone.max.y - zone.min.y,
                    zone.max.z - zone.min.z
                );
                highlightBox.visible = true;
                isHovering = true;
            } else {
                highlightBoxes[zoneName].visible = false;
            }
        }
        if (isHovering) {
            document.body.style.cursor = 'pointer'; // Change cursor to pointer
        } else {
            document.body.style.cursor = 'default'; // Reset cursor
            Object.values(highlightBoxes).forEach(box => box.visible = false);
        }
    } else {
        document.body.style.cursor = 'default'; // Reset cursor
        Object.values(highlightBoxes).forEach(box => box.visible = false);
    }
}

// Initialize scene
function initScene() {
    modelLoader = document.querySelector('three-model-loader');
    
    renderer.setSize(window.innerWidth * 2, window.innerHeight * 2);
    document.getElementById("container3D").appendChild(renderer.domElement);
    camera.position.z = CONFIG.objToRender === "skateboard-1" ? 1 : 500;
    scene.add(container);
    
    setupLights();
    setupControls();
    createHighlightBox('tail', 0xff0000); // Red box for ollie
    createHighlightBox('kickflip', 0x00ffff); // Light blue box for kickflip
    createHighlightBox('360flip', 0x00ff00); // Green box for 360 flip
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

        // Define the interactive zones after the model is loaded
        const box = new THREE.Box3().setFromObject(object);
        defineInteractiveZone('tail', new THREE.Vector3(box.min.x, box.min.y + 0.045, box.min.z + 0.03), new THREE.Vector3(box.min.x + 0.05, box.max.y, box.max.z - 0.03));
        defineInteractiveZone('360flip', new THREE.Vector3(box.min.x + 0.025, box.min.y + 0.040, box.min.z + 0), new THREE.Vector3(box.min.x + 0.075, box.max.y, box.min.z + 0.03));
        defineInteractiveZone('kickflip', new THREE.Vector3(box.max.x - 0.12, box.min.y + 0.035, box.min.z + 0.05), new THREE.Vector3(box.max.x - 0.05, box.max.y - 0.015, box.max.z));
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

            // Remove the tilt effect
            // object.rotation.y = easedProgress * CONFIG.maxVerticalOffset; // This line is removed

            if (progress < 1) {
                requestAnimationFrame(rotate);
            } else {
                isAnimating = false;
                object.rotation.x = 0; // Ensure we end at 0
            }
        }

        rotate(); // Start the kickflip rotation
    }, kickflipDelay);
}


// Event listeners
function setupEventListeners() {
    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.getElementById('triggerElement360flip').addEventListener('click', animate360flip);
    document.getElementById('triggerElementKickflip').addEventListener('click', animateKickflip);
    document.getElementById('triggerElementOllie').addEventListener('click', animatePopThenFlick);
    document.addEventListener('click', onDocumentMouseClick, false);
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