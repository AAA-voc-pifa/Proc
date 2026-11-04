import {
	DEFAULT_TTS_RATE,
	TTS_RATE_PATTERN,
	clear_tts_config,
	clear_voc_config,
	set_tts_config,
	set_voc_config,
} from './config'

type ApiVoice = {
	ShortName: string
	FriendlyName: string
	Language: string
	Locale: string
	Gender: string
}

const tts_url_input = document.getElementById('tts_url_prefix') as HTMLInputElement
const tts_password_input = document.getElementById('tts_password') as HTMLInputElement
const filter_locale = document.getElementById('filter_locale') as HTMLSelectElement
const filter_gender = document.getElementById('filter_gender') as HTMLSelectElement
const voice_select = document.getElementById('voice') as HTMLSelectElement
const tts_rate_input = document.getElementById('tts_rate') as HTMLInputElement
const tts_save_btn = document.getElementById('tts_save') as HTMLButtonElement
const tts_clear_btn = document.getElementById('tts_clear') as HTMLButtonElement
const tts_status = document.getElementById('tts_status') as HTMLParagraphElement

const voc_url_input = document.getElementById('voc_url_prefix') as HTMLInputElement
const voc_auth_input = document.getElementById('voc_authentication') as HTMLInputElement
const voc_save_btn = document.getElementById('voc_save') as HTMLButtonElement
const voc_clear_btn = document.getElementById('voc_clear') as HTMLButtonElement
const voc_status = document.getElementById('voc_status') as HTMLParagraphElement

let all_voices: ApiVoice[] = []
let load_seq = 0
let debounce_timer = 0

function normalize_prefix(raw: string) {
	return raw.trim().replace(/\/+$/, '')
}

function reset_tts_form() {
	tts_url_input.value = ''
	tts_password_input.value = ''
	tts_rate_input.value = DEFAULT_TTS_RATE
	filter_locale.value = ''
	filter_gender.value = ''
	all_voices = []
	fill_locale_filter([])
	render_voice_options()
}

function fill_locale_filter(voices: ApiVoice[]) {
	const current = filter_locale.value
	const locales = [...new Set(voices.map(v => v.Locale))].sort()

	filter_locale.replaceChildren()
	const all = document.createElement('option')
	all.value = ''
	all.textContent = '全部'
	filter_locale.appendChild(all)

	for (const locale of locales) {
		const option = document.createElement('option')
		option.value = locale
		option.textContent = locale
		filter_locale.appendChild(option)
	}

	if (locales.includes(current))
		filter_locale.value = current
}

function filtered_voices() {
	const locale = filter_locale.value
	const gender = filter_gender.value
	return all_voices.filter(v => {
		if (locale && v.Locale !== locale)
			return false
		if (gender && v.Gender !== gender)
			return false
		return true
	})
}

