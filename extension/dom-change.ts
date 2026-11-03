export
function observe_dom_change(hooks?: {
	on_word_change?: (word: string | null) => void
}) {
	let audio: null | HTMLAudioElement = null
	let example_sentence: HTMLElement | null = null
	let word_el: HTMLElement | null = null
	let last_word: string | null | undefined

	const sync = () => {
		audio = document.querySelector('#qa audio') as HTMLAudioElement | null
		if (audio)
			audio.play()
		example_sentence = document.querySelector('#qa .example_en') as HTMLElement | null
		word_el = document.querySelector('#qa .word') as HTMLElement | null

		const next = word_el?.textContent?.trim() || null
		if (next === last_word)
			return
		last_word = next
		hooks?.on_word_change?.(next)
	}

	const observer = new MutationObserver(sync)
	observer.observe(document.body, {
		childList: true,
		subtree: true,
	})
	sync()

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
		get_word: () => {
			if (word_el)
				return word_el.textContent?.trim() || null
			else
				return null
		},
	}
}
