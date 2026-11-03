import { set_config } from './config'

type ApiVoice = {
	ShortName: string
	FriendlyName: string
	Language: string
	Locale: string
	Gender: string
}

const url_input = document.getElementById('url_prefix') as HTMLInputElement
const password_input = document.getElementById('password') as HTMLInputElement
const voice_select = document.getElementById('voice') as HTMLSelectElement
const load_voices_btn = document.getElementById('load_voices') as HTMLButtonElement
const save_btn = document.getElementById('save') as HTMLButtonElement
const status = document.getElementById('status') as HTMLParagraphElement

function normalize_prefix(raw: string) {
	return raw.trim().replace(/\/+$/, '')
}

function fill_voices(voices: ApiVoice[], selected = '') {
	voice_select.replaceChildren()
	const placeholder = document.createElement('option')
	placeholder.value = ''
	placeholder.textContent = '请选择 voice'
	voice_select.appendChild(placeholder)

	for (const voice of voices) {
		const option = document.createElement('option')
		option.value = voice.ShortName
		option.textContent = `${voice.FriendlyName} (${voice.ShortName})`
		voice_select.appendChild(option)
	}

	if (selected && voices.some(v => v.ShortName === selected))
		voice_select.value = selected
}

async function fetch_english_voices(url_prefix: string, password: string) {
	const res = await fetch(`${normalize_prefix(url_prefix)}/voice`, {
		headers: { password },
	})
	if (!res.ok)
		throw new Error(`加载音色失败：HTTP ${res.status}`)
	const voices = await res.json() as ApiVoice[]
	return voices
		.filter(v => v.Language === 'en')
		.sort((a, b) => a.ShortName.localeCompare(b.ShortName))
}

load_voices_btn.addEventListener('click', async () => {
	const url_prefix = url_input.value.trim()
	const password = password_input.value
	if (!url_prefix || !password) {
		status.textContent = '请先填写 url_prefix 和 password'
		return
	}
	status.textContent = '加载中…'
	try {
		const voices = await fetch_english_voices(url_prefix, password)
		fill_voices(voices, voice_select.value)
		status.textContent = `已加载 ${voices.length} 个英文音色`
	} catch (err) {
		status.textContent = err instanceof Error ? err.message : String(err)
	}
})

save_btn.addEventListener('click', async () => {
	const url_prefix = url_input.value.trim()
	const password = password_input.value
	const voice = voice_select.value
	if (!url_prefix || !password || !voice) {
		status.textContent = '请填写 url_prefix、password，并选择 voice'
		return
	}
	try {
		new URL(url_prefix)
	} catch {
		status.textContent = 'url_prefix 不是合法 URL'
		return
	}

	await set_config({ url_prefix, password, voice })
	status.textContent = '已保存'
})

async function load() {
	const saved = await chrome.storage.local.get([
		'url_prefix',
		'password',
		'voice',
	])
	if (typeof saved.url_prefix === 'string')
		url_input.value = saved.url_prefix
	if (typeof saved.password === 'string')
		password_input.value = saved.password

	const selected_voice = typeof saved.voice === 'string' ? saved.voice : ''
	if (url_input.value.trim() && password_input.value) {
		try {
			const voices = await fetch_english_voices(
				url_input.value,
				password_input.value,
			)
			fill_voices(voices, selected_voice)
		} catch {
			if (selected_voice) {
				fill_voices([{
					ShortName: selected_voice,
					FriendlyName: selected_voice,
					Language: 'en',
					Locale: '',
					Gender: '',
				}], selected_voice)
			}
		}
	}
}

load()
