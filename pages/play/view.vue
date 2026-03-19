<template>
	<view>
		<!-- 仅编译到微信小程序 -->
		<!-- #ifndef APP-PLUS -->
		<WxView :url="liveUrl" :channel-id="channelId" :device-id="deviceId" :remote-index="remoteIndex" />
		<!-- #endif -->

		<!-- 仅编译到 APP (plus) 端 -->
		<!-- #ifdef APP-PLUS -->
		<AppView :url="liveUrl" :channel-id="channelId" :device-id="deviceId" :remote-index="remoteIndex" />
		<!-- #endif -->
	</view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { SplicBaseUrlToRemoteUrl } from '@/service/utils/string.js';
import AppView from './components/app.vue';
import WxView from './components/wx.vue';

const liveUrl = ref('');
const channelId = ref('');
const deviceId = ref('');
const remoteIndex = ref(0);

onLoad((options) => {
	channelId.value = options.channelId || '';
	deviceId.value = options.deviceId || '';
	remoteIndex.value = parseInt(options.remoteIndex || 0) || 0;
  liveUrl.value = SplicBaseUrlToRemoteUrl(decodeURIComponent(options.url || ''), remoteIndex.value) || '';
});
</script>
