import * as vscode from "vscode";
import axios from "axios";
import cheerio from "cheerio";

export class BookList implements vscode.TreeDataProvider<BookItem> {

  url: string = "";
  books: Array<BookItem | LoadMore> = [];
  page: number = 1;
  private _onDidChangeTreeData: vscode.EventEmitter<BookItem | undefined | null | void> = new vscode.EventEmitter<BookItem | undefined | null | void>();

  constructor(url: string) {
    this.url = url;
  }

  readonly onDidChangeTreeData: vscode.Event<BookItem | undefined | null | void> = this._onDidChangeTreeData.event;

  getTreeItem(element: BookItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(element?: BookItem): vscode.ProviderResult<Array<BookItem>> {
    if (element) {
      return this.getChapterList(element.data.bookName).then(chapterRes => {
        let chapter$ = cheerio.load(chapterRes.data);
        let list = chapter$("#list dd a");
        let chapters = [];
        for (let i = 0; i < list.length; i++) {
          let li = list.eq(i);
          let chapter = {
            chapterName: li.text().trim(),
            chapterUrl: li.attr("href")?.trim() || "",
            type: 'chapter'
          };
          chapters[i] = new ChapterItem(chapter, vscode.TreeItemCollapsibleState.None);
        }
        return chapters;
      });
    } else {
      if (this.page === 1) {
        this.books = [];
        return this.getBookList(this.url).then(res => {
          return this.addBook(res);
        });
      } else {
        return this.getBookList(this.url + `/page${this.page}/`).then(res => {
          return this.addBook(res);
        });
      }
    }
  }

  getBookList(url: string): Promise<any> {
    return axios.get(url);
  }

  addBook(res: any) {
    let $ = cheerio.load(res.data);
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
    return [...this.books, new LoadMore({ type: 'load',timestamp:new Date().toString() }, vscode.TreeItemCollapsibleState.None)];
  }

  getChapterList(bookName: string): Promise<any> {
    return this.getBookInfo(bookName).then(res => {
      let $ = cheerio.load(res.data);
      let bookUrl = $(".grid tr:not(:first-child) td:first-child a").attr("href")?.trim();
      if (bookUrl) {
        return axios.get(bookUrl);
      }
    });
  }

  getBookInfo(bookName: string): Promise<any> {
    let url = "http://www.xbiquge.la/modules/article/waps.php?searchkey=" + encodeURIComponent(bookName);
    return axios.post(url);
  }

  load() {
    this._onDidChangeTreeData.fire();
  }
}

export class BookItem extends vscode.TreeItem {
  data: { [key: string]: string } = {};
  constructor(data: { [key: string]: string }, state: vscode.TreeItemCollapsibleState) {
    super(`${data.bookName}(作者：${data.bookAuthor})`, state);
    this.data = data;
  }
}

export class ChapterItem extends vscode.TreeItem {
  data: { [key: string]: string } = {};
  constructor(data: { [key: string]: string }, state: vscode.TreeItemCollapsibleState) {
    super(data.chapterName, state);
    this.data = data;
  }
}

export class LoadMore extends vscode.TreeItem {
  data: { [key: string]: string } = {};
  constructor(data: { [key: string]: string }, state: vscode.TreeItemCollapsibleState) {
    super("加载更多", state);
    this.data = data;
  }
}
