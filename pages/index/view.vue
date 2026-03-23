<template>
  <view>
    <view class="bg-white">
      <Navigation title="预览">
        <wd-icon name="view-list" size="22px" @click="handleSwitch"></wd-icon>
      </Navigation>
    </view>
    <scroll-view
      :style="scrollViewStyle"
      scroll-y
      refresher-enabled="true"
      :refresher-threshold="200"
      :refresher-triggered="refresherTriggered"
      @refresherrefresh="onRefresh"
    >
      <wd-skeleton
        v-if="loading"
        animation="gradient"
        theme="paragraph"
        :rows="5"
      />
      <view v-else :class="`grid ${gridCols} gap-2 p-3 items-stretch`">
        <ChannelCard
          v-for="item in channelList"
          :key="item.id + '@' + item.remoteIndex"
          :item="item"
          :deviceId="item.deviceId"
        />
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import {onMounted, ref, reactive, computed} from 'vue';
import Navigation from '@/components/navigation/navigation.vue';
import ChannelCard from './components/channel.vue';
import {FindDeviceList} from '@/service/http/device.js';
import {FindChannels} from '@/service/http/channel.js';
import {GetLoginInfo} from '../../service/store/local';
import {GetNavBarHeight} from '@/service/utils/utils.js';

// 设备列表
const deviceList = ref([]);
// 通道列表
const channelList = ref([]);

const gridCols = ref('grid-cols-2')

const loading = ref(false); // 初次加载骨架屏状态
const refresherTriggered = ref(false);
const titleHeight = ref(0);

// 动态计算 scroll-view 的高度
const scrollViewStyle = computed(() => {
  return `height: calc(100vh - ${titleHeight.value}px)`;
});
// 分页参数
const pagination = reactive({
  page: 1,
  size: 30,
  id: '',
  status: '',
  name: '',
  is_platform: '',
  protocol: '',
});

onMounted(() => {
  getHeight();
  findDeviceList();
});
// 下拉刷新逻辑
const onRefresh = async () => {
  refresherTriggered.value = true;
  await findDeviceList();
  // 给刷新动画留出时间
  await new Promise(resolve => setTimeout(resolve, 500));
  refresherTriggered.value = false;
};
/**
 * 获取设备列表
 */
const findDeviceList = async () => {
  loading.value = true;
  const loginInfoList = GetLoginInfo()
  const itemList = []
  
  for (const item of loginInfoList) {
    const res = await FindDeviceList(pagination, item.remoteIndex);
    const items = res.items.map(ite => ({
      ...ite,
      remoteIndex: item.remoteIndex
    }))
    itemList.push(...items)
  }
  
  deviceList.value = itemList;
  await getChannelList();
};

/**
 * 查询通道列表
 */
const getChannelList = async () => {
  const channels = []
  for (const device of deviceList.value) {
    const res = await FindChannels({
      page: 1,
      size: 10,
      device_id: device.id,
      pid: 'ROOT',
      status: '',
      name: '',
      bid: '',
    }, device.remoteIndex)
    channels.push(...res.items.map(item => ({
      ...item,
      remoteIndex: device.remoteIndex,
      deviceId: device.id,
      deviceName: device.name,
    })))
  }
  channelList.value = channels;
  
  loading.value = false;
}

// 获取导航栏高度
const getHeight = () => {
  const height = GetNavBarHeight();
  titleHeight.value = height + 40;
};

const handleSwitch = () => {
  if(gridCols.value === 'grid-cols-2') {
    gridCols.value = 'grid-cols-1'
  } else {
    gridCols.value = 'grid-cols-2'
  }
}
</script>
