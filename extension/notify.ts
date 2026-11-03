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
			left: '50%',
			bottom: '2rem',
			transform: 'translateX(-50%)',
			zIndex: '2147483647',
			maxWidth: 'min(28rem, calc(100vw - 2rem))',
			padding: '.75rem 1rem',
			borderRadius: '.5rem',
			background: 'rgba(20, 20, 20, .92)',
			color: '#fff',
			font: '14px/1.45 system-ui, sans-serif',
			boxShadow: '0 8px 24px rgba(0,0,0,.28)',
		} as CSSStyleDeclaration)
		toast_el.addEventListener('click', () => {
			if (open_options_on_click)
				open_options_page()
			hide()
		})
		document.documentElement.appendChild(toast_el)
	}

	toast_el.textContent = message
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
