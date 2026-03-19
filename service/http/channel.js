import {
	GET,
	POST,
} from './http.js'

// 获取通道列表
export async function FindChannels(data, index) {
	return await GET(`/channels`, data, {
		remoteIndex: index
	});
}

// 获取快照
export async function GetChannelSnapshot(id, index) {
	return await GET(`/channels/${id}/snapshot`, {
		h: 70,
		time_s: 0,
	}, {
		remoteIndex: index
	});
}

// 直播
export async function Live(id, index) {
	return await POST(`/channels/${id}/play`, {}, {
		remoteIndex: index
	});
}