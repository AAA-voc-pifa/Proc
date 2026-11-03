import { open_options_page } from './open-options'

export
function mount_settings_button() {
	const btn = document.createElement('button')
	btn.type = 'button'
	btn.textContent = 'Proc'
	btn.title = '打开 Proc 设置'
	Object.assign(btn.style, {
		position: 'fixed',
		right: '1rem',
		bottom: '1rem',
		zIndex: '2147483646',
		padding: '.45rem .75rem',
		border: '0',
		borderRadius: '.4rem',
		background: 'rgba(20, 20, 20, .88)',
		color: '#fff',
		font: '600 13px/1.2 ui-sans-serif, system-ui, sans-serif',
		cursor: 'pointer',
		boxShadow: '0 4px 16px rgba(0,0,0,.22)',
	} as CSSStyleDeclaration)

	btn.addEventListener('click', () => {
		open_options_page()
	})

	document.documentElement.appendChild(btn)
}
