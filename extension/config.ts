export type Config = {
	url_prefix: string
	password: string
	voice: string
}

export
async function get_config(): Promise<Config | null> {
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
		url_prefix: url_prefix.trim().replace(/\/+$/, ''),
		password,
		voice: voice.trim(),
	}
}

export
async function set_config(config: Config) {
	await chrome.storage.local.set({
		url_prefix: config.url_prefix.trim().replace(/\/+$/, ''),
		password: config.password,
		voice: config.voice.trim(),
	})
}
