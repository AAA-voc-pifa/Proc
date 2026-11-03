import { open_options_page } from './open-options'

let toast_el: HTMLDivElement | null = null
let hide_timer = 0

export
function notify(message: string) {
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
			font: '14px/1.45 ui-sans-serif, system-ui, sans-serif',
			boxShadow: '0 8px 24px rgba(0,0,0,.28)',
			cursor: 'pointer',
		} as CSSStyleDeclaration)
		toast_el.addEventListener('click', () => {
			open_options_page()
			hide()
		})
		document.documentElement.appendChild(toast_el)
	}

	toast_el.textContent = message
	toast_el.style.display = 'block'
	clearTimeout(hide_timer)
	hide_timer = window.setTimeout(hide, 4000)
}

function hide() {
	if (!toast_el)
		return
	toast_el.style.display = 'none'
}
