"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookItem = exports.BookList = void 0;
const vscode = require("vscode");
class BookList {
    constructor() { }
    getTreeItem(element) {
        console.log('getTreeItem', element);
        return element;
    }
    getChildren(element) {
        console.log('getChildren', element);
        if (element) {
            var childs = [];
            for (let index = 0; index < 3; index++) {
                let str = index.toString();
                var item = new BookItem('123' + str, vscode.TreeItemCollapsibleState.None);
                childs[index] = item;
            }
            return childs;
        }
        else {
            var childs = [];
            for (let index = 0; index < 3; index++) {
                let str = index.toString();
                var item = new BookItem(str, vscode.TreeItemCollapsibleState.Collapsed);
                childs[index] = item;
            }
            return childs;
        }
    }
}
exports.BookList = BookList;
class BookItem extends vscode.TreeItem {
    constructor(label, state) {
        super(label, state);
    }
}
exports.BookItem = BookItem;
//# sourceMappingURL=list1.js.map