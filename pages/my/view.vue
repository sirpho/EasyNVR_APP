<template>
	<view>
		<view class="bg-white">
			<Navigation title="我的" />
		</view>
		<view class="p-3">
			<!-- 顶部用户头像信息 -->
			<view class="p-3 bg-white rounded-lg mb-3">
				<view class="font-semibold text-xl">登录信息</view>
        <view v-for="item of userInfoList" :key="item.remoteIndex">
          <view class="text-sm text-gray-400 flex items-center my-1">
            <span style="padding-right: 1rem">配置{{item.remoteIndex + 1}}</span>
          </view>
          <view class="text-sm text-gray-400 flex items-center my-1">
            <span style="padding-right: 1rem">用户名</span>
            <span>
						{{ item.username }}
					</span>
          </view>
          <view class="text-sm text-gray-400 flex items-center my-1">
            <span class="pr-1">用户等级</span>
            <span>
						{{ item.name }}
					</span>
          </view>
          <view class="text-sm text-gray-400 flex items-center">
            <span class="pr-1">远程地址</span>
            <span>
						{{ item.url }}
					</span>
          </view>
          <view class="text-sm text-gray-400 flex items-center">
            <span class="pr-1">NVR版本 {{ item.serverVersion }}</span>
          </view>
        </view>
				

				<view class="h-5"></view>

				<view class="font-semibold text-xl">版本信息</view>
				<view class="text-sm text-gray-400 flex items-center my-1">
					<span class="pr-1">APP版本 v{{ version }}</span>
				</view>
			</view>

			<view>
				<view
					class="p-3 rounded-lg flex justify-between items-center"
					style="background-color: #f5222d; color: #fff"
					@click="handeLogout"
				>
					<span class="font-semibold">退出登录</span>
					<wd-icon name="logout" size="22px"></wd-icon>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Navigation from '@/components/navigation/navigation.vue';
import {
	ClearToken,
	ClearUserInfo,
	GetUserInfo,
} from '@/service/store/local.js';
import { FindVersion } from '@/service/http/system.js';

const userInfoList = ref([]);

const version = ref('');

onMounted(() => {
	const info = uni.getAppBaseInfo();
	version.value = info.appWgtVersion;
	findUserInfo();
	findVersion();
});

// 获取用户信息
const findUserInfo = () => {
  userInfoList.value = GetUserInfo();
};

// 获取服务端版本
const findVersion = async () => {
  for(const item of userInfoList.value) {
    const res = await FindVersion(item.remoteIndex).catch((err) => {
      console.log('>>请求错误>>', err);
    });
    item.serverVersion = res.version;
  }
};

const handeLogout = () => {
	uni.showModal({
		title: '提示',
		content: '确定要退出登录吗？',
		success: (res) => {
			if (res.confirm) {
				ClearToken();
				ClearUserInfo();
				setTimeout(() => {
					uni.reLaunch({
						url: '/pages/login/login',
					});
				}, 1000);
			}
		},
	});
};
</script>