function render_voice_options(selected = '') {
	const voices = filtered_voices()
	const keep = selected || voice_select.value

	voice_select.replaceChildren()
	const placeholder = document.createElement('option')
	placeholder.value = ''
	placeholder.textContent = all_voices.length ? '请选择 voice' : '填写上方配置后自动加载'
	voice_select.appendChild(placeholder)

	for (const voice of voices) {
		const option = document.createElement('option')
		option.value = voice.ShortName
		option.textContent = `${voice.FriendlyName} · ${voice.Gender}`
		voice_select.appendChild(option)
	}

	if (keep && voices.some(v => v.ShortName === keep))
		voice_select.value = keep
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

async function reload_voices(preferred = '') {
	const url_prefix = tts_url_input.value.trim()
	const password = tts_password_input.value
	const seq = ++load_seq

	if (!url_prefix || !password) {
		all_voices = []
		fill_locale_filter([])
		render_voice_options()
		return
	}

	try {
		new URL(url_prefix)
	} catch {
		tts_status.textContent = 'url_prefix 不是合法 URL'
		return
	}

	tts_status.textContent = '加载音色中…'
	try {
		const voices = await fetch_english_voices(url_prefix, password)
		if (seq !== load_seq)
			return
		all_voices = voices
		fill_locale_filter(voices)
		render_voice_options(preferred)
		tts_status.textContent = `已加载 ${voices.length} 个英文音色`
	} catch (err) {
		if (seq !== load_seq)
			return
		all_voices = []
		fill_locale_filter([])
		render_voice_options(preferred)
		tts_status.textContent = err instanceof Error ? err.message : String(err)
	}
}

function schedule_reload() {
	clearTimeout(debounce_timer)
	debounce_timer = window.setTimeout(() => {
		reload_voices(voice_select.value)
	}, 400)
}

tts_url_input.addEventListener('input', schedule_reload)
tts_password_input.addEventListener('input', schedule_reload)
filter_locale.addEventListener('change', () => render_voice_options())
filter_gender.addEventListener('change', () => render_voice_options())

tts_save_btn.addEventListener('click', async () => {
	const url_prefix = tts_url_input.value.trim()
	const password = tts_password_input.value
	const voice = voice_select.value
	const rate = tts_rate_input.value.trim() || DEFAULT_TTS_RATE
	if (!url_prefix || !password || !voice) {
		tts_status.textContent = '请填写 url_prefix、password，并选择 voice'
		return
	}
	if (!TTS_RATE_PATTERN.test(rate)) {
		tts_status.textContent = 'rate 格式应为 +0%、+50%、-20% 这类'
		return
	}
	try {
		new URL(url_prefix)
	} catch {
		tts_status.textContent = 'url_prefix 不是合法 URL'
		return
	}

	await set_tts_config({ url_prefix, password, voice, rate })
	tts_rate_input.value = rate
	tts_status.textContent = '已保存'
})

tts_clear_btn.addEventListener('click', async () => {
	await clear_tts_config()
	reset_tts_form()
	tts_status.textContent = '已清空设置'
})

voc_save_btn.addEventListener('click', async () => {
	const url_prefix = voc_url_input.value.trim()
	const authentication = voc_auth_input.value
	if (!url_prefix || !authentication) {
		voc_status.textContent = '请填写 url_prefix 和 authentication'
		return
	}
	try {
		new URL(url_prefix)
	} catch {
		voc_status.textContent = 'url_prefix 不是合法 URL'
		return
	}

	await set_voc_config({ url_prefix, authentication })
	voc_status.textContent = '已保存'
})

voc_clear_btn.addEventListener('click', async () => {
	await clear_voc_config()
	voc_url_input.value = ''
	voc_auth_input.value = ''
	voc_status.textContent = '已清空设置'
})

async function load() {
	const saved = await chrome.storage.local.get([
		'url_prefix',
		'password',
		'voice',
		'rate',
		'voc_url_prefix',
		'voc_authentication',
	])
	if (typeof saved.url_prefix === 'string')
		tts_url_input.value = saved.url_prefix
	if (typeof saved.password === 'string')
		tts_password_input.value = saved.password
	tts_rate_input.value =
		typeof saved.rate === 'string' && TTS_RATE_PATTERN.test(saved.rate.trim())
			? saved.rate.trim()
			: DEFAULT_TTS_RATE
	if (typeof saved.voc_url_prefix === 'string')
		voc_url_input.value = saved.voc_url_prefix
	if (typeof saved.voc_authentication === 'string')
		voc_auth_input.value = saved.voc_authentication

	const selected_voice = typeof saved.voice === 'string' ? saved.voice : ''
	await reload_voices(selected_voice)

	if (!all_voices.length && selected_voice) {
		voice_select.replaceChildren()
		const option = document.createElement('option')
		option.value = selected_voice
		option.textContent = selected_voice
		voice_select.appendChild(option)
		voice_select.value = selected_voice
	}
}

load()
