"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const axios_1 = require("axios");
const cheerio_1 = require("cheerio");
const vscode = require("vscode");
const bookList_1 = require("./provider/bookList");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "book-view" is now active!');
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('book-view.helloWorld', (chapter) => {
        vscode.window.showInformationMessage(chapter.chapterName);
        axios_1.default.get("http://www.xbiquge.la/" + chapter.chapterUrl).then(res => {
            const panel = vscode.window.createWebviewPanel('book', chapter.chapterName, vscode.ViewColumn.One, {});
            let $ = cheerio_1.default.load(res.data);
            let content = $("#content");
            panel.webview.html = content.toString();
        });
    });
    //全部小说列表
    vscode.window.registerTreeDataProvider('allBookList', new bookList_1.BookList("https://www.qidian.com/all"));
    //完本小说列表
    vscode.window.registerTreeDataProvider('finishBookList', new bookList_1.BookList("https://www.qidian.com/finish"));
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map