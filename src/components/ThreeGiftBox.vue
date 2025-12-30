<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const canvasRef = ref(null);
let scene, camera, renderer, controls, animationId;
let giftMeshRef = null; 

const MODEL_URL = '/models/model2.glb';

const init = () => {
  scene = new THREE.Scene();

  const width = canvasRef.value.clientWidth;
  const height = canvasRef.value.clientHeight;
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(3, 2, 4); 

  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    alpha: true, 
    antialias: true
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace; 
  renderer.toneMapping = THREE.ACESFilmicToneMapping; 
  renderer.toneMappingExposure = 1.0; 

  controls = new OrbitControls(camera, canvasRef.value);
  controls.enableDamping = true;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 4.0;
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.maxPolarAngle = Math.PI / 2; 

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const spotLight = new THREE.SpotLight(0xffd700, 5);
  spotLight.position.set(5, 5, 5);
  spotLight.castShadow = true;
  scene.add(spotLight);

  const loader = new GLTFLoader();
  loader.load(MODEL_URL, (gltf) => {
    let foundMesh = null;
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        if (child.name.toLowerCase().includes('gift') || (child.material.name && child.material.name.includes('Gift'))) {
            foundMesh = child;
        }
      }
    });

    if (foundMesh) {
        giftMeshRef = foundMesh.clone(); 
        giftMeshRef.position.set(0, 0, 0);
        giftMeshRef.rotation.set(0, 0, 0);
        giftMeshRef.material = new THREE.MeshPhysicalMaterial({
            color: 0xd60000,
            emissive: 0xffaa00,  
            emissiveIntensity: 1,
            metalness: 0.6,
            roughness: 0.2,
            clearcoat: 1.0,
            side: THREE.DoubleSide
        });

        scene.add(giftMeshRef);

        const box = new THREE.Box3().setFromObject(giftMeshRef);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3()).length();
        
        giftMeshRef.position.sub(center); 
        controls.target.set(0, 0, 0);
        camera.position.set(size, size * 0.8, size);
        camera.lookAt(0, 0, 0);
        
        console.log("✅ Đã load quà và bắt đầu hiệu ứng nhấp nháy!");

    } else {
        scene.add(gltf.scene);
        gltf.scene.scale.set(0.1, 0.1, 0.1);
    }
  });

  window.addEventListener('resize', onWindowResize);
  animate();
};

const onWindowResize = () => {
  if (!canvasRef.value) return;
  const width = canvasRef.value.clientWidth;
  const height = canvasRef.value.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
};

const animate = () => {
  animationId = requestAnimationFrame(animate);
  
  if (giftMeshRef && giftMeshRef.material) {
    const time = Date.now() * 0.005; 
    const intensity = (Math.sin(time) + 1) * 1.0 + 0.5; 
    
    giftMeshRef.material.emissiveIntensity = intensity;
  }

  controls.update();
  renderer.render(scene, camera);
};

onMounted(() => {
  init();
});

onBeforeUnmount(() => {
  cancelAnimationFrame(animationId);
  window.removeEventListener('resize', onWindowResize);
  if (renderer) renderer.dispose();
  if (scene.environment) scene.environment.dispose();
});
</script>

<template>
  <div class="gift-3d-wrapper">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<style scoped>
.gift-3d-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}
canvas {
  width: 100% !important;
  height: 100% !important;
  outline: none;
  display: block;
  filter: drop-shadow(0 0 10px rgba(255, 165, 0, 0.5));
}
</style>