"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const axios_1 = require("axios");
const cheerio_1 = require("cheerio");
const vscode = require("vscode");
const bookList_1 = require("./provider/bookList");
function activate(context) {
    let disposable = vscode.commands.registerCommand('book-view.message', (data) => {
        vscode.window.showInformationMessage(data);
    });
    context.subscriptions.push(disposable);
    // 所有小说排行榜
    let allBookList = new bookList_1.BookList("https://www.qidian.com/all");
    let allBookListTreeView = vscode.window.createTreeView('allBookList', {
        treeDataProvider: allBookList
    });
    allBookListTreeView.onDidChangeSelection(({ selection }) => {
        console.log(selection);
        let item = selection[0];
        fun(item, allBookList);
    });
    // 完本小说排行榜
    let finishBookList = new bookList_1.BookList("https://www.qidian.com/finish");
    let finishBookListTreeView = vscode.window.createTreeView('finishBookList', {
        treeDataProvider: finishBookList
    });
    finishBookListTreeView.onDidChangeSelection(({ selection }) => {
        let item = selection[0];
        fun(item, finishBookList);
    });
    function fun(item, list) {
        if (!item.collapsibleState) {
            switch (item.data.type) {
                case 'chapter':
                    let chapter = item.data;
                    axios_1.default.get("http://www.xbiquge.la/" + chapter.chapterUrl).then(res => {
                        const panel = vscode.window.createWebviewPanel('book', chapter.chapterName, vscode.ViewColumn.One, {});
                        let $ = cheerio_1.default.load(res.data);
                        let content = $("#content");
                        content.attr('style', 'font-size: 14pt;');
                        panel.webview.html = content.toString();
                    });
                    break;
                case 'load':
                    list.load();
                    break;
            }
        }
    }
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map