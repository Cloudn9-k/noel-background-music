<script setup>
defineProps({
  isLoading: Boolean
});
const emit = defineEmits(['play-default', 'upload-file']);

const handleFile = (event) => {
  if(event.target.files.length > 0) {
    emit('upload-file', event.target.files[0]);
  }
};
</script>

<template>
  <div class="music-overlay">
    <div class="menu-box">
      <h2 class="title">🎄 Merry Christmas, Em Yêu! 🎄</h2>
      
      <div v-if="isLoading" class="text-loading">
        Đang tải nhạc... chờ xíu nha...
      </div>
      
      <div v-else class="actions">
        <button class="btn-play" @click="emit('play-default')">
          ▶ Bắt đầu (Last Christmas)
        </button>

        <div class="separator">HOẶC</div>

        <label for="upload" class="btn-upload">
          Chọn bài hát khác của em
        </label>
        <input type="file" id="upload" hidden accept="audio/*" @change="handleFile" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.music-overlay {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.85); z-index: 100;
}
.menu-box {
  text-align: center; padding: 40px; border-radius: 20px;
  background: #1e1e1e; border: 2px solid #c5a880;
  box-shadow: 0 0 30px rgba(197, 168, 128, 0.3);
  max-width: 400px; width: 90%;
}
.title {
  color: #ff4d4d; font-family: 'Mountains of Christmas', cursive;
  font-size: 1.8rem; margin-bottom: 30px;
}
.btn-play {
  background: #22c55e; color: white; border: none;
  padding: 15px 30px; font-size: 1.2rem; border-radius: 50px;
  cursor: pointer; transition: transform 0.2s; font-weight: bold;
  width: 100%; margin-bottom: 10px;
  box-shadow: 0 5px 15px rgba(34, 197, 94, 0.4);
}
.btn-play:hover { transform: scale(1.05); background: #16a34a; }

.btn-upload {
  display: block; background: transparent; border: 1px dashed #c5a880;
  color: #c5a880; padding: 12px; border-radius: 10px; cursor: pointer;
  transition: all 0.3s;
}
.btn-upload:hover { background: rgba(197, 168, 128, 0.1); border-style: solid; }

.separator { margin: 20px 0; color: #888; font-size: 0.9rem; }
.text-loading { color: #c5a880; animation: pulse 1s infinite; font-size: 1.2rem; }
@keyframes pulse { 0% { opacity: 0.6; } 100% { opacity: 1; } }
@media (max-width: 768px) {
    .menu-box {
        width: 85%; /* Rộng gần hết màn hình */
        padding: 20px;
    }
    .title {
        font-size: 1.5rem; /* Chữ tiêu đề nhỏ lại */
    }
    .btn-play, .btn-upload {
        padding: 15px; /* Vùng bấm lớn hơn */
        font-size: 1rem;
    }
}
</style>