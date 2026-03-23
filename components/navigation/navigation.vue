<template>
  <view
    class="flex justify-between items-center pb-3 bg-white w-screen font-semibold"
    :style="'box-sizing: border-box; padding-left:18px; padding-right:18px; padding-top:' + titleHeight + 'px'">
    <view>
      {{ title }}
    </view>
    <slot></slot>
  </view>
</template>

<script setup>
import {ref, onMounted, defineProps} from 'vue';
import {onLoad} from '@dcloudio/uni-app';
import {GetNavBarHeight} from '@/service/utils/utils.js';

const props = defineProps({
  title: String,
  className: String,
});

const titleHeight = ref(0);

onMounted(() => {
  getHeight();
});

const getHeight = () => {
  const height = GetNavBarHeight();
  titleHeight.value = height + 6;
};
</script>
