/**
 * 工具函数：判断当前网络是否为 WiFi（跨端支持：安卓/iOS APP）
 * @returns {Promise<boolean>} 是否为WiFi
 */
export const isWifiNetwork = async () => {
  return new Promise((resolve) => {
    // 优先使用 uni 统一 API
    uni.getNetworkType({
      success: (res) => {
        resolve(res.networkType === 'wifi');
      },
      fail: () => {
        // uni API 失败时，分别走原生逻辑
        const systemInfo = uni.getSystemInfoSync();
        if (systemInfo.platform === 'android') {
          // 安卓原生兜底
          try {
            const context = plus.android.importClass('android.content.Context');
            const connectivityManager = plus.android.runtimeMainActivity().getSystemService(context.CONNECTIVITY_SERVICE);
            plus.android.importClass(connectivityManager);
            const networkInfo = connectivityManager.getActiveNetworkInfo();
            resolve(networkInfo && networkInfo.getType() === 1);
          } catch (e) {
            resolve(false);
          }
        } else if (systemInfo.platform === 'ios') {
          // iOS 原生兜底
          try {
            const networkReachability = plus.ios.importClass('Reachability');
            const reachability = networkReachability.reachabilityForInternetConnection();
            plus.ios.importClass(reachability);
            const status = reachability.currentReachabilityStatus();
            // iOS 中 kReachableViaWiFi = 2
            resolve(status === 2);
          } catch (e) {
            resolve(false);
          }
        } else {
          resolve(false);
        }
      }
    });
  });
};

/**
 * 工具函数：获取WiFi名称（跨端支持：安卓/iOS APP）
 * @returns {Promise<string>} WiFi名称（失败返回空字符串）
 */
export const getWifiName = async () => {
  const systemInfo = uni.getSystemInfoSync();

  // 非APP端直接返回空
  if (systemInfo.platform !== 'android' && systemInfo.platform !== 'ios') {
    return '';
  }

  // 根据平台调用对应方法
  if (systemInfo.platform === 'android') {
    return getAndroidWifiName();
  } else {
    return getIosWifiName();
  }
};

/**
 * 安卓端获取WiFi名称
 * @returns {Promise<string>}
 */
const getAndroidWifiName = async () => {
  try {
    // 第一步：动态申请定位权限
    const auth = await requestAndroidLocationPermission();
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
    console.error('安卓获取WiFi名称失败：', e);
    uni.showToast({ title: '获取WiFi名称失败', icon: 'none' });
    return '';
  }
};

/**
 * iOS端获取WiFi名称
 * @returns {Promise<string>}
 */
const getIosWifiName = async () => {
  try {
    // 第一步：申请iOS定位权限
    const auth = await requestIosLocationPermission();
    if (!auth) {
      uni.showToast({ title: '请授予定位权限以获取WiFi名称', icon: 'none' });
      return '';
    }

    // 第二步：调用iOS原生API获取WiFi信息
    // 1. 导入所需类
    const CNCopyCurrentNetworkInfo = plus.ios.import('CNCopyCurrentNetworkInfo');
    const CNCopySupportedInterfaces = plus.ios.import('CNCopySupportedInterfaces');
    const NSString = plus.ios.importClass('NSString');

    // 2. 获取WiFi接口列表（iOS 12+ 必须用这种方式）
    const interfaces = CNCopySupportedInterfaces();
    if (!interfaces) return '';

    // 3. 遍历接口获取第一个可用的WiFi信息
    const ifaceArray = plus.ios.invoke(interfaces, 'allObjects');
    let ssid = '';
    for (let i = 0; i < ifaceArray.count; i++) {
      const ifaceName = plus.ios.invoke(ifaceArray, 'objectAtIndex:', i);
      const networkInfo = CNCopyCurrentNetworkInfo(ifaceName);

      if (networkInfo) {
        // 获取SSID并转换为字符串
        const ssidObj = plus.ios.invoke(networkInfo, 'objectForKey:', NSString.stringWithString_('SSID'));
        ssid = plus.ios.invoke(ssidObj, 'UTF8String');
        break;
      }
    }

    // 4. 释放iOS对象（避免内存泄漏）
    plus.ios.deleteObject(interfaces);
    plus.ios.deleteObject(ifaceArray);

    // 5. 过滤无效值
    if (!ssid || ssid === 'Unknown') {
      uni.showToast({ title: '无法获取WiFi名称，请检查定位权限', icon: 'none' });
      return '';
    }

    return ssid;
  } catch (e) {
    console.error('iOS获取WiFi名称失败：', e);
    uni.showToast({ title: '获取WiFi名称失败', icon: 'none' });
    return '';
  }
};

/**
 * 安卓端动态申请定位权限
 * @returns {Promise<boolean>}
 */
const requestAndroidLocationPermission = async () => {
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
        resolve(result.granted.includes('android.permission.ACCESS_FINE_LOCATION'));
      },
      (err) => {
        console.error('安卓权限申请失败：', err);
        resolve(false);
      }
    );
  });
};

/**
 * iOS端动态申请定位权限
 * @returns {Promise<boolean>}
 */
const requestIosLocationPermission = async () => {
  return new Promise((resolve) => {
    // iOS 统一使用 uni 的权限申请API
    uni.requestPermissions({
      scope: 'scope.userLocation',
      success: (res) => {
        // 判断定位权限是否授权
        const authStatus = res.authSetting['scope.userLocation'];
        resolve(authStatus === true);
      },
      fail: (err) => {
        console.error('iOS权限申请失败：', err);
        resolve(false);
      }
    });
  });
};