# S3デプロイメント設定ガイド

このドキュメントでは、GitHub ActionsによるS3への自動デプロイに必要な設定手順を説明します。

## 前提条件

- AWSアカウントが作成されていること
- S3バケットが作成されていること
- 適切な権限を持つIAMユーザーが作成されていること

## GitHub Secretsの設定

GitHubリポジトリに以下のSecretsを設定する必要があります。

### 設定手順

1. GitHubリポジトリページに移動
2. **Settings** > **Secrets and variables** > **Actions** を開く
3. **New repository secret** をクリック
4. 以下の各Secretを順番に追加

### 必要なSecrets一覧

#### 1. AWS_ACCESS_KEY_ID

**説明**: AWSアクセスキーID

**取得方法**:
1. AWSコンソールにログイン
2. IAM > ユーザー > 対象のユーザーを選択
3. 「セキュリティ認証情報」タブを開く
4. 「アクセスキーを作成」をクリック
5. 表示されたアクセスキーIDをコピー

**形式例**: `AKIAIOSFODNN7EXAMPLE`

---

#### 2. AWS_SECRET_ACCESS_KEY

**説明**: AWSシークレットアクセスキー

**取得方法**:
- アクセスキー作成時に一度だけ表示されます
- 必ず安全な場所に保存してください
- 紛失した場合は新しいアクセスキーを作成する必要があります

**形式例**: `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`

**注意**: このキーは絶対に公開しないでください

---

#### 3. AWS_REGION

**説明**: S3バケットが存在するAWSリージョン

**値の例**:
- 東京リージョン: `ap-northeast-1`
- バージニア北部: `us-east-1`
- オレゴン: `us-west-2`
- シンガポール: `ap-southeast-1`

**設定値**: 使用するリージョンコードを入力

---

#### 4. S3_BUCKET_NAME

**説明**: デプロイ先のS3バケット名

**形式**: バケット名のみ（URLではありません）

**正しい例**: `my-gradwork-frontend`

**誤った例**:
- ❌ `https://my-gradwork-frontend.s3.amazonaws.com`
- ❌ `s3://my-gradwork-frontend`

---

## S3バケットの設定

### 1. 静的ウェブサイトホスティングの有効化

1. S3バケットを開く
2. 「プロパティ」タブを選択
3. 「静的ウェブサイトホスティング」を編集
4. 以下を設定:
   - 静的ウェブサイトホスティング: **有効化**
   - インデックスドキュメント: `index.html`
   - エラードキュメント: `index.html` （React Routerのため必須）
5. 変更を保存

### 2. パブリックアクセス設定

1. 「アクセス許可」タブを選択
2. 「パブリックアクセスをすべてブロック」を編集
3. すべてのチェックを**オフ**にする
4. 変更を保存

### 3. バケットポリシーの設定

1. 「アクセス許可」タブの「バケットポリシー」を編集
2. 以下のJSONを貼り付け（バケット名を書き換える）:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::あなたのバケット名/*"
    }
  ]
}
```

3. `あなたのバケット名` を実際のバケット名に置き換える
4. 変更を保存

---

## IAMユーザーの権限設定

GitHub Actionsで使用するIAMユーザーには以下の権限が必要です。

### 必要なポリシー

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::あなたのバケット名/*",
        "arn:aws:s3:::あなたのバケット名"
      ]
    }
  ]
}
```

### ポリシーのアタッチ方法

1. IAMコンソールを開く
2. ユーザー > 対象のユーザーを選択
3. 「許可」タブで「許可を追加」をクリック
4. 「ポリシーを直接アタッチする」を選択
5. 「ポリシーの作成」をクリック
6. JSONタブで上記のポリシーを貼り付け
7. ポリシー名を入力（例: `GradWorkS3DeployPolicy`）
8. ポリシーを作成してユーザーにアタッチ

---

## デプロイの動作確認

すべての設定が完了したら、以下の手順でデプロイをテストします。

### 1. ローカルでの確認

```bash
# ビルドが正常に完了することを確認
npm run build

# 型チェックが通ることを確認
npx tsc --noEmit
```

### 2. デプロイの実行

```bash
# mainブランチにpush
git add .
git commit -m "test: デプロイテスト"
git push origin main
```

### 3. GitHub Actionsの確認

1. GitHubリポジトリページを開く
2. **Actions** タブをクリック
3. 「Deploy to S3」ワークフローが実行されていることを確認
4. ワークフローをクリックして詳細ログを確認

### 4. デプロイ結果の確認

1. S3バケットの「プロパティ」タブを開く
2. 「静的ウェブサイトホスティング」のエンドポイントURLをコピー
3. ブラウザでURLにアクセスしてアプリが正常に表示されることを確認

---

## トラブルシューティング

### ワークフローが失敗する場合

#### 認証エラー（403 Forbidden）
- AWS_ACCESS_KEY_IDとAWS_SECRET_ACCESS_KEYが正しいか確認
- IAMユーザーに適切な権限が付与されているか確認

#### バケットが見つからない（404 Not Found）
- S3_BUCKET_NAMEが正しいか確認
- AWS_REGIONが正しいか確認

#### ビルドエラー
- ローカルで`npm run build`が成功するか確認
- 型エラーがないか`npx tsc --noEmit`で確認

### ページが表示されない場合

#### 403エラーが表示される
- バケットポリシーが正しく設定されているか確認
- パブリックアクセスがブロックされていないか確認

#### 404エラーが表示される
- 静的ウェブサイトホスティングが有効になっているか確認
- エラードキュメントが`index.html`に設定されているか確認

#### ページは表示されるが画像が読み込まれない
- バケットポリシーのResourceに`/*`が含まれているか確認

---

## キャッシュ戦略

このデプロイワークフローでは、以下のキャッシュ戦略を採用しています。

| ファイル種類 | キャッシュ期間 | 理由 |
|------------|--------------|------|
| JSファイル（assets/*.js） | 1年間（immutable） | ファイル名にハッシュが含まれるため |
| CSSファイル（assets/*.css） | 1年間（immutable） | ファイル名にハッシュが含まれるため |
| index.html | キャッシュなし | 常に最新のファイルを取得するため |
| 画像ファイル（*.png, *.svg） | 1日間 | 適度なキャッシュで表示速度を向上 |

この設定により、アプリケーションの更新が即座に反映されつつ、パフォーマンスも最適化されます。

---

## セキュリティのベストプラクティス

1. **アクセスキーの管理**
   - アクセスキーは絶対にコードに含めない
   - GitHub Secretsで安全に管理する
   - 定期的にローテーションする

2. **IAM権限の最小化**
   - 必要最小限の権限のみを付与
   - 特定のS3バケットへのアクセスのみを許可

3. **バケットポリシーの確認**
   - 読み取り専用アクセスのみを公開
   - 書き込み権限は認証されたユーザーのみ

4. **定期的な監査**
   - CloudTrailでアクセスログを確認
   - 不審なアクセスがないかチェック

---

## 参考リンク

- [AWS S3静的ウェブサイトホスティング](https://docs.aws.amazon.com/ja_jp/AmazonS3/latest/userguide/WebsiteHosting.html)
- [GitHub Actions Secrets](https://docs.github.com/ja/actions/security-guides/encrypted-secrets)
- [AWS IAMベストプラクティス](https://docs.aws.amazon.com/ja_jp/IAM/latest/UserGuide/best-practices.html)
