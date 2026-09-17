import * as vscode from 'vscode';

const XP_KEY = 'be.xp';
const LEVEL_KEY = 'be.level';
const XP_PER_LEVEL = 300;

export interface StateStore {
	getXP(): number;
	addXP(amount: number): Thenable<void>;
	resetXP(): Thenable<void>;
	getLevel(): number;
}

export function createStateStore(context: vscode.ExtensionContext): StateStore {
	return {
		getXP: () => context.globalState.get<number>(XP_KEY, 0),
		addXP: (amount: number) => {
			const xp = context.globalState.get<number>(XP_KEY, 0) + amount;
			const level = Math.floor(xp / XP_PER_LEVEL) + 1;

			return Promise.all([
				context.globalState.update(XP_KEY, xp),
				context.globalState.update(LEVEL_KEY, level),
			]).then(() => undefined);
		},
		resetXP: () => Promise.all([
			context.globalState.update(XP_KEY, 0),
			context.globalState.update(LEVEL_KEY, 1),
		]).then(() => undefined),
		getLevel: () => context.globalState.get<number>(LEVEL_KEY, 1),
	};
}
