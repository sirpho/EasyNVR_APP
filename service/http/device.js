import {
	GET,
	POST
} from './http.js'

// 获取设备列表
export async function FindDeviceList(params, index) {
	return await GET('/devices', params, {
		remoteIndex: index
	})
}

// 云台控制
export async function ControlDeviceStart(data, index) {
	return await POST(`/devices/${data.deviceId}/ptz/start`, data, {
		remoteIndex: index
	})
}

export async function ControlDeviceStop(data, index) {
	return await POST(`/devices/${data.deviceId}/ptz/stop`, data, {
		remoteIndex: index
	})
}