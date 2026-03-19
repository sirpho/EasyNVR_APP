import {
	GET,
	GetFetch
} from './http.js';
import {
	SplicBaseUrlToRemoteUrl
} from '@/service/utils/string.js';


// 获取云存录像列表
export async function FindRecords(index) {
	return await GET('/records/cloud/channels',{page:1,size:200}, {
		remoteIndex: index
	})
}

// 获取有录像的日期
export async function FindRecordDates(data, index) {
	return await GET('/records/months', data, {
		remoteIndex: index
	});
}

// 获取录像时间轴
export async function FindRecordTimeLine(data, index) {
	return await GET('/records/timeline', data, {
		remoteIndex: index
	});
}

// 获取录像列表
export async function FindRecordList(data, index) {
	const res = await GET('/records', data, {
		remoteIndex: index
	});
	return await GetFetch(SplicBaseUrlToRemoteUrl(res.url), index);
}