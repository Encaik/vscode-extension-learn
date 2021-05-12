import * as vscode from "vscode";
import axios from "axios";
import cheerio from "cheerio";

export class BookList implements vscode.TreeDataProvider<BookItem> {

  url:string = "";

  constructor(url:string) {
    this.url = url;
  }

  onDidChangeTreeData?:
    | vscode.Event<void | BookItem | null | undefined>
    | undefined;
  
  getTreeItem(element: BookItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(element?: BookItem): vscode.ProviderResult<BookItem[]> {
    if (element) {
      console.log('getChildren',element);
    } else {
      return this.getBookList().then(res=>{
        let $ = cheerio.load(res.data);
        let list = $(".all-img-list>li");
        var books = [];
        for (var i = 0; i < list.length; i++) {
            var li = list.eq(i);
            var book = {
                bookName: li.find("h4").text().trim(),
                bookAuthor: li.find(".book-mid-info .author .name").text().trim()
            };
            books[i] = new BookItem(book.bookName,vscode.TreeItemCollapsibleState.None);
        }
        return books;
      });
    }
  }

  getBookList():Promise<any>{
    return axios.get(this.url);
  }
}

export class BookItem extends vscode.TreeItem {
  constructor(label:string,state:vscode.TreeItemCollapsibleState) {
    super(label,state);
  }
}
