// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { debounceByDocument } from './engine/debounce';
import { rules } from './rules';
import { createStateStore } from './state/store';
import { QuestLogProvider } from './ui/sidebarProvider';
import { showXPPopup } from './ui/webviewPanel';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "be" is now active!');

	const stateStore = createStateStore(context);
	const questLogProvider = new QuestLogProvider(stateStore);
	const diagnostics = vscode.languages.createDiagnosticCollection('be');
	const previousFindings = new Map<string, Map<string, number>>();
	function analyzeDocument(document: vscode.TextDocument): {
		diagnostics: vscode.Diagnostic[];
		findings: Map<string, number>;
	} {
		const documentDiagnostics: vscode.Diagnostic[] = [];
		const findings = new Map<string, number>();
		const text = document.getText();
		for (const rule of rules) {
			const findingOccurrences = new Map<string, number>();
			for (const match of rule.scan(text)) {
				const start = document.positionAt(match.index);
				const end = document.positionAt(match.index + match.length);
				const occurrence = findingOccurrences.get(match.message) ?? 0;
				findingOccurrences.set(match.message, occurrence + 1);
				const findingKey = `${rule.id}:${match.message}:${occurrence}`;
				findings.set(findingKey, match.xp);
				const diagnostic = new vscode.Diagnostic(
					new vscode.Range(start, end),
					match.message,
					vscode.DiagnosticSeverity.Warning
				);
				diagnostic.source = 'be';
				documentDiagnostics.push(diagnostic);
			}
		}

		return { diagnostics: documentDiagnostics, findings };
	}

	function updateDiagnostics(document: vscode.TextDocument): Map<string, number> {
		const { diagnostics: documentDiagnostics, findings } = analyzeDocument(document);
		diagnostics.set(document.uri, documentDiagnostics);
		return findings;
	}

	function runAnalysis(document: vscode.TextDocument): void {
		const findings = updateDiagnostics(document);

		const documentKey = document.uri.toString();
		const previous = previousFindings.get(documentKey);
		if (previous) {
			let awardedXP = 0;
			for (const [key, xp] of previous) {
				if (!findings.has(key)) {
					awardedXP += xp;
				}
			}
			if (awardedXP > 0) {
				void stateStore.addXP(awardedXP).then(() => {
					questLogProvider.refresh();
					showXPPopup(context, 'Issue fixed!', awardedXP);
				});
			}
		} else if (findings.size > 0) {
			void vscode.window.showInformationMessage('Security issue detected.');
		}

		previousFindings.set(documentKey, findings);
	}

	const saveListener = vscode.workspace.onDidSaveTextDocument(runAnalysis);
	const updateDiagnosticsAfterTyping = debounceByDocument(updateDiagnostics, 500);
	const changeListener = vscode.workspace.onDidChangeTextDocument((event) => {
		if (['javascript', 'javascriptreact', 'typescript', 'typescriptreact'].includes(event.document.languageId)) {
			updateDiagnosticsAfterTyping(event.document);
		}
	});
	const questLogView = vscode.window.registerTreeDataProvider('be.questLog', questLogProvider);

	context.subscriptions.push(diagnostics, saveListener, changeListener, questLogView);

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('be.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from bookish-eureka!');
	});

	context.subscriptions.push(disposable);

	const scanFileCommand = vscode.commands.registerCommand('be.scanFile', () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			void vscode.window.showWarningMessage('No active file to scan.');
			return;
		}
		runAnalysis(editor.document);
	});

	const resetXPCommand = vscode.commands.registerCommand('be.resetXP', async () => {
		await stateStore.resetXP();
		questLogProvider.refresh();
		void vscode.window.showInformationMessage('XP reset to 0.');
	});

	context.subscriptions.push(scanFileCommand, resetXPCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}
