// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import axios from 'axios';
import cheerio from 'cheerio';
import * as vscode from 'vscode';
import { BookList } from './provider/bookList';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "book-view" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('book-view.helloWorld', (chapter) => {
		vscode.window.showInformationMessage(chapter.chapterName);
		axios.get("http://www.xbiquge.la/"+chapter.chapterUrl).then(res=>{
			const panel = vscode.window.createWebviewPanel(
				'book',
				chapter.chapterName,
				vscode.ViewColumn.One,
				{}
			);
			let $ = cheerio.load(res.data);
			let content = $("#content");
			panel.webview.html = content.toString();
		});
	});

	//全部小说列表
	vscode.window.registerTreeDataProvider(
		'allBookList',
		new BookList("https://www.qidian.com/all")
	);

	//完本小说列表
	vscode.window.registerTreeDataProvider(
		'finishBookList',
		new BookList("https://www.qidian.com/finish")
	);

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
