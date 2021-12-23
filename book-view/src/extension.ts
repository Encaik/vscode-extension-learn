import axios from 'axios';
import cheerio from 'cheerio';
import * as vscode from 'vscode';
import { BookList } from './provider/bookList';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('book-view.message', (data) => {
		vscode.window.showInformationMessage(data);
	});
	context.subscriptions.push(disposable);

	let books = new BookList("https://www.qidian.com/all");
	let allBookList = vscode.window.createTreeView('allBookList', {
		treeDataProvider: books
	});

	allBookList.onDidChangeSelection(({ selection }) => {
		let item = selection[0];
		if (!item.collapsibleState) {
			switch (item.data.type) {
				case 'chapter':
					let chapter = item.data;
					axios.get("http://www.xbiquge.la/" + chapter.chapterUrl).then(res => {
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
					break;
				case 'load':
					books.load();
					break;
			}

		}
	});

	//完本小说列表(https://www.qidian.com/finish/page2)
	vscode.window.registerTreeDataProvider(
		'finishBookList',
		new BookList("https://www.qidian.com/finish")
	);
}

// this method is called when your extension is deactivated
export function deactivate() { }
