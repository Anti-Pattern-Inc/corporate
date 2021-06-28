# corporate

# How to check by Staging

make your pull request to mater branch  
after it's merged, you can check update by this URL.  
https://anti-pattern-inc.github.io/corporate/

# How to deploy to Production

make your pull request to master_aws  
after it's merged, you can see update on production.

# static

## コマンド

### 初回実行

`npm install`

### ビルド

`npx gulp`

### 作業時

`npx gulp watch`

## M1 Mac での動作

node-sass は、Node 16 に対応していない。
https://stackoverflow.com/questions/67241196/error-no-template-named-remove-cv-t-in-namespace-std-did-you-mean-remove

逆に Node 16 は、M1 Mac に対応していない。

そのため、nodebrew や nvm を使って、x86 の Node14 を入れて利用する必要がある。

```
arm64 $ arch -x86_64 /bin/zsh
x86_64 $ nodebrew install v14.17.1
x86_64 $ nodebrew use v14.17.1
x86_64 $ exit
arm64 $
```
