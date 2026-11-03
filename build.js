// @ts-check
import { build } from 'esbuild'
import fs from 'fs'

fs.rmSync('dist', { recursive: true, force: true })
fs.mkdirSync('dist')
fs.cpSync('extension/manifest.json', 'dist/manifest.json')
fs.cpSync('extension/options.html', 'dist/options.html')
// fs.cpSync('extension/icon', 'dist/icon', { recursive: true })

build({
	entryPoints: [
		'extension/content.ts',
		'extension/options.ts',
	],
	bundle: true,
	outdir: 'dist',
})
