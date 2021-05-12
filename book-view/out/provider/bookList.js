"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookItem = exports.BookList = void 0;
const vscode = require("vscode");
const axios_1 = require("axios");
const cheerio_1 = require("cheerio");
class BookList {
    constructor(url) {
        this.url = "";
        this.url = url;
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (element) {
            console.log('getChildren', element);
        }
        else {
            return this.getBookList().then(res => {
                let $ = cheerio_1.default.load(res.data);
                let list = $(".all-img-list>li");
                var books = [];
                for (var i = 0; i < list.length; i++) {
                    var li = list.eq(i);
                    var book = {
                        bookName: li.find("h4").text().trim(),
                        bookAuthor: li.find(".book-mid-info .author .name").text().trim()
                    };
                    books[i] = new BookItem(book.bookName, vscode.TreeItemCollapsibleState.None);
                }
                return books;
            });
        }
    }
    getBookList() {
        return axios_1.default.get(this.url);
    }
}
exports.BookList = BookList;
class BookItem extends vscode.TreeItem {
    constructor(label, state) {
        super(label, state);
    }
}
exports.BookItem = BookItem;
//# sourceMappingURL=bookList.js.map