import * as vscode from 'vscode';

let activePanel: vscode.WebviewPanel | undefined;

export function showXPPopup(context: vscode.ExtensionContext, message: string, xpAmount: number): void {
	activePanel?.dispose();

	activePanel = vscode.window.createWebviewPanel(
		'secureQuestPopup',
		'SecureQuest',
		{ viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
		{
			enableScripts: false,
			retainContextWhenHidden: false,
			localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media')]
		}
	);

	const popupFontUri = activePanel.webview.asWebviewUri(
		vscode.Uri.joinPath(context.extensionUri, 'media', 'fonts', 'PressStart2P-Regular.ttf')
	);
	activePanel.webview.html = getPopupHtml(message, xpAmount, popupFontUri.toString());

	const panelRef = activePanel;
	setTimeout(() => panelRef.dispose(), 3000);
	activePanel.onDidDispose(() => {
		if (activePanel === panelRef) {
			activePanel = undefined;
		}
	});
}

function getPopupHtml(message: string, xpAmount: number, fontUri: string): string {
	return /* html */ `<!DOCTYPE html>
<html><head><style>
	@font-face {
		font-family: 'PressStart2P';
		src: url('${fontUri}') format('truetype');
	}
  body {
    background: #0f0f1a;
    color: #7CFC00;
		font-family: 'PressStart2P', monospace;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    margin: 0;
    text-shadow: 2px 2px #000;
  }
	.xp { font-size: 1.4em; color: #FFD700; animation: pop 0.3s ease-out; }
	.msg { font-size: 0.7em; margin-top: 12px; text-align: center; padding: 0 20px; }
  @keyframes pop { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
</style></head>
<body>
  <div class="xp">+${xpAmount} XP</div>
  <div class="msg">${escapeHtml(message)}</div>
</body></html>`;
}

function escapeHtml(text: string): string {
	const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
	return text.replace(/[&<>"']/g, (character) => map[character]);
}
