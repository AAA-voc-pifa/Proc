import { open_options_page } from './open-options'

let toast_el: HTMLDivElement | null = null
let hide_timer = 0
let open_options_on_click = false

export
function notify(message: string, options?: { open_options?: boolean }) {
	open_options_on_click = options?.open_options === true

	if (!toast_el) {
		toast_el = document.createElement('div')
		Object.assign(toast_el.style, {
			position: 'fixed',
			right: '0',
			left: 'auto',
			transform: 'none',
			zIndex: '2147483647',
			boxSizing: 'border-box',
			padding: '8px 10px',
			borderTop: '1px solid #333',
			borderLeft: '1px solid #333',
			borderRadius: '0',
			background: '#111',
			color: '#fff',
			font: '13px/1.4 system-ui, sans-serif',
			boxShadow: 'none',
		} as CSSStyleDeclaration)
		toast_el.addEventListener('click', () => {
			if (open_options_on_click)
				open_options_page()
			hide()
		})
		document.documentElement.appendChild(toast_el)
	}

	const toolbar = document.querySelector('.proc-toolbar')
	const toolbar_h = toolbar instanceof HTMLElement ? toolbar.offsetHeight : 0
	const toolbar_w = toolbar instanceof HTMLElement ? toolbar.offsetWidth : 0

	toast_el.textContent = message
	toast_el.style.bottom = `${toolbar_h}px`
	toast_el.style.minWidth = toolbar_w ? `${toolbar_w}px` : ''
	toast_el.style.maxWidth = 'min(28rem, 100vw)'
	toast_el.style.cursor = open_options_on_click ? 'pointer' : 'default'
	toast_el.style.display = 'block'
	clearTimeout(hide_timer)
	hide_timer = window.setTimeout(hide, 4000)
}

function hide() {
	if (!toast_el)
		return
	toast_el.style.display = 'none'
}
