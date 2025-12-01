# Google Custom Search API トラブルシューティング

## 現在の確認事項

エラー率100%の場合、以下の点を確認してください:

### 1. APIキーと検索エンジンIDの確認

#### ブラウザのDevTools Console を開いて確認:
1. F12キーを押してDevToolsを開く
2. Consoleタブを選択
3. メニューを撮影して料理カードを表示
4. 以下のログを探す:
   - `Google Search API Request:` - リクエストURLが表示される
   - `Google Search API HTTP Error:` - エラーの詳細が表示される
   - `Google Search API Response:` - 成功時のレスポンス

### 2. よくあるエラー原因

#### エラーコード 400 (Bad Request)
- **原因**: APIキーまたは検索エンジンIDが間違っている
- **確認**: 
  - GitHub Secretsの値が正しいか
  - 検索エンジンIDに余計な空白やコピーミスがないか

#### エラーコード 403 (Forbidden)
- **原因1**: APIキーに制限がかかっている
  - [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → 「認証情報」→ 作成したAPIキーを選択
  - 「アプリケーションの制限」が「HTTP リファラー」になっている場合:
    - **解決策**: 以下のURLを「ウェブサイトの制限」に追加してください:
      - `http://localhost:5173/*` (ローカル開発用)
      - `https://<your-github-username>.github.io/*` (本番用 - `<your-github-username>`は実際のGitHubユーザー名に置き換えてください)
  - または、開発中は一時的に「制限なし」に設定してください。

- **原因2**: Custom Search APIが有効になっていない
  - [Google Cloud Console](https://console.cloud.google.com/) → 「ライブラリ」
  - "Custom Search API" を検索して有効化

#### エラーコード 429 (Too Many Requests)
- **原因**: 無料枠（1日100クエリ）を超えた
- **対応**: 翌日まで待つか、有料プランに変更

#### TypeError: Failed to fetch / CORS Error
- **原因**: CORS（クロスオリジン制限）
- **説明**: Google Custom Search APIはCORSをサポートしているはずですが、設定によっては問題が発生する場合があります
- **対応**: 
  1. APIキーの制限設定を確認
  2. 検索エンジンの設定を確認

### 3. 検索エンジンの設定確認

[Programmable Search Engine](https://programmablesearchengine.google.com/) にアクセスして:

1. 作成した検索エンジンを選択
2. 「設定」→「基本」タブ
3. 「画像検索」が有効になっているか確認
4. 「検索する対象」が「ウェブ全体を検索」になっているか確認

### 4. デバッグ手順

1. **ローカルで`.env`ファイルを作成してテスト**:
   ```
   VITE_GOOGLE_SEARCH_API_KEY=your_google_key
   VITE_GOOGLE_SEARCH_ENGINE_ID=your_engine_id
   ```

2. **開発サーバーを起動**: `npm run dev`

3. **ブラウザのConsoleを開いて動作確認**

4. **エラーメッセージをキャプチャ**して内容を確認

### 5. API設定の再確認チェックリスト

- [ ] Google Cloud Consoleで「Custom Search API」が有効になっている
- [ ] APIキーが正しく作成されている
- [ ] APIキーの制限が適切に設定されている（HTTP リファラーまたは制限なし）
- [ ] Programmable Search Engineが作成されている
- [ ] 検索エンジンで「画像検索」が有効になっている
- [ ] 検索エンジンIDが正しくコピーされている
- [ ] GitHub Secretsに正しい値が設定されている
- [ ] `.env`ファイル（ローカル用）に正しい値が設定されている

## 推奨される次のステップ

1. まず、ブラウザのConsoleでエラーの詳細を確認してください
2. エラーコードに応じて上記の対応を実施してください
3. それでも解決しない場合は、エラーメッセージの詳細をお知らせください
