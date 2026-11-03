import { get_voc_config } from './config'
import { notify } from './notify'

type OkExist = { ok: true, data: boolean }
type OkNull = { ok: true, data: null }
type ErrBody = { ok: false, error: string }

export
async function word_exists(word: string): Promise<boolean | null> {
	const config = await get_voc_config()
	if (!config)
		return null

	const res = await fetch(
		`${config.url_prefix}/voc/exist/${encodeURIComponent(word)}`,
		{ headers: { Authentication: config.authentication } },
	)
	if (!res.ok) {
		console.error('voc exist failed', res.status, await res.text())
		return null
	}

	const body = await res.json() as OkExist | ErrBody
	if (!body.ok)
		return null
	return body.data
}

export
async function add_word(word: string | null) {
	if (!word?.trim()) {
		notify('当前卡片没有单词')
		return false
	}

	const config = await get_voc_config()
	if (!config) {
		notify('请先配置 voc-api 的 url_prefix 和 authentication（点击打开选项）', {
			open_options: true,
		})
		return false
	}

	const trimmed = word.trim()
	const res = await fetch(
		`${config.url_prefix}/voc/${encodeURIComponent(trimmed)}`,
		{
			method: 'POST',
			headers: { Authentication: config.authentication },
		},
	)
	if (res.status === 401) {
		notify('voc-api 未授权，请检查 authentication', {
			open_options: true,
		})
		return false
	}
	if (!res.ok) {
		notify(`添加失败：HTTP ${res.status}`)
		console.error('voc add failed', res.status, await res.text())
		return false
	}

	const body = await res.json() as OkNull | ErrBody
	if (!body.ok) {
		notify(body.error || '添加失败')
		return false
	}

	notify(`已添加：${trimmed}`)
	return true
}
