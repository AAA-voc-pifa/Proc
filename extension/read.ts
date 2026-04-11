export
function read_example_sentence(sentence: string | null) {
	if (!sentence) {
		console.error('no sentence to read')
		return
	}
	const utterance = new SpeechSynthesisUtterance(sentence)
	utterance.lang = 'en-US'
	utterance.rate = .9
	utterance.voice = get_voice()!
	speechSynthesis.speak(utterance)
}

function get_voice() {
	return speechSynthesis.getVoices().find(
		voice =>
			voice.voiceURI === 'Microsoft Emma Online (Natural) - English (United States)'
	)
}
