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
