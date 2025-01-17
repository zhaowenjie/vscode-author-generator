/**
 * @author 燃堂(xiaoping)
 * @email rantang.hjp@alibaba-inc.com
 * @create date 2017-02-10 13:10:00
 * @modify date 2018-12-21 12:29:25
 * @desc [generator file]
 */

let vscode = require('vscode')
let path = require('path')
let fs = require('fs')
let moment = require('moment')

module.exports = {
  initInfo() {
    let editor = vscode.window.activeTextEditor
    editor.edit((builder) => {
      try {
        let document = editor._documentData._document
        let tplText = this.getTplText(document)
        builder.insert(new vscode.Position(0, 0), tplText)
      } catch (error) {
        vscode.window.showErrorMessage(error.message)
      }
    })
  },
  updateInfo() {
    let editor = vscode.window.activeTextEditor
    let range = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(21, 0))
    let text = editor.document.getText(range)
    let modifiedPos = editor.document.positionAt(text.indexOf('@modify date '))
    let modifiedLine = modifiedPos.line
    let line = editor.document.lineAt(modifiedLine)
    let lineText = line.text
    let lineTextArr = lineText.split('@modify date ')
    let replaceText = ''
    for (let i = 0; i < lineTextArr.length - 1; i++) {
      replaceText += lineTextArr[i]
    }
    replaceText += '@modify date ' + this.getDate()
    editor.edit((builder) => {
      try {
        builder.replace(line.range, replaceText)
      } catch (error) {
        vscode.window.showErrorMessage(error.message)
      }
    })
  },
  getFileType(document) {
    let fileInfo = document.fileName.split('.')
    return fileInfo.length > 1 ? fileInfo.pop() : 'default'
  },
  getTplPath(type) {
    type = type.toLowerCase()
    let extDir = vscode.extensions.getExtension('edwardhjp.vscode-author-generator').extensionPath
    let extPath = path.join(extDir, 'templates', `${type}.tpl`)
    if (fs.existsSync(extPath)) {
      return extPath
    } else {
      return path.join(extDir, 'templates', 'default.tpl')
    }
  },
  getTplText(document) {
    let text = ''
    let config = this.getConfig()
    let type = this.getFileType(document)
    let tplPath = this.getTplPath(type)
    try {
      text = fs.readFileSync(tplPath, 'utf-8')
      text = text
        .replace(/\[author\]/, config.author)
        .replace(/\[email\]/, config.email)
        .replace(/\[date\]/g, config.date)
    } catch (error) {
      vscode.window.showErrorMessage(error.message)
    }
    return text
  },
  getConfig() {
    let config = vscode.workspace.getConfiguration('author-generator')
    config = {
      author: config.get('author'),
      email: config.get('email'),
      date: this.getDate()
    }
    return config
  },
  getDate() {
    return moment().format('YYYY-MM-DD HH:mm:ss')
  }
}
