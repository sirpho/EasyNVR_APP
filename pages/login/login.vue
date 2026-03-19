<template>
	<view class="page-content">
		<!-- 顶部logo区域 -->
		<view class="logo-wrap">
			<image class="logo-img" src="/static/image/logo.png"></image>
		</view>

		<!-- swiper滑动容器 -->
		<swiper class="form-swiper" :current="currentFormIndex" @change="onSwiperChange"
			:touchable="formList.length > 1" indicator-dots indicator-color="#ccc" indicator-active-color="#007aff">
			<!-- 已有表单项 -->
			<swiper-item v-for="(form, index) in formList" :key="index">
				<view class="form-card">

					<view class="form-item">
						<FocusInput v-model="form.domain" placeholder="请输入 IP/域名 地址" />
					</view>
					<view class="form-item">
						<FocusInput v-model="form.username" placeholder="账号" />
					</view>
					<view class="form-item">
						<FocusInput v-model="form.password" placeholder="密码" type="password" />
					</view>
					<view v-if="formList.length > 1" class="form-item del-button-wrapper">
						<button class="del-button" @click="deleteForm(index)">
							删除
						</button>
					</view>
				</view>
			</swiper-item>

			<!-- 新增表单占位页 -->
			<swiper-item>
				<view class="add-form-wrap">
					<button class="add-form-btn" @click="addNewForm">
						+ 新增登录配置
					</button>
				</view>
			</swiper-item>
		</swiper>

		<!-- 登录按钮 -->
		<view class="login-btn-wrap">
			<button class="login-btn" :disabled="loading" :loading="loading" @click="login()">
				登 录
			</button>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted
	} from 'vue';
	import FocusInput from '@/components/ui/input_focuse.vue';
	import {
		onShareAppMessage
	} from '@dcloudio/uni-app';
	import {
		Login
	} from '@/service/http/login.js';
	import {
		GetToken,
		SetToken,
		SetUserInfo,
		SetLoginInfo,
		GetLoginInfo,
	} from '../../service/store/local';

	// 多表单列表（替代原单个formData）
	const formList = ref([{
		domain: 'http://nvr1.sirpho.top:10000',
		username: 'admin',
		password: 'qwe123123',
	}]);
	// 当前激活的表单索引
	const currentFormIndex = ref(0);
	const loading = ref(false);

	// 页面挂载时初始化表单数据
	onMounted(() => {
		// 原有token判断逻辑
		if (GetToken()) {
			uni.switchTab({
				url: '/pages/index/view'
			});
		}

		// 从本地缓存加载登录信息到表单
		const data = GetLoginInfo();
    if(data.length > 0) {
      formList.value = data
    }
	});

	// swiper滑动切换事件
	const onSwiperChange = (e) => {
		currentFormIndex.value = e.detail.current;
	};

	// 新增表单
	const addNewForm = () => {
		formList.value.push({
			domain: '',
			username: '',
			password: '',
		});
		// 新增后自动切换到新表单
		currentFormIndex.value = formList.value.length - 1;
	};

	// 删除表单
	const deleteForm = (index) => {
		uni.showModal({
			title: '确认删除',
			content: '是否删除当前登录配置？',
			success: (res) => {
				if (res.confirm) {
					formList.value.splice(index, 1);
					// 删除后切换到第一个表单
					if (currentFormIndex.value >= index) {
						currentFormIndex.value = Math.max(0, currentFormIndex.value - 1);
					}
				}
			}
		});
	};

	// 获取完整URL
	const getFullUrl = (domain) => {
		if (!domain) return '';
		if (!domain.startsWith('http')) {
			return "http://" + domain;
		}
		return domain;
	};
  
  /**
   * 单个地址登录
   * @param params
   * @param index
   * @returns {Promise<unknown>}
   */
  const loginSingle = (params, index) => {
    return new Promise((resolve, reject) => {
     Login(params, index).then((res) => {
       resolve(res);
     }).catch((err) => {
       reject(err);
     })
    })
  }

	// 登录方法（接收表单索引）
	const login = async () => {
    for(let i = 0; i< formList.value.length; i++) {
      const item = formList.value[i]
      if (!item.domain) {
        uni.showToast({
          title: `请输入配置${i+1}的服务器地址`,
          icon: 'none'
        });
        return;
      }
      if (!item.username) {
        uni.showToast({
          title: `请输入配置${i+1}的账号`,
          icon: 'none'
        });
        return;
      }
      if (!item.password) {
        uni.showToast({
          title: `请输入配置${i+1}的密码`,
          icon: 'none'
        });
        return;
      }
    }
    const result = formList.value.map((item, index) => ({
      url: getFullUrl(item.domain),
      domain: item.domain,
      username: item.username,
      password: item.password,
      remoteIndex: index,
    }))

		loading.value = true;
		// 保存当前表单的登录信息到本地
		SetLoginInfo(result);
    
    const res = await Promise.all(result.map((item, index) => loginSingle(item, index))).catch((err) => {
      let msg = err.msg || err.errMsg || '登录失败，请检查您的服务地址是否正确';
      uni.showToast({
        title: msg,
        icon: 'none'
      });
    }).finally(() => {
      loading.value = false;
    })
    const tokenResult = res.map(item => item.token)
    SetToken(tokenResult);
    SetUserInfo(res.map((item, index) => ({
      ...item.user,
      url: result[index]?.url,
      remoteIndex: result[index]?.remoteIndex,
    })));
    uni.switchTab({
      url: '/pages/index/view'
    });
	};

	onShareAppMessage(() => ({
		title: 'EasyNVR 登录',
		path: '/pages/login/login',
		imageUrl: '',
	}));
