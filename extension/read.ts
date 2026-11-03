import { get_config } from './config'
import { notify } from './notify'

let current_audio: HTMLAudioElement | null = null

export
async function read_example_sentence(sentence: string | null) {
	if (!sentence) {
		notify('当前卡片没有例句')
		return
	}

	const config = await get_config()
	if (!config) {
		notify('请先配置 url_prefix、password 和 voice（点击打开选项）')
		return
	}

	stop_current()

	const url = `${config.url_prefix}/tts?${new URLSearchParams({
		text: sentence,
		voice: config.voice,
	})}`

	const res = await fetch(url, {
		headers: { password: config.password },
	})
	if (!res.ok) {
		notify(`朗读失败：HTTP ${res.status}`)
		console.error('tts failed', res.status, await res.text())
		return
	}

	const object_url = URL.createObjectURL(await res.blob())
	current_audio = new Audio(object_url)
	current_audio.onended = () => {
		URL.revokeObjectURL(object_url)
		current_audio = null
	}
	await current_audio.play()
}

function stop_current() {
	if (!current_audio)
		return
	current_audio.pause()
	URL.revokeObjectURL(current_audio.src)
	current_audio = null
}
