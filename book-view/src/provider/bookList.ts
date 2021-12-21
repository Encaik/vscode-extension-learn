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
      return this.getChapterList(element.data.bookName).then(chapterRes=>{
        let chapter$ = cheerio.load(chapterRes.data);
        let list = chapter$("#list dd a");
        let chapters = [];
        for (let i = 0; i < list.length; i++) {
            let li = list.eq(i);
            let chapter = {
                chapterName: li.text().trim(),
                chapterUrl: li.attr("href")?.trim()||""
            };
            chapters[i] = new ChapterItem(chapter,vscode.TreeItemCollapsibleState.None);
        }
        return chapters;
      });
    } else {
      return this.getBookList().then(res=>{
        let $ = cheerio.load(res.data);
        let list = $(".all-img-list>li");
        let books = [];
        for (let i = 0; i < list.length; i++) {
            let li = list.eq(i);
            let book = {
                bookName: li.find("h2").text().trim(),
                bookAuthor: li.find(".book-mid-info .author .name").text().trim()
            };
            books[i] = new BookItem(book,vscode.TreeItemCollapsibleState.Collapsed);
        }
        return books;
      });
    }
  }

  getBookList():Promise<any>{
    return axios.get(this.url);
  }

  getChapterList(bookName:string):Promise<any>{
    return this.getBookInfo(bookName).then(res => {
      let $ = cheerio.load(res.data);
      let bookUrl = $(".grid tr:not(:first-child) td:first-child a").attr("href")?.trim();
      if (bookUrl) {
        return axios.get(bookUrl);
      }
    });
  }

  getBookInfo(bookName:string):Promise<any>{
    let url = "http://www.xbiquge.la/modules/article/waps.php?searchkey=" + encodeURIComponent(bookName);
    return axios.post(url);
  }
}

export class BookItem extends vscode.TreeItem {
  data:{[key:string]:string} = {};
  constructor(data:{[key:string]:string},state:vscode.TreeItemCollapsibleState) {
    super(`${data.bookName}(作者：${data.bookAuthor})`,state);
    this.data = data;
  }
}

export class ChapterItem extends vscode.TreeItem {
  data:{[key:string]:string} = {};
  constructor(data:{[key:string]:string},state:vscode.TreeItemCollapsibleState) {
    super(data.chapterName,state);
    this.data = data;
  }
}
