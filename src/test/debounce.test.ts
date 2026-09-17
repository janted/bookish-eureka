import * as assert from 'assert';
import { debounceByDocument } from '../engine/debounce';

suite('Document debounce', () => {
	test('keeps independent timers per document URI', async () => {
		const calls: string[] = [];
		const debounced = debounceByDocument((document: { uri: { toString(): string } }) => {
			calls.push(document.uri.toString());
		}, 10);
		const documentA = { uri: { toString: () => 'file:///a.ts' } };
		const documentB = { uri: { toString: () => 'file:///b.ts' } };

		debounced(documentA);
		debounced(documentA);
		debounced(documentB);
		await new Promise((resolve) => setTimeout(resolve, 25));

		assert.deepStrictEqual(calls.sort(), ['file:///a.ts', 'file:///b.ts']);
	});
});