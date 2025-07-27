# 物品管理システム

## 概要

これは、Djangoフレームワークを使用して構築された物品管理システムです。

## 機能

* 物品の登録、編集、削除
* 物品の一覧表示
* 物品の検索

## ディレクトリ構成

```
.
├── .git
├── backups
├── inventory_system
│   ├── __init__.py
│   ├── asgi.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── items
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── filters.py
│   ├── management
│   ├── migrations
│   ├── models.py
│   ├── serializers.py
│   ├── tests.py
│   ├── urls.py
│   └── views.py
├── static
├── templates
├── venv
├── .DS_Store
├── .gitignore
├── db.sqlite3
├── manage.py
└── 起動方法.txt
```

### 各ディレクトリ・ファイルの役割

*   `inventory_system`: プロジェクト全体の設定ファイル
*   `items`: 物品管理アプリケーションのコアロジック
*   `static`: CSS、JavaScriptなどの静的ファイル
*   `templates`: HTMLテンプレート
*   `venv`: Python仮想環境
*   `db.sqlite3`: データベースファイル
*   `manage.py`: Djangoプロジェクトの管理用スクリプト

## セットアップと起動方法

1.  **リポジトリをクローンします**
    ```bash
    git clone https://github.com/bb-engineer2018/Inventory_Management_django.git
    cd Inventory_Management_django
    ```

2.  **仮想環境を作成して有効化します**
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```
    *Windowsの場合は、`venv\Scripts\activate` を使用します。*

3.  **必要なライブラリをインストールします**
    ```bash
    pip install -r requirements.txt
    ```

4.  **データベースをマイグレートします**
    ```bash
    python manage.py migrate
    ```

5.  **開発サーバーを起動します**
    ```bash
    python manage.py runserver
    ```
    デフォルトでは、サーバーは `http://127.0.0.1:8000/` で起動します。

    別のポートを指定したい場合は、以下のようにします。
    ```bash
    python manage.py runserver 8001
    ```

6.  **ブラウザでアクセスします**
    [http://127.0.0.1:8000/](http://127.0.0.1:8000/) (または指定したポート)

**注意:**

*   サーバーを停止するには、ターミナルで `Ctrl + C` を押します。

