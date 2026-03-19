import {
	GET
} from './http.js';

// 获取版本
export async function FindVersion(index) {
	return await GET('/app/version', null, {
		remoteIndex: index
	})
}