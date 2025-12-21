<script setup>
defineProps({
  isOpen: Boolean,
  letterData: Object
});

const emit = defineEmits(['close']);
</script>

<template>
  <div class="modal-overlay" :class="{ 'active': isOpen }" @click="emit('close')">
    <div class="letter" @click.stop v-if="letterData">
        <span class="close-btn" @click="emit('close')">&times;</span>
        <img :src="letterData.img" alt="Memory">
        <h2>{{ letterData.title }}</h2>
        <p>{{ letterData.content }}</p>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.85);
    display: flex; justify-content: center; align-items: center;
    z-index: 100;
    opacity: 0; visibility: hidden;
    transition: all 0.4s ease;
    backdrop-filter: blur(5px);
}
.modal-overlay.active { opacity: 1; visibility: visible; }

.letter {
    background: #fff; width: 90%; max-width: 500px; padding: 30px;
    border-radius: 5px; position: relative;
    transform: scale(0.7) rotate(-5deg);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    background-image: url('https://www.transparenttextures.com/patterns/paper.png');
    box-shadow: 0 0 30px rgba(255,255,255,0.2);
    text-align: center;
}
.modal-overlay.active .letter { transform: scale(1) rotate(0deg); }

.letter img {
    width: 100%; height: 250px; object-fit: cover;
    border: 8px solid white; box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    margin-bottom: 20px; transform: rotate(2deg);
}
.letter h2 { color: #d32f2f; margin: 0; font-size: 2.5rem; font-family: 'Mountains of Christmas', cursive; }
.letter p { font-size: 1.1rem; line-height: 1.6; color: #333; margin-top: 15px; white-space: pre-line; }
.close-btn { position: absolute; top: 10px; right: 15px; font-size: 30px; cursor: pointer; color: #333; }
</style>