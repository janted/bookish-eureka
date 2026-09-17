import * as assert from 'assert';
import { insecureCryptoRule } from '../rules/insecureCrypto';
import { rules } from '../rules';
import { unsafeRegexRule } from '../rules/unsafeRegex';

suite('Security rules', () => {
	test('detects catastrophic regex shapes in literals and RegExp calls', () => {
		const findings = unsafeRegexRule.scan(`
			const literal = /(a+)+$/;
			const constructed = new RegExp('(a|a)*');
		`);

		assert.strictEqual(findings.length, 2);
		assert.match(findings[0].message, /nested quantified groups/);
		assert.match(findings[1].message, /quantified alternation/);
	});

	test('detects broken hash algorithms but ignores Math.random', () => {
		const findings = insecureCryptoRule.scan(`
			crypto.createHash('md5');
			crypto.createHash("SHA1");
			Math.random();
		`);

		assert.strictEqual(findings.length, 2);
		assert.match(findings[0].message, /MD5/);
		assert.match(findings[0].message, /SHA-256/);
		assert.match(findings[1].message, /SHA1/);
		assert.strictEqual(rules.includes(unsafeRegexRule), true);
		assert.strictEqual(rules.includes(insecureCryptoRule), true);
	});
});