import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { StateStore } from '../state/store';
import { QuestLogProvider } from '../ui/sidebarProvider';

suite('Extension Test Suite', () => {
	test('contributes the SecureQuest view and commands', () => {
		const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8')) as {
			contributes: {
				commands: Array<{ command: string }>;
				viewsContainers: { activitybar: Array<{ id: string; icon: string }> };
				views: Record<string, Array<{ id: string; name: string }>>;
			};
		};
		assert.strictEqual(packageJson.contributes.viewsContainers.activitybar[0].id, 'secureQuest');
		assert.strictEqual(packageJson.contributes.views.secureQuest[0].id, 'be.questLog');
		assert.deepStrictEqual(
			packageJson.contributes.commands.map((command) => command.command),
			['be.helloWorld', 'be.scanFile', 'be.resetXP']
		);
	});

	test('refreshes Quest Log values from the state store', async () => {
		let xp = 0;
		let level = 1;
		const stateStore: StateStore = {
			getXP: () => xp,
			getLevel: () => level,
			addXP: async () => undefined,
			resetXP: async () => undefined,
		};
		const provider = new QuestLogProvider(stateStore);
		const initialItems = await provider.getChildren();
		assert.deepStrictEqual((initialItems as vscode.TreeItem[]).map((item) => item.label), ['Level 1', 'XP: 0']);

		let refreshCount = 0;
		provider.onDidChangeTreeData(() => refreshCount++);
		xp = 10;
		level = 1;
		provider.refresh();
		const updatedItems = await provider.getChildren();
		assert.deepStrictEqual((updatedItems as vscode.TreeItem[]).map((item) => item.label), ['Level 1', 'XP: 10']);
		assert.strictEqual(refreshCount, 1);
	});
});
