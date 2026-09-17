// src/rules/index.ts
import { Rule } from './types';
import { hardcodedSecretsRule } from './hardcodedSecrets';
import { unsafeRegexRule } from './unsafeRegex';
import { insecureCryptoRule } from './insecureCrypto';

export const rules: Rule[] = [hardcodedSecretsRule, unsafeRegexRule, insecureCryptoRule];