<template>
	<image class="w-full h-full" mode="aspectFill" :src="imageData"></image>
</template>

<script setup>
import { defineProps, reactive, ref, watch } from 'vue';
import { GetChannelSnapshot } from '@/service/http/channel.js';
import { SplicBase64String } from '@/service/utils/string.js';
import { GetRemoteUrl } from '@/service/store/local';
const props = defineProps({
	id: {
		type: String,
		default: '',
	},
	isDevice: {
		type: Boolean,
		default: true,
	},
  remoteIndex: {
		type: Number,
		default: 0,
	},
});

const imageData = ref(`${GetRemoteUrl(props.remoteIndex)}/cloud/assets/img/noImg.png`);

const getSnapshotForChannel = () => {
	GetChannelSnapshot(props.id, props.remoteIndex).then((res) => {
		if (res.img) {
			imageData.value = SplicBase64String(res.img);
		}
	});
};

// 监听 deviceId 变化，并在有值时调用 getSnapshot
watch(
	() => props.id,
	(newVal) => {
		if (newVal) {
			getSnapshotForChannel();
		}
	},
	{ immediate: true } // 组件挂载时立即执行一次
);
</script>

<style></style>
