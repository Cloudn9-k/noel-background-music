<script setup>
import { onMounted, ref } from 'vue';

const props = defineProps({
  gifts: Array,
  isVisible: Boolean
});

const emit = defineEmits(['open-gift']);

const positions = ref([]);

onMounted(() => {
    positions.value = props.gifts.map((_, index) => {
        const randomLeft = Math.random() * 60 + 20;
        const delay = index * 5; 
        const swayDuration = Math.random() * 2 + 3; 

        return {
            left: randomLeft + '%',
            delay: delay + 's',
            swayDuration: swayDuration + 's'
        };
    });
});

const handleItemClick = (gift) => {
  emit('open-gift', gift);
};
</script>

<template>
  <div class="gift-layer" :class="{ 'visible': isVisible }">
    <div 
      v-for="(gift, index) in gifts" 
      :key="gift.id"
      class="gift-wrapper"
      :style="{ 
          left: positions[index]?.left || '50%', 
          animationDelay: positions[index]?.delay || '0s' 
      }"
    >
        <div 
            v-if="!gift.isRevealed" 
            class="sway-container"
            :style="{ animationDuration: positions[index]?.swayDuration || '3s' }"
        >
            <div class="light-beam" @click="handleItemClick(gift)">
                <div class="core"></div>
                <div class="glow"></div>
                <div class="click-area"></div>
            </div>
        </div>
        </div>
  </div>
</template>

<style scoped>
.gift-layer {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    pointer-events: none; z-index: 20;
}

.gift-wrapper {
    position: absolute;
    bottom: 15%; 
    pointer-events: auto;
    transform: translateY(-120vh); 
    opacity: 0;
    transition: opacity 0.5s ease;
}
.gift-layer.visible .gift-wrapper {
    animation: softFall 6s ease-out forwards;
}
.sway-container {
    animation: sway 3s ease-in-out infinite alternate;
}

.light-beam {
    position: relative;
    cursor: pointer;
    display: flex; justify-content: center; align-items: center;
    animation: pulse 2s infinite ease-in-out;
}

.light-beam .core {
    width: 14px; height: 14px;
    background: #fff;
    border-radius: 50%;
    position: absolute; z-index: 2;
    box-shadow: 0 0 15px #fff;
}

.light-beam .glow {
    width: 50px; height: 50px;
    background: radial-gradient(circle, rgba(255,215,0,0.6) 0%, rgba(255,165,0,0) 70%);
    border-radius: 50%;
}

.click-area {
    position: absolute;
    width: 80px; height: 80px;
    background: transparent;
    z-index: 10;
}
@keyframes softFall {
    0% { transform: translateY(-120vh); opacity: 0; }
    10% { opacity: 1; }
    100% { transform: translateY(0); opacity: 1; }
}

@keyframes sway {
    0% { transform: translateX(-25px); }
    100% { transform: translateX(25px); }
}

@keyframes pulse {
    0% { transform: scale(1); filter: brightness(1); }
    50% { transform: scale(1.1); filter: brightness(1.3); }
    100% { transform: scale(1); filter: brightness(1); }
}

@media (max-width: 768px) {
    .gift-wrapper { bottom: 25%; }
    .click-area { width: 100px; height: 100px; }
    @keyframes sway {
        0% { transform: translateX(-15px); }
        100% { transform: translateX(15px); }
    }
}
</style>