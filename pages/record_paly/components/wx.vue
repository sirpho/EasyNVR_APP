<template>
	<view>
		<web-view :src="finalPlaybackUrl" @message="handleMessage"></web-view>
	</view>
</template>

<script setup>
import { reactive, computed } from 'vue';
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app';
import { GetRemoteUrl, GetToken } from '@/service/store/local';
import { DEFAULT_PLAYBACK_URL } from '@/constants/index';
const data = reactive({
	channelId: '',
	deviceId: '',
  remoteIndex: 0,
});

// 计算远程播放 URL
const finalPlaybackUrl = computed(() => {
	let basePlaybackUrl = DEFAULT_PLAYBACK_URL;

	return `${DEFAULT_PLAYBACK_URL}?channelId=${data.channelId}&deviceId=${
		data.deviceId
	}&token=${GetToken()}&baseUrl=${GetRemoteUrl(data.remoteIndex)}`;
});

onLoad((options) => {
	if (options) {
		data.channelId = options.channelId;
		data.deviceId = options.deviceId;
		data.remoteIndex = options.remoteIndex;
	}
});

onShareAppMessage(() => {
	return {
		title: 'EasyNVR 录像播放',
		path: '/pages/record_paly/view',
		imageUrl: '',
	};
});
</script>

<style></style>
