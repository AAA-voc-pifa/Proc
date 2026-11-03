import { clear_config, set_config } from './config'

type ApiVoice = {
	ShortName: string
	FriendlyName: string
	Language: string
	Locale: string
	Gender: string
}

const url_input = document.getElementById('url_prefix') as HTMLInputElement
const password_input = document.getElementById('password') as HTMLInputElement
const filter_locale = document.getElementById('filter_locale') as HTMLSelectElement
const filter_gender = document.getElementById('filter_gender') as HTMLSelectElement
const voice_select = document.getElementById('voice') as HTMLSelectElement
const save_btn = document.getElementById('save') as HTMLButtonElement
const clear_btn = document.getElementById('clear') as HTMLButtonElement
const status = document.getElementById('status') as HTMLParagraphElement

let all_voices: ApiVoice[] = []
let load_seq = 0
let debounce_timer = 0

function normalize_prefix(raw: string) {
	return raw.trim().replace(/\/+$/, '')
}

function reset_form() {
	url_input.value = ''
	password_input.value = ''
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
	const url_prefix = url_input.value.trim()
	const password = password_input.value
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
		status.textContent = 'url_prefix 不是合法 URL'
		return
	}

	status.textContent = '加载音色中…'
	try {
		const voices = await fetch_english_voices(url_prefix, password)
		if (seq !== load_seq)
			return
		all_voices = voices
		fill_locale_filter(voices)
		render_voice_options(preferred)
		status.textContent = `已加载 ${voices.length} 个英文音色`
	} catch (err) {
		if (seq !== load_seq)
			return
		all_voices = []
		fill_locale_filter([])
		render_voice_options(preferred)
		status.textContent = err instanceof Error ? err.message : String(err)
	}
}

function schedule_reload() {
	clearTimeout(debounce_timer)
	debounce_timer = window.setTimeout(() => {
		reload_voices(voice_select.value)
	}, 400)
}

url_input.addEventListener('input', schedule_reload)
password_input.addEventListener('input', schedule_reload)
filter_locale.addEventListener('change', () => render_voice_options())
filter_gender.addEventListener('change', () => render_voice_options())

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

clear_btn.addEventListener('click', async () => {
	await clear_config()
	reset_form()
	status.textContent = '已清空设置'
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
