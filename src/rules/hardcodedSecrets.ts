import { Rule } from './types';

const secretPattern = /\b(?:api[_-]?key|token|secret|password)\b\s*[:=]\s*[\'"`][^\'"`\r\n]{8,}[\'"`]/gi;

export const hardcodedSecretsRule: Rule = {
	id: 'hardcoded-secret',
	scan(text) {
		return Array.from(text.matchAll(secretPattern), (match) => ({
			index: match.index ?? 0,
			length: match[0].length,
			message: 'Possible hardcoded secret detected.',
			xp: 10,
		}));
	},
};