</script>

<style scoped>
	/* 根容器：控制整体布局 */
	.page-content {
		background-color: #FFFFFF;
		min-height: 100vh;
		padding: 0 30rpx;
		/* 左右留白 */
		box-sizing: border-box;
	}

	/* Logo区域：居中，距离顶部有间距 */
	.logo-wrap {
		display: flex;
		justify-content: center;
		align-items: center;
		padding-top: 60rpx;
		/* 顶部间距，控制偏上位置 */
		padding-bottom: 40rpx;
	}

	.logo-img {
		width: 100rpx;
		height: 100rpx;
		border-radius: 16rpx;
	}

	.form-swiper {
		margin: 20rpx auto 0;
		height: 60vh;
	}

	.form-card {
		background-color: #FFFFFF;
		margin: 0 10rpx;
		position: relative;
		box-sizing: border-box;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	}
	
	.form-item.del-button-wrapper {
		display: flex;
		justify-content: center;
	}

	.del-button {
		font-size: 24rpx;
    color: #FFFFFF;
    background: #e74133;
    width: 384rpx;
    margin: 0 0 24rpx 0;
	}

	/* 表单项：间距统一 */
	.form-item {
		margin-bottom: 30rpx;
	}

	/* 新增表单容器：完全居中 */
	.add-form-wrap {
		height: 60vh;
	}

	/* 新增按钮样式 */
	.add-form-btn {
		width: 400rpx;
		height: 80rpx;
		line-height: 80rpx;
		margin-top: 20vh;
		background-color: #007aff;
		color: #fff;
		border: none;
		border-radius: 40rpx;
		font-size: 28rpx;
	}

	/* 登录按钮容器：居中，距离表单有间距 */
	.login-btn-wrap {
		display: flex;
		justify-content: center;
		position: absolute;
		bottom: 88rpx;
		left: 0;
		right: 0;
	}

	/* 登录按钮样式 */
	.login-btn {
		width: 80%;
		height: 88rpx;
		line-height: 88rpx;
		background-color: #007aff;
		color: #fff;
		border: none;
		border-radius: 44rpx;
		font-size: 32rpx;
	}
</style>