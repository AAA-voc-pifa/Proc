import { observe_dom_change } from './dom-change'
import { read_example_sentence } from './read'

const { play_audio, get_example_sentence } = observe_dom_change()
document.addEventListener('keydown', evt => {
	switch (evt.key) {
		case 'r':
		case 'R':
			play_audio()
			break
		case 'e':
		case 'E':
			read_example_sentence(get_example_sentence())
			break
	}
})

console.log('PROC extension loaded')
