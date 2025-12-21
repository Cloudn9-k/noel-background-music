<script setup>
import { ref } from 'vue';
import ThreeAudioScene from './components/ThreeAudioScene.vue';
import GiftSection from './components/GiftSection.vue';
import LetterModal from './components/LetterModal.vue';

// --- DATA ---
// Thêm thuộc tính isRevealed: false vào mỗi món quà
const giftList = ref([
  {
    id: 1,
    title: "Gửi người yêu của anh",
    color: "#ef4444",
    img: "https://i.pinimg.com/564x/15/0f/73/150f73f55fb8caae94017601b0d2d34a.jpg",
    content: "Giáng sinh đầu tiên mình bên nhau. \nCảm ơn em đã xuất hiện trong cuộc đời anh.",
    isRevealed: false // Chưa hiện hộp quà (đang là tia sáng)
  },
  {
    id: 2,
    title: "Kỷ niệm đáng nhớ",
    color: "#22c55e",
    img: "https://i.pinimg.com/564x/66/4f/93/664f933db6055d28991a1315e12dc26d.jpg",
    content: "Nhớ cái hôm mình đi dạo dưới mưa không?\nLúc đó lạnh nhưng có em nên ấm lắm.",
    isRevealed: false
  },
  {
    id: 3,
    title: "Mãi bên nhau nhé",
    color: "#eab308",
    img: "https://i.pinimg.com/564x/85/3d/03/853d03157e3f8430ea45145b41bd8319.jpg",
    content: "Năm sau, năm sau nữa,\nchúng mình vẫn sẽ cùng đón Noel nhé.\nAnh yêu em <3",
    isRevealed: false
  }
]);

const areGiftsVisible = ref(false);
const isModalOpen = ref(false);
const currentLetter = ref(null);

// Khi Scene 3D đã sẵn sàng
const handleSceneReady = () => {
    // Đợi 2.5s để nhạc vào nhịp rồi mới thả tia sáng xuống
    setTimeout(() => {
        areGiftsVisible.value = true;
    }, 2500);
};

const handleOpenGift = (gift) => {
  currentLetter.value = gift;
  isModalOpen.value = true;
};

// KHI ĐÓNG MODAL -> BIẾN TIA SÁNG THÀNH HỘP QUÀ
const handleCloseModal = () => {
  isModalOpen.value = false;
  if (currentLetter.value) {
    // Tìm món quà vừa mở và đánh dấu là đã lộ diện
    const gift = giftList.value.find(g => g.id === currentLetter.value.id);
    if (gift) {
        gift.isRevealed = true;
    }
    currentLetter.value = null;
  }
};
</script>

<template>
  <div class="app-container">
    <ThreeAudioScene @scene-ready="handleSceneReady" />

    <GiftSection 
      :gifts="giftList" 
      :is-visible="areGiftsVisible" 
      @open-gift="handleOpenGift"
    />

    <LetterModal 
      :is-open="isModalOpen" 
      :letter-data="currentLetter" 
      @close="handleCloseModal" 
    />
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Ephesis&family=Mountains+of+Christmas:wght@700&display=swap');

body {
  margin: 0; padding: 0; overflow: hidden;
  background-color: #161616;
  font-family: 'Mountains of Christmas', cursive;
}
.app-container {
  position: relative; width: 100vw; height: 100vh;
}
</style>