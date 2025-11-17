# i-Reporter App Interface

i-Reporter App Interfaceを活用したNode.jsのサンプルです。
クラスターの値設定やファイルアップロード機能とカスタムマスター機能を提供します。

## 機能

- **認証機能**: Bearer Tokenによる認証
- **ファイルアップロード**: 画像などのファイルをアップロード
- **カスタムマスターAPI**: 商品マスターなどのCRUD操作

## エンドポイント

- `GET/POST /api/v1/getValue` - データ取得・ファイルアップロード
- `GET /api/v1/master/fields` - フィールド定義取得
- `GET /api/v1/master/params` - パラメータ定義取得
- `GET /api/v1/getselect`     - 選択肢取得
- `POST /api/v1/master/getrecords` - レコード検索・取得

## 🚀 Azureへのデプロイ

### 方法1: デプロイボタンを使用（推奨）

[![Deploy to Azure](https://aka.ms/deploytoazurebutton)](https://portal.azure.com/#create/Microsoft.AppService/WebAppFromGitHub/repo/https%3A%2F%2Fgithub.com%2Fi-repo-community%2Fi-reporter-app-interface-sample.git)

### 方法2: Azure Portalから手動でデプロイ

1. [Azure Portal](https://portal.azure.com)にログイン
2. 「App Services」→「作成」をクリック
3. 「デプロイ」タブで「GitHub」を選択
4. リポジトリ: `i-repo-community/i-reporter-app-interface-sample` を選択
5. ブランチ: `main` を選択
6. その他の設定を完了してデプロイを開始

### デプロイ時の設定

- **リポジトリ**: `https://github.com/i-repo-community/i-reporter-app-interface-sample.git`（自動入力されます）
- **ブランチ**: `main` を選択
- **ランタイムスタック**: Node.js を選択
- **環境変数**: 以下の環境変数を設定してください：
  - `API_TOKEN`: 認証用トークン（例: `gateway-pass`）
  - `PORT`: ポート番号（通常は自動設定されます）

**注意**: デプロイ前に、Azure PortalでGitHubアカウントへのアクセス権限を付与する必要があります。

## ローカル開発



2. 依存関係をインストール:
```bash
npm install
```

3. 環境変数を設定:
```bash
cp .env.example .env
```

`.env`ファイルを編集して、必要な環境変数を設定してください：
```env
API_TOKEN=gateway-pass
PORT=3000
```

4. サーバーを起動:
```bash
npm start
```

サーバーは `http://localhost:3000` で起動します。


## ngrokでの開発

ローカルサーバーを一時的に外部に公開する場合は、ngrokが便利です。

```bash
ngrok http 3000
```

(`/index.js`): ローカルの`uploads/`フォルダにファイルを保存

## 🤝 コントリビューション

プルリクエストや Issue の報告を歓迎します！

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## ⚠️ 免責事項

このツールは**コミュニティ有志によるオープンソースソフトウェア**です。

利用により生じたいかなる損害についても、開発者・コミュニティは一切の責任を負いません。自己責任でご利用ください。

## 📝 ライセンス

このプロジェクトは [MIT License](LICENSE) の下で公開されています。
