import { observe_dom_change } from './dom-change'
import { read_example_sentence } from './read'
import { mount_toolbar } from './toolbar'

const { play_audio, get_example_sentence } = observe_dom_change()

mount_toolbar({
	play_audio,
	read_example: () => {
		read_example_sentence(get_example_sentence()).catch(console.error)
	},
})

console.log('PROC extension loaded')
