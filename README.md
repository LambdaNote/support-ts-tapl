# 『型システムのしくみ』サポートサイト

このリポジトリでは、遠藤侑介著 [『型システムのしくみ ー TypeScriptで実装しながら学ぶ型とプログラミング言語』](https://www.lambdanote.com/collections/type-systems) で利用しているライブラリなどを公開しています。
同書の基となった [『n月刊ラムダノート Vol.4, No.3』](https://www.lambdanote.com/collections/n-1/products/n-vol-4-no-3-2024) の記事「TypeScriptではじめる型システム」のコードも含まれています。

いずれも使い方は各ディレクトリのREADMEおよび書籍または記事を参照してください。

## 書籍『型システムのしくみ』で利用するライブラリなど

`book`ディレクトリ内には、パーサ用のライブラリと書籍の各章で実装する型検査器の例があります。

- [book/tiny-ts-parser.ts](https://github.com/LambdaNote/support-ts-tapl/blob/main/book/tiny-ts-parser.ts) ：対象言語の構文をパースするためのライブラリ（使い方は同書の1.4節を参照）
- [book/typecheckers/](https://github.com/LambdaNote/support-ts-tapl/blob/main/book/typecheckers) ：各章で実装する型検査器

実体は https://github.com/mame/tiny-ts-parser をsubtreeとして `book` に取り込んでいます。もし本リポジトリが更新されていない場合は [元リポジトリ](https://github.com/mame/tiny-ts-parser) をあたってみてください。

## 「TypeScriptではじめる型システム」で利用するライブラリなど

`article`ディレクトリ内には、記事中に出てくる下記のファイルがあります。

- [article/utils.ts](https://github.com/LambdaNote/support-ts-tapl/blob/main/article/utils.ts) ：対象言語の構文をパースするためのライブラリ
- [article/arith.ts](https://github.com/LambdaNote/support-ts-tapl/blob/main/article/arith.ts) ：1.2節で作る型検査器
- [article/basic.ts](https://github.com/LambdaNote/support-ts-tapl/blob/main/article/basic.ts) ：1.3節と1.4節で作る型検査器

## 書籍の正誤情報

正誤情報は下記を参照してください。

- [正誤情報](https://github.com/LambdaNote/errata-typesystems-1-1/issues?q=is%3Aissue+is%3Aopen+sort%3Acreated-asc)
- [新しい正誤を報告する](https://github.com/LambdaNote/errata-typesystems-1-1)（新しいissueを立てるのではなく、ページごとに指定されているissueにコメントをしてください）

