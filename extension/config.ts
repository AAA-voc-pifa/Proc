function normalize_prefix(raw: string) {
	return raw.trim().replace(/\/+$/, '')
}

export type TtsConfig = {
	url_prefix: string
	password: string
	voice: string
}

export type VocConfig = {
	url_prefix: string
	authentication: string
}

export
async function get_tts_config(): Promise<TtsConfig | null> {
	const { url_prefix, password, voice } = await chrome.storage.local.get([
		'url_prefix',
		'password',
		'voice',
	])
	if (typeof url_prefix !== 'string' || !url_prefix.trim())
		return null
	if (typeof password !== 'string' || !password)
		return null
	if (typeof voice !== 'string' || !voice.trim())
		return null
	return {
		url_prefix: normalize_prefix(url_prefix),
		password,
		voice: voice.trim(),
	}
}

export
async function set_tts_config(config: TtsConfig) {
	await chrome.storage.local.set({
		url_prefix: normalize_prefix(config.url_prefix),
		password: config.password,
		voice: config.voice.trim(),
	})
}

export
async function clear_tts_config() {
	await chrome.storage.local.remove(['url_prefix', 'password', 'voice'])
}

export
async function get_voc_config(): Promise<VocConfig | null> {
	const { voc_url_prefix, voc_authentication } = await chrome.storage.local.get([
		'voc_url_prefix',
		'voc_authentication',
	])
	if (typeof voc_url_prefix !== 'string' || !voc_url_prefix.trim())
		return null
	if (typeof voc_authentication !== 'string' || !voc_authentication)
		return null
	return {
		url_prefix: normalize_prefix(voc_url_prefix),
		authentication: voc_authentication,
	}
}

export
async function set_voc_config(config: VocConfig) {
	await chrome.storage.local.set({
		voc_url_prefix: normalize_prefix(config.url_prefix),
		voc_authentication: config.authentication,
	})
}

export
async function clear_voc_config() {
	await chrome.storage.local.remove(['voc_url_prefix', 'voc_authentication'])
}
