import * as vscode from 'vscode';
import { StateStore } from '../state/store';

export class QuestLogProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
	private readonly changeEmitter = new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();
	readonly onDidChangeTreeData = this.changeEmitter.event;

	constructor(private readonly stateStore: StateStore) {}

	getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
		return element;
	}

	getChildren(): vscode.ProviderResult<vscode.TreeItem[]> {
		return [
			new vscode.TreeItem(`Level ${this.stateStore.getLevel()}`),
			new vscode.TreeItem(`XP: ${this.stateStore.getXP()}`),
		];
	}

	refresh(): void {
		this.changeEmitter.fire();
	}
}
