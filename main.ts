import { Plugin } from "obsidian";
import { clipboard } from "electron";
import * as CodeMirror from "codemirror";

import title_f from "get-url-title";

interface WordBoundaries {
  start: { line: number; ch: number };
  end: { line: number; ch: number };
}

export default class UrlWithTitle extends Plugin {
  async onload() {
    this.addCommand({
      id: "paste-url-with-title",
      name: "",
      callback: () => this.UrlWithTitle(),
      hotkeys: [
        {
          modifiers: ["Mod", "Shift"],
          key: "v",
        },
      ],
    });
  }

  UrlWithTitle(): void {
    let editor = this.getEditor();
    let selectedText = UrlWithTitle.getSelectedText(editor);
    let clipboardText = clipboard.readText("clipboard");

    if (clipboardText && this.isUrl(clipboardText)) {
      let title = UrlWithTitle.getTitle(clipboardText)
      // title.then((t) => editor.replaceSelection(`[${t}](${clipboardText})`));
      // title.catch((e) => editor.replaceSelection(`[${e}](${clipboardText})`))
      editor.replaceSelection(`[${title}](${clipboardText})`)
    } else if (this.isUrl(selectedText)) {
      editor.replaceSelection(`[${clipboardText}](${selectedText})`);
    }
  }

  isUrl(text: string): boolean {
    let urlRegex = new RegExp(
      "^(http:\\/\\/www\\.|https:\\/\\/www\\.|http:\\/\\/|https:\\/\\/)?[a-z0-9]+([\\-.]{1}[a-z0-9]+)*\\.[a-z]{2,5}(:[0-9]{1,5})?(\\/.*)?$"
    );
    return urlRegex.test(text);
  }

  private getEditor(): CodeMirror.Editor {
    let activeLeaf: any = this.app.workspace.activeLeaf;
    return activeLeaf.view.sourceMode.cmEditor;
  }

  private static getSelectedText(editor: CodeMirror.Editor): string {
    if (!editor.somethingSelected()) {
      let wordBoundaries = UrlWithTitle.getWordBoundaries(editor);
      editor.getDoc().setSelection(wordBoundaries.start, wordBoundaries.end);
    }
    return editor.getSelection();
  }

  private static getWordBoundaries(editor: CodeMirror.Editor): WordBoundaries {
    let startCh, endCh: number;
    let cursor = editor.getCursor();

    if (editor.getTokenTypeAt(cursor) === "url") {
      let token = editor.getTokenAt(cursor);
      startCh = token.start;
      endCh = token.end;
    } else {
      let word = editor.findWordAt(cursor);
      startCh = word.anchor.ch;
      endCh = word.head.ch;
    }

    return {
      start: { line: cursor.line, ch: startCh },
      end: { line: cursor.line, ch: endCh },
    };
  }

  private static getTitle(url: string) {  
    // return fetch(url)
    //   .then((response) => response.text())
    //   .then((html) => {
    //     const doc = new DOMParser().parseFromString(html, "text/html");
    //     const title = doc.querySelectorAll('title')[0];
        
    //     return title.innerText;
    //   });
    
    var title_g = ""
    title_g = title_f(url)
    return title_g
  };
}
