import vscode, { workspace, ExtensionContext, ConfigurationChangeEvent } from 'vscode';
import * as commands from './commands';
import { getWorkspaceConfig } from './utils';
import { activateVls, deactivateVls } from './langserver';

const cmds = {
	'v.run': commands.run,
	'v.ver': commands.ver,
	'v.prod': commands.prod,
	'v.devbits_playground': commands.devbitsPlayground,
	'v.vls.update': commands.updateVls,
};

/**
 * This method is called when the extension is activated.
 * @param context The extension context
 */
export function activate(context: ExtensionContext): void {
	for (const cmd in cmds) {
		const handler = cmds[cmd] as () => void;
		const disposable = vscode.commands.registerCommand(cmd, handler);
		context.subscriptions.push(disposable);
	}

	workspace.onDidChangeConfiguration((e: ConfigurationChangeEvent) => {
		if (e.affectsConfiguration('v.vls.enable')) {
			const isVlsEnabled = getWorkspaceConfig().get<boolean>('vls.enable');
			if (isVlsEnabled) {
				void activateVls(context);
			} else {
				void deactivateVls();
			}
		}
	});

	const shouldEnableVls = getWorkspaceConfig().get<boolean>('vls.enable');
	if (shouldEnableVls) {
		void activateVls(context);
	}
}
