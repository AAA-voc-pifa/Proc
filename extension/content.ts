import { observe_dom_change } from './dom-change'
import { read_example_sentence } from './read'
import { mount_toolbar } from './toolbar'
import { add_word, word_exists } from './voc'

let exist_seq = 0
let api: ReturnType<typeof observe_dom_change>

const toolbar = mount_toolbar({
	play_audio: () => api.play_audio(),
	read_example: options => {
		read_example_sentence(api.get_example_sentence(), options).catch(console.error)
	},
	add_word: () => {
		add_word(api.get_word())
			.then(ok => {
				if (ok)
					toolbar.set_add_enabled(false)
			})
			.catch(console.error)
	},
})

api = observe_dom_change({
	on_word_change: word => {
		refresh_add_state(word).catch(console.error)
	},
})

async function refresh_add_state(word: string | null) {
	const seq = ++exist_seq
	toolbar.set_add_enabled(false)
	if (!word)
		return

	const exists = await word_exists(word)
	if (seq !== exist_seq)
		return
	toolbar.set_add_enabled(exists === false)
}

console.log('PROC extension loaded')
