chrome.runtime.onInstalled.addListener(details => {
	if (details.reason === 'install')
		chrome.runtime.openOptionsPage()
})

chrome.runtime.onMessage.addListener(message => {
	if (message?.type === 'open_options')
		chrome.runtime.openOptionsPage()
})
