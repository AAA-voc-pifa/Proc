export
function observe_dom_change() {
	let audio: null | HTMLAudioElement = null
	let example_sentence: HTMLElement | null = null
	const observer = new MutationObserver(() => {
		console.log('dom changed')
		audio = document.querySelector('#qa audio') as HTMLAudioElement | null
		if (audio)
			audio.play()
		example_sentence = document.querySelector('#qa .example_en') as HTMLElement | null
	})
	observer.observe(document.body, {
		childList: true,
		subtree: true,
	})

	return {
		play_audio: () => {
			if (audio)
				audio.play()
			else
				console.error('no audio element')
		},
		get_example_sentence: () => {
			if (example_sentence)
				return example_sentence.textContent
			else
				return null
		},
	}
}
