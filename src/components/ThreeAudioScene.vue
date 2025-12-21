<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { addTree, addSnow, addPlane } from '../utils/visualizerHelpers.js'; // Import logic
import MusicPlayer from './MusicPlayer.vue'; // Import UI

const emit = defineEmits(['scene-ready']);
const containerRef = ref(null);
const isPlaying = ref(false);
const isLoading = ref(false);

// Biến Three.js
let scene, camera, renderer, composer, analyser, audio;
let uniforms = { time: { value: 0 }, step: { value: 0 }, tAudioData: { value: null } };
let animationId;

// Cấu hình
const fftSize = 2048;
const defaultSongUrl = '/music/last-christmas.mp3'; // File bạn tải về

const initScene = () => {
  // 1. Setup cơ bản
  scene = new THREE.Scene();
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  containerRef.value.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.set(-0.09, -2.55, 24.42);
  camera.rotation.set(0.1, -0.003, 0.0004);

  // 2. Audio Texture
  const format = renderer.capabilities.isWebGL2 ? THREE.RedFormat : THREE.LuminanceFormat;
  uniforms.tAudioData.value = new THREE.DataTexture(analyser.data, fftSize / 2, 1, format);

  // 3. Gọi hàm tạo hình từ file helpers
  addPlane(scene, uniforms, 3000);
  addSnow(scene, uniforms);
  
  // Hàng cây nền
  Array.from({ length: 10 }).forEach((_, i) => {
    addTree(scene, uniforms, 4000, [20, 0, -20 * i]);
    addTree(scene, uniforms, 4000, [-20, 0, -20 * i]);
  });
  // Cây chính
  addTree(scene, uniforms, 5000, [0, 0, -5]); 

  // Post-processing (Bloom)
  const renderScene = new RenderPass(scene, camera);
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
  bloomPass.threshold = -1; bloomPass.strength = -1; bloomPass.radius = 0.5;

  composer = new EffectComposer(renderer);
  composer.addPass(renderScene);
  composer.addPass(bloomPass);

  animate();
  emit('scene-ready');
};

const animate = () => {
  if (!analyser) return;
  analyser.getFrequencyData();
  uniforms.tAudioData.value.needsUpdate = true;
  uniforms.time.value = performance.now();
  uniforms.step.value = (uniforms.step.value + 1) % 1000;
  composer.render();
  animationId = requestAnimationFrame(animate);
};

// Xử lý Play nhạc
const handlePlayDefault = () => {
    isLoading.value = true;
    const loader = new THREE.AudioLoader();
    loader.load(defaultSongUrl, (buffer) => {
        setupAudio(buffer);
    }, undefined, (err) => {
        alert("Không tìm thấy file nhạc! Bạn nhớ tải file 'last-christmas.mp3' vào thư mục public/music/ nhé.");
        isLoading.value = false;
    });
};

const handleUploadFile = (file) => {
    isLoading.value = true;
    const reader = new FileReader();
    reader.onload = (e) => {
        const context = audio.context; 
        context.decodeAudioData(e.target.result, (buffer) => {
            setupAudio(buffer);
        });
    };
    reader.readAsArrayBuffer(file);
};

const setupAudio = (buffer) => {
    if (audio.isPlaying) audio.stop();
    audio.setBuffer(buffer);
    audio.play();
    analyser = new THREE.AudioAnalyser(audio, fftSize);
    
    isLoading.value = false;
    isPlaying.value = true;
    
    // Khởi tạo visualizer nếu chưa có
    if (!scene) initScene();
};

onMounted(() => {
    const listener = new THREE.AudioListener();
    audio = new THREE.Audio(listener);
    
    window.addEventListener('resize', () => {
        if (!camera || !renderer) return;
        const w = window.innerWidth, h = window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        composer.setSize(w, h);
    });
});

onBeforeUnmount(() => {
    cancelAnimationFrame(animationId);
    if(audio && audio.isPlaying) audio.stop();
});
</script>

<template>
  <div class="scene-wrapper" ref="containerRef">
    <MusicPlayer 
      v-if="!isPlaying" 
      :is-loading="isLoading"
      @play-default="handlePlayDefault"
      @upload-file="handleUploadFile"
    />
  </div>
</template>

<style scoped>
.scene-wrapper {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    background: #161616; overflow: hidden;
}
</style>