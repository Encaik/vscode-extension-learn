"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadMore = exports.ChapterItem = exports.BookItem = exports.BookList = void 0;
const vscode = require("vscode");
const axios_1 = require("axios");
const cheerio_1 = require("cheerio");
class BookList {
    constructor(url) {
        this.url = "";
        this.books = [];
        this.page = 1;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.url = url;
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (element) {
            return this.getChapterList(element.data.bookName).then(chapterRes => {
                var _a;
                let chapter$ = cheerio_1.default.load(chapterRes.data);
                let list = chapter$("#list dd a");
                let chapters = [];
                for (let i = 0; i < list.length; i++) {
                    let li = list.eq(i);
                    let chapter = {
                        chapterName: li.text().trim(),
                        chapterUrl: ((_a = li.attr("href")) === null || _a === void 0 ? void 0 : _a.trim()) || "",
                        type: 'chapter'
                    };
                    chapters[i] = new ChapterItem(chapter, vscode.TreeItemCollapsibleState.None);
                }
                return chapters;
            });
        }
        else {
            if (this.page === 1) {
                this.books = [];
                return this.getBookList(this.url).then(res => {
                    return this.addBook(res);
                });
            }
            else {
                return this.getBookList(this.url + `/page${this.page}/`).then(res => {
                    return this.addBook(res);
                });
            }
        }
    }
    getBookList(url) {
        return axios_1.default.get(url);
    }
    addBook(res) {
        let $ = cheerio_1.default.load(res.data);
        let list = $(".all-img-list>li");
        for (let i = 0; i < list.length; i++) {
            let li = list.eq(i);
            let book = {
                bookName: li.find("h2").text().trim(),
                bookAuthor: li.find(".book-mid-info .author .name").text().trim(),
                type: 'book'
            };
            this.books.push(new BookItem(book, vscode.TreeItemCollapsibleState.Collapsed));
        }
        this.page++;
        return [...this.books, new LoadMore({ type: 'load', timestamp: new Date().toString() }, vscode.TreeItemCollapsibleState.None)];
    }
    getChapterList(bookName) {
        return this.getBookInfo(bookName).then(res => {
            var _a;
            let $ = cheerio_1.default.load(res.data);
            let bookUrl = (_a = $(".grid tr:not(:first-child) td:first-child a").attr("href")) === null || _a === void 0 ? void 0 : _a.trim();
            if (bookUrl) {
                return axios_1.default.get(bookUrl);
            }
        });
    }
    getBookInfo(bookName) {
        let url = "http://www.xbiquge.la/modules/article/waps.php?searchkey=" + encodeURIComponent(bookName);
        return axios_1.default.post(url);
    }
    load() {
        this._onDidChangeTreeData.fire();
    }
}
exports.BookList = BookList;
class BookItem extends vscode.TreeItem {
    constructor(data, state) {
        super(`${data.bookName}(作者：${data.bookAuthor})`, state);
        this.data = {};
        this.data = data;
    }
}
exports.BookItem = BookItem;
class ChapterItem extends vscode.TreeItem {
    constructor(data, state) {
        super(data.chapterName, state);
        this.data = {};
        this.data = data;
    }
}
exports.ChapterItem = ChapterItem;
class LoadMore extends vscode.TreeItem {
    constructor(data, state) {
        super("加载更多", state);
        this.data = {};
        this.data = data;
    }
}
exports.LoadMore = LoadMore;
//# sourceMappingURL=bookList.js.map