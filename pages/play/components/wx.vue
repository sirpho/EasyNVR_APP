<template>
	<view>
		<web-view :src="finalPlaybackUrl" @message="handleMessage"></web-view>
	</view>
</template>

<script setup>
import { computed, watch } from 'vue';
import { GetRemoteUrl, GetToken } from '@/service/store/local';
import { DEFAULT_LIVE_PLAY_URL } from '@/constants/index';
const props = defineProps({
	url: { type: String, default: '' },
	channelId: { type: String, default: '' },
	deviceId: { type: String, default: '' },
	remoteIndex: { type:Number, default: 0 },
});

// 计算最终的播放 URL
const finalPlaybackUrl = computed(() => {
	return `${DEFAULT_LIVE_PLAY_URL}?live_url=${props.url}&channelId=${
		props.channelId
	}&deviceId=${props.deviceId}&token=${GetToken(props.remoteIndex)}&baseUrl=${GetRemoteUrl(props.remoteIndex)}`;
});

watch(
	finalPlaybackUrl,
	(url) => {
		console.log('🔍 finalPlaybackUrl =', url);
	},
	{ immediate: true }
);

const handleMessage = (v) => {
	console.log('>>', v);
	// if (action === 'start') {
	// 	console.log(`开始控制方向: ${direction}`);
	// } else if (action === 'stop') {
	// 	console.log(`停止控制方向: ${direction}`);
	// }
};
</script>
