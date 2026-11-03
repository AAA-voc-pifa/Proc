import { open_options_page } from './open-options'

type Action = {
	key: string
	label: string
	title: string
	run: () => void
	managed?: boolean
}

export type Toolbar = {
	set_add_enabled: (enabled: boolean) => void
}

const STYLE_ID = 'proc-toolbar-style'

export
function mount_toolbar(actions: {
	play_audio: () => void
	read_example: () => void
	add_word: () => void
}): Toolbar {
	ensure_styles()

	const bar = document.createElement('div')
	bar.className = 'proc-toolbar'
	bar.setAttribute('role', 'toolbar')
	bar.setAttribute('aria-label', 'Proc')

	const items: Action[] = [
		{
			key: 'w',
			label: '单词本',
			title: '添加到单词本',
			run: actions.add_word,
			managed: true,
		},
		{
			key: 'e',
			label: '例句',
			title: '读例句',
			run: actions.read_example,
		},
		{
			key: 'r',
			label: '单词',
			title: '读单词',
			run: actions.play_audio,
		},
		{
			key: 's',
			label: '设置',
			title: '打开 Proc 设置',
			run: open_options_page,
		},
	]

	const buttons = new Map<string, HTMLButtonElement>()
	let add_btn: HTMLButtonElement | null = null

	for (const item of items) {
		const btn = document.createElement('button')
		btn.type = 'button'
		btn.className = 'proc-toolbar__btn'
		btn.title = `${item.title}（${item.key}）`

		const label = document.createElement('span')
		label.textContent = item.label

		const kbd = document.createElement('kbd')
		kbd.className = 'proc-toolbar__kbd'
		kbd.textContent = item.key

		btn.append(label, kbd)
		btn.addEventListener('click', item.run)
		buttons.set(item.key, btn)

		if (item.managed) {
			add_btn = btn
			btn.disabled = true
			btn.title = '已在单词本或不可添加（w）'
		}

		bar.appendChild(btn)
	}

	document.addEventListener('keydown', evt => {
		if (evt.metaKey || evt.ctrlKey || evt.altKey)
			return
		if (is_typing_target(evt.target))
			return

		const key = evt.key.toLowerCase()
		const btn = buttons.get(key)
		if (!btn || btn.disabled)
			return
		evt.preventDefault()
		btn.click()
	})

	document.documentElement.appendChild(bar)

	return {
		set_add_enabled(enabled) {
			if (!add_btn)
				return
			add_btn.disabled = !enabled
			add_btn.title = enabled
				? '添加到单词本（w）'
				: '已在单词本或不可添加（w）'
		},
	}
}

function ensure_styles() {
	if (document.getElementById(STYLE_ID))
		return

	const style = document.createElement('style')
	style.id = STYLE_ID
	style.textContent = `
		.proc-toolbar {
			position: fixed;
			right: 0;
			bottom: 0;
			z-index: 2147483646;
			display: flex;
			border-top: 1px solid #ccc;
			border-left: 1px solid #ccc;
			background: #f3f3f3;
			font: 13px/1.2 system-ui, sans-serif;
			color: #222;
			user-select: none;
		}

		.proc-toolbar__btn {
			appearance: none;
			display: inline-flex;
			align-items: center;
			gap: 4px;
			margin: 0;
			padding: 8px 10px;
			border: 0;
			border-right: 1px solid #ccc;
			border-radius: 0;
			background: #f3f3f3;
			color: inherit;
			font: inherit;
			cursor: pointer;
		}

		.proc-toolbar__btn:last-child {
			border-right: 0;
		}

		.proc-toolbar__btn:hover:not(:disabled) {
			background: #e8e8e8;
		}

		.proc-toolbar__btn:active:not(:disabled) {
			background: #ddd;
		}

		.proc-toolbar__btn:disabled {
			color: #999;
			cursor: not-allowed;
		}

		.proc-toolbar__kbd {
			margin: 0;
			padding: 0;
			border: 0;
			border-radius: 0;
			background: transparent;
			color: #777;
			font: 11px/1 ui-monospace, Menlo, monospace;
			box-shadow: none;
		}

		.proc-toolbar__btn:disabled .proc-toolbar__kbd {
			color: #aaa;
		}
	`
	document.documentElement.appendChild(style)
}

function is_typing_target(target: EventTarget | null) {
	if (!(target instanceof HTMLElement))
		return false
	const tag = target.tagName
	return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable
}
