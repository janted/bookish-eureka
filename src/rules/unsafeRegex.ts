import { Rule, RuleFinding } from './types';

const regexLiteralPattern = /\/((?:\\.|[^/\\\r\n])*)\/([dgimsuvy]*)/g;
const regExpCallPattern = /new\s+RegExp\s*\(\s*([\'"`])((?:\\.|(?!\1)[^\\\r\n])*)\1/g;
const nestedQuantifierPattern = /\((?:\\.|[^()\\])*[+*](?:\\.|[^()\\])*\)[+*]/;
const quantifiedAlternationPattern = /\((?:\\.|[^()\\])*\|(?:\\.|[^()\\])*\)[+*]/;

function finding(index: number, length: number, pattern: string): RuleFinding | undefined {
	if (nestedQuantifierPattern.test(pattern)) {
		return {
			index,
			length,
			message: 'Potential catastrophic backtracking: nested quantified groups in regular expression.',
			xp: 10,
		};
	}

	if (quantifiedAlternationPattern.test(pattern)) {
		return {
			index,
			length,
			message: 'Potential catastrophic backtracking: quantified alternation in regular expression.',
			xp: 10,
		};
	}

	return undefined;
}

export const unsafeRegexRule: Rule = {
	id: 'unsafe-regex',
	scan(text) {
		const findings: RuleFinding[] = [];

		for (const match of text.matchAll(regexLiteralPattern)) {
			const result = finding(match.index ?? 0, match[0].length, match[1]);
			if (result) {
				findings.push(result);
			}
		}

		for (const match of text.matchAll(regExpCallPattern)) {
			const result = finding(match.index ?? 0, match[0].length, match[2]);
			if (result) {
				findings.push(result);
			}
		}

		return findings;
	},
};