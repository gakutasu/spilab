# 開発の進め方

## 流れ

1. Issue を立てる（テンプレートあり）
2. ブランチを切る：`feat/<内容>`、`fix/<内容>`、`questions/<分野>`
3. 変更して `npm test` と `npm run typecheck` を通す
4. PR を作る（本文に `Closes #<Issue番号>`）。CI が自動で走る
5. 内容を確認して **Squash and merge**
6. `main` に入ると GitHub Actions が自動で GitHub Pages に配信する（2〜3 分）

## リリースとタグ

配信はタグと無関係に `main` 更新で行われる。タグは「この時点が vX.Y.Z」という目印と変更履歴のために付ける。

```bash
gh release create v1.1.0 --generate-notes --title "v1.1.0"
```

- `vX.Y.Z+1`：バグ修正・誤字・解説の改善
- `vX.Y+1.0`：機能追加・問題の追加
- `vX+1.0.0`：学習履歴データの互換性が切れる変更

タグを打つときは `package.json` の `version` も合わせる。

## 問題データのルール

- 問題 ID は公開後に変更しない（学習履歴と紐づいている）
- 追加した問題は、解説を見ずに解き直して正解が一致することを確認する
- 下書きは `npm run generate -- --topic <分野> --count <n>` で作れる（docs/setup.md 参照）
