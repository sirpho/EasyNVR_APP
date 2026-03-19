/**
 * 工具函数：判断当前网络是否为 WiFi（安卓APP专用）
 * @returns {Promise<boolean>} 是否为WiFi
 */
export const isWifiNetwork = async () => {
  return new Promise((resolve) => {
    uni.getNetworkType({
      success: (res) => {
        resolve(res.networkType === 'wifi');
      },
      fail: () => {
        try {
          const context = plus.android.importClass('android.content.Context');
          const connectivityManager = plus.android.runtimeMainActivity().getSystemService(context.CONNECTIVITY_SERVICE);
          plus.android.importClass(connectivityManager);
          const networkInfo = connectivityManager.getActiveNetworkInfo();
          resolve(networkInfo && networkInfo.getType() === 1);
        } catch (e) {
          resolve(false);
        }
      }
    });
  });
};

/**
 * 工具函数：获取WiFi名称（仅安卓APP）
 * @returns {Promise<string>} WiFi名称（失败返回空字符串）
 */
export const getWifiName = async () => {
  // 前置判断：非安卓端直接返回
  if (uni.getSystemInfoSync().platform === 'android') {
    return getAndroidWifiName()
  }
  return ''

};

const getAndroidWifiName = async () => {
  try {
    // 第一步：动态申请定位权限（安卓APP专用方式）
    const auth = await requestLocationPermission();
    if (!auth) {
      uni.showToast({ title: '请授予定位权限以获取WiFi名称', icon: 'none' });
      return '';
    }

    // 第二步：调用安卓原生API获取WiFi信息
    const WifiManager = plus.android.importClass('android.net.wifi.WifiManager');
    const Context = plus.android.importClass('android.content.Context');
    const wifiManager = plus.android.runtimeMainActivity().getSystemService(Context.WIFI_SERVICE);
    plus.android.importClass(wifiManager);

    const wifiInfo = wifiManager.getConnectionInfo();
    plus.android.importClass(wifiInfo);

    // 获取并处理WiFi名称（去除双引号）
    let ssid = wifiInfo.getSSID();
    if (ssid && ssid.startsWith('"') && ssid.endsWith('"')) {
      ssid = ssid.substring(1, ssid.length - 1);
    }

    // 过滤无效值
    if (ssid === '<unknown ssid>' || !ssid) {
      uni.showToast({ title: '无法获取WiFi名称，请检查定位权限', icon: 'none' });
      return '';
    }

    return ssid;
  } catch (e) {
    console.error('获取WiFi名称失败：', e);
    uni.showToast({ title: '获取WiFi名称失败', icon: 'none' });
    return '';
  }
}

/**
 * 辅助函数：安卓APP端动态申请定位权限（替换 uni.requestPermissions）
 * @returns {Promise<boolean>} 是否授权
 */
const requestLocationPermission = async () => {
  return new Promise((resolve) => {
    const systemInfo = uni.getSystemInfoSync();
    // 安卓6.0以下无需动态申请权限
    if (parseInt(systemInfo.osVersion) < 6) {
      resolve(true);
      return;
    }

    // 安卓6.0+：使用plus原生API申请权限
    plus.android.requestPermissions(
      ['android.permission.ACCESS_FINE_LOCATION'], // 申请精确定位权限
      (result) => {
        // 权限申请结果回调
        const grantedList = result.granted; // 已授权的权限列表
        const deniedList = result.denied; // 拒绝的权限列表
        // 判断定位权限是否授权
        resolve(grantedList.includes('android.permission.ACCESS_FINE_LOCATION'));
      },
      (err) => {
        // 申请失败（如系统异常）
        console.error('权限申请失败：', err);
        resolve(false);
      }
    );
  });
};