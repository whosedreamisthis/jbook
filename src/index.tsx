import ReactDOM from 'react-dom/client';
import { useState, useEffect, useRef } from 'react';
import * as esbuild from 'esbuild-wasm';
import { unpkgPathPlugin } from './plugins/unpkg-path-plugin';
import { fetchPlugin } from './plugins/fetch-plugin';
const el = document.getElementById('root');

const root = ReactDOM.createRoot(el!);

const App = () => {
	const [input, setInput] = useState('');
	const [code, setCode] = useState('');
	const ref = useRef<any>();

	const startService = async () => {
		ref.current = await esbuild.startService({
			worker: true,
			wasmURL: '/esbuild.wasm',
		});
	};
	useEffect(() => {
		startService();
	}, []);
	const onClick = async () => {
		if (!ref.current) {
			return;
		}
		const result = await ref.current.build({
			entryPoints: ['index.js'],
			bundle: true,
			write: false,
			plugins: [unpkgPathPlugin(), fetchPlugin(input)],
			define: {
				'process.env.NODE_ENV': '"production"',
				global: 'window',
			},
		});
		// console.log(result);
		setCode(result.outputFiles[0].text);
	};
	return (
		<div>
			<textarea
				value={input}
				onChange={(e) => {
					setInput(e.target.value);
				}}
			></textarea>
			<div>
				<button onClick={onClick}>Submit</button>
			</div>
			<pre>{code}</pre>
		</div>
	);
};

root.render(<App />);
