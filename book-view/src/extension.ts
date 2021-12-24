import axios from 'axios';
import cheerio from 'cheerio';
import * as vscode from 'vscode';
import { BookList } from './provider/bookList';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('book-view.message', (data) => {
		vscode.window.showInformationMessage(data);
	});
	context.subscriptions.push(disposable);

	// 所有小说排行榜
	let allBookList = new BookList("https://www.qidian.com/all");
	let allBookListTreeView = vscode.window.createTreeView('allBookList', {
		treeDataProvider: allBookList
	});

	allBookListTreeView.onDidChangeSelection(({ selection }) => {
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
					allBookList.load();
					break;
			}
		}
	});

	// 完本小说排行榜
	let finishBookList = new BookList("https://www.qidian.com/finish");
	let finishBookListTreeView = vscode.window.createTreeView('finishBookList', {
		treeDataProvider: finishBookList
	});

	finishBookListTreeView.onDidChangeSelection(({ selection }) => {
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
					finishBookList.load();
					break;
			}
		}
	});
}

// this method is called when your extension is deactivated
export function deactivate() { }
