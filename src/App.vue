<script setup>
import { ref } from 'vue';
import ThreeAudioScene from './components/ThreeAudioScene.vue';
import GiftSection from './components/GiftSection.vue';
import LetterModal from './components/LetterModal.vue';

const giftList = ref([
  {
    id: 1,
    title: "Lời xin lỗi đáng iu",
    color: "#ef4444",
    img: "public/anh1.jpg", 
    content: "Anh yêu em nhất trên đời!\nHộp quà đầu tiên là lời xin lỗi muốn gửi tới em vì ko đưa em kịp vào ngày Giáng Sinh.\nMong rằng em sẽ nhận lời xin lũi đáng iu của anh ạaaa ❤️",
    isRevealed: false
  },
  {
    id: 2,
    title: "Giáng Sinh & Năm Mới",
    color: "#22c55e", 
    img: "public/anh2.jpg", 
    content: "Giáng Sinh này, cùng với năm mới,\nchúc em thật nhiều sức khoẻ, thật nhiều may mắn, và đón nhận tình iu của anh nhiều hơnnnnnnnnnnnnnn 🥰",
    isRevealed: false
  },
  {
    id: 3,
    title: "Tương lai rực rỡ",
    color: "#eab308", 
    img: "public/anh3.jpg",
    content: "Chúc em công việc, học tập hanh thông thuận lợi.\nMọi điều đến với em đều như em mong muốn ạaaaaa 🌟",
    isRevealed: false
  }
]);

const areGiftsVisible = ref(false);
const isModalOpen = ref(false);
const currentLetter = ref(null);

const handleSceneReady = () => {
    setTimeout(() => {
        areGiftsVisible.value = true;
    }, 1000);
};

const handleOpenGift = (gift) => {
  currentLetter.value = gift;
  isModalOpen.value = true;
};

const handleCloseModal = () => {
  isModalOpen.value = false;
  if (currentLetter.value) {
    const gift = giftList.value.find(g => g.id === currentLetter.value.id);
    if (gift) gift.isRevealed = true;
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