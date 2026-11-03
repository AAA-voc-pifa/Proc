import { open_options_page } from './open-options'

type Action = {
	key: string
	label: string
	title: string
	run: () => void
}

export
function mount_toolbar(actions: {
	play_audio: () => void
	read_example: () => void
}) {
	const bar = document.createElement('div')
	Object.assign(bar.style, {
		position: 'fixed',
		right: '1rem',
		bottom: '1rem',
		zIndex: '2147483646',
		display: 'flex',
		gap: '.4rem',
	} as CSSStyleDeclaration)

	const items: Action[] = [
		{
			key: 'r',
			label: '单词',
			title: '读单词',
			run: actions.play_audio,
		},
		{
			key: 'e',
			label: '例句',
			title: '读例句',
			run: actions.read_example,
		},
		{
			key: 's',
			label: '设置',
			title: '打开 Proc 设置',
			run: open_options_page,
		},
	]

	const buttons = new Map<string, HTMLButtonElement>()

	for (const item of items) {
		const btn = document.createElement('button')
		btn.type = 'button'
		btn.title = `${item.title}（${item.key}）`
		Object.assign(btn.style, {
			display: 'inline-flex',
			alignItems: 'center',
			gap: '.35rem',
			padding: '.45rem .7rem',
			border: '0',
			borderRadius: '.4rem',
			background: 'rgba(20, 20, 20, .88)',
			color: '#fff',
			font: '600 13px/1.2 ui-sans-serif, system-ui, sans-serif',
			cursor: 'pointer',
			boxShadow: '0 4px 16px rgba(0,0,0,.22)',
		} as CSSStyleDeclaration)

		const text = document.createElement('span')
		text.textContent = item.label

		const kbd = document.createElement('span')
		kbd.textContent = item.key
		Object.assign(kbd.style, {
			padding: '.05rem .28rem',
			borderRadius: '.25rem',
			background: 'rgba(255,255,255,.16)',
			font: '600 11px/1.3 ui-monospace, SFMono-Regular, Menlo, monospace',
			opacity: '.9',
		} as CSSStyleDeclaration)

		btn.append(text, kbd)
		btn.addEventListener('click', item.run)
		buttons.set(item.key, btn)
		bar.appendChild(btn)
	}

	document.addEventListener('keydown', evt => {
		if (evt.metaKey || evt.ctrlKey || evt.altKey)
			return
		if (is_typing_target(evt.target))
			return

		const key = evt.key.toLowerCase()
		const btn = buttons.get(key)
		if (!btn)
			return
		evt.preventDefault()
		btn.click()
	})

	document.documentElement.appendChild(bar)
}

function is_typing_target(target: EventTarget | null) {
	if (!(target instanceof HTMLElement))
		return false
	const tag = target.tagName
	return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable
}
