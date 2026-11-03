export
function open_options_page() {
	chrome.runtime.sendMessage({ type: 'open_options' })
}
