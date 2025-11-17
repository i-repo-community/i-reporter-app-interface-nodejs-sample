/**
 * @fileoverview i-Repo App Interface API モック Express版
 * Express.js を使用したシンプルなREST API実装
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_TOKEN = process.env.API_TOKEN || 'gateway-pass';

/**
 * multerの設定（メモリストレージを使用）
 * 
 * multerの役割:
 * - multipart/form-data形式のリクエストを解析
 * - ファイルデータをreq.files配列に格納
 * - テキストフィールドをreq.bodyに格納
 * 
 * memoryStorage():
 * - ファイルをディスクではなくメモリ（Buffer）に保存
 * - file.bufferとしてアクセス可能
 * 
 * 注意: express.json()やexpress.urlencoded()では
 *       multipart/form-dataを扱えないため、multerが必須
 */
const upload = multer({ storage: multer.memoryStorage() });

// ミドルウェア設定
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 
//役割: リクエストのメソッド、パス、ヘッダー、ボディをログ出力
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    console.log('Headers:', req.headers);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Body:', req.body);
    }
    next();
});

/**
 * 認証ミドルウェア
 * @param {Object} req - Expressリクエストオブジェクト
 * @param {Object} res - Expressレスポンスオブジェクト
 * @param {Function} next - 次のミドルウェアを呼び出す関数
 * @returns {void}
 */
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(200).json({
            result: {
                code: -1,
                description: "認証が必要です"
            }
        });
    }

    const token = authHeader.substring(7);
    if (token !== API_TOKEN) {
        return res.status(200).json({
            result: {
                code: -1,
                description: "無効なトークンです"
            }
        });
    }

    next();
}

// すべてのエンドポイントに認証を適用
app.use(authenticate);

/**
 * 通常の値取得エンドポイント
 * @route GET/POST /api/getValue
 * @param {Object} req.query - クエリパラメータ（GETの場合）
 * @param {Object} req.body - リクエストボディ（POSTの場合）
 * @param {Array} req.files - アップロードされたファイル配列
 * @returns {Object} JSON形式のレスポンス
 * 
 * upload.any()の役割:
 * 1. multipart/form-dataリクエストを自動解析
 * 2. ファイル → req.files配列に格納（メモリ上のBuffer形式）
 * 3. テキストフィールド → req.bodyに格納
 * 
 * これにより以下が可能:
 * - req.files[0].originalname でファイル名取得
 * - req.files[0].buffer でファイルデータ取得
 * - req.body.data でテキストデータ取得
 */
app.all('/api/v1/getValue', upload.any(), (req, res) => {
    const queryParams = req.query;
    const body = req.body;

    console.log('getValue - Method:', req.method);
    console.log('getValue - Query:', queryParams);
    console.log('getValue - Body:', body);

    // ファイル情報の整理
    // multerによって解析されたファイルがreq.filesに格納されている
    // upload.any()により、どのフィールド名のファイルでも受け取り可能
    let uploadedFiles = [];
    if (req.files && req.files.length > 0) {
        uploadedFiles = req.files.map(file => ({
            fieldname: file.fieldname,
            filename: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            sizeKB: (file.size / 1024).toFixed(2) + ' KB',
            buffer: file.buffer // 実際のファイルデータ
        }));
        console.log('Uploaded Files:', uploadedFiles.map(f => ({
            filename: f.filename,
            size: f.sizeKB,
            mimetype: f.mimetype
        })));
    }

    // GETリクエストの場合はクエリパラメータを使用
    if (req.method === 'GET') {
        console.log('GET request - ID:', queryParams.id);
        // クエリパラメータで処理します
    }
    
    // POSTリクエストの場合はbody.dataをパース
    // multerにより、multipart/form-dataのdataフィールドがreq.body.dataに格納されている
    let parsedData = null;
    if (req.method === 'POST' && body && body.data) {
        try {
            parsedData = JSON.parse(body.data);
            console.log('POST request - Parsed data:', JSON.stringify(parsedData, null, 2));
            console.log('User:', parsedData.userName);
            console.log('Clusters:', parsedData.clusters?.map(c => ({
                id: c.clusterId,
                name: c.name,
                value: c.value
            })));
        } catch (e) {
            console.error('Failed to parse data:', e);
        }
    }

    // ファイル保存処理
    // multerが解析したファイルをディスクに保存
    // uniqueSuffixを付けることで同名ファイルの上書きを防止
    if (uploadedFiles.length > 0) {
        const fs = require('fs');
        const path = require('path');
        uploadedFiles.forEach(file => {
            const uploadDir = './uploads';
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const filePath = path.join(uploadDir, uniqueSuffix + '-' + file.filename);

            fs.writeFileSync(filePath, file.buffer);
            console.log('File saved:', filePath);
        });
    }

    // plc_idに基づいて異なるデータを返す
    const plcId = queryParams.plc_id || body.plc_id;
    
    let applyData;
    if (plcId === 'PLCB') {
        // PLCBの場合のデータ
        applyData = [
            {
                item: "sample-humidity",
                sheet: 1,
                cluster: 1,
                type: "string",
                value: "65.8"
            },
            {
                item: "sample-spin",
                sheet: 1,
                cluster: 2,
                type: "string",
                value: "6500"
            },
            {
                item: "sample-input-amount",
                sheet: 1,
                cluster: 3,
                type: "string",
                value: "1500"
            },
            {
                item: "sample-production-quantity",
                sheet: 1,
                cluster: 4,
                type: "string",
                value: "750"
            }
        ];
    } else {
        // PLCAまたは指定なしの場合のデータ（デフォルト）
        applyData = [
            {
                item: "sample-humidity",
                sheet: 1,
                cluster: 1,
                type: "string",
                value: "50.4"
            },
            {
                item: "sample-spin",
                sheet: 1,
                cluster: 2,
                type: "string",
                value: "5000"
            },
            {
                item: "sample-input-amount",
                sheet: 1,
                cluster: 3,
                type: "string",
                value: "1000"
            },
            {
                item: "sample-production-quantity",
                sheet: 1,
                cluster: 4,
                type: "string",
                value: "500"
            }
        ];
    }

    const reponse = {
        result: {
            code: 0,
            description: "データ取得成功"
        },
        apply: applyData
    };
    console.log('Response:', reponse);

    res.json(reponse);
});


app.get('/api/v1/getselect', (req, res) => {


    res.json({
        result: {
            code: 0,
            description: "選択肢設定完了"
        },
        apply: [
            {
                item: "plca-select",
                sheet: 1,
                cluster: 18,
                type: "SetItemsToSelect",
                value: "PLCA",
                selectItems: [
                    {
                        item: "PLCA",
                        label: "設備 PLC-A",
                        selected: true
                    },
                    { 
                        item: "PLCB",
                        label: "設備 PLC-B",
                        selected: false
                    }
                ]
            }
        ]
    });
}

);

/**
 * カスタムマスターのフィールド取得
 * @route GET /api/v1/master/fields
 * @returns {Object} フィールド定義の配列を含むJSONレスポンス
 */
app.get('/api/v1/master/fields', (req, res) => {
    console.log('getFields - Query:', req.query);

    res.json({
        result: {
            code: 0,
            remarks: ["商品フィールド取得成功"]
        },
        fields: [
            {
                no: 1,
                name: "product_id",
                type: "text",
                item: "product_id"
            },
            {
                no: 2,
                name: "product_name",
                type: "text",
                item: "product_name"
            },
            {
                no: 3,
                name: "category",
                type: "text",
                item: "category"
            },
            {
                no: 4,
                name: "price",
                type: "numeric",
                item: "price"
            },
            {
                no: 5,
                name: "stock_quantity",
                type: "numeric",
                item: "stock_quantity"
            },
            {
                no: 6,
                name: "is_active",
                type: "bool",
                item: "is_active"
            },
            {
                no: 7,
                name: "created_date",
                type: "date",
                item: "created_date"
            }
        ]
    });
});

/**
 * カスタムマスターのパラメータ取得
 * @route GET /api/v1/master/params
 * @returns {Object} パラメータ定義の配列を含むJSONレスポンス
 */
app.get('/api/v1/master/params', (req, res) => {
    console.log('getParams - Query:', req.query);

    res.json({
        result: {
            code: 0,
            remarks: ["パラメータ取得成功"]
        },
        params: [
            {
                name: "product_id",
                type: "string"
            }
        ]
    });
});

/**
 * カスタムマスターのレコード取得
 * @route POST /api/v1/master/getrecords
 * @param {Object} req.body.data - JSON文字列（clusters配列を含む）
 * @param {Array} req.body.data.clusters - フィルタ条件の配列
 * @param {string} req.body.data.clusters[].parameter - フィルタするフィールド名
 * @param {string} req.body.data.clusters[].value - フィルタする値
 * @returns {Object} フィルタリングされたレコードを含むJSONレスポンス
 * 
 * @example
 * // リクエストボディ
 * {
 *   data: '{"clusters": [{"parameter": "product_id", "value": "1001"}]}'
 * }
 */
app.post('/api/v1/master/getrecords', upload.any(), (req, res) => {
    console.log('getRecords - Body:', req.body);

    // リクエストボディからパラメータを抽出
    let filters = {};
    
    // req.body.dataがJSON文字列として来る場合はパース
    if (req.body && req.body.data) {
        try {
            const parsedData = JSON.parse(req.body.data);
            // clustersの中から全てのパラメータを抽出
            if (parsedData.clusters && Array.isArray(parsedData.clusters)) {
                parsedData.clusters.forEach(cluster => {
                    if (cluster.parameter && cluster.value) {
                        filters[cluster.parameter] = cluster.value;
                    }
                });
            }
        } catch (e) {
            console.error('Failed to parse data:', e);
        }
    }
    console.log('Extracted filters:', filters);

    // サンプルデータ
    let records = [
        {
            product_id: '1001',
            product_name: '製品A',
            category: '電子部品',
            price: '15000',
            stock_quantity: '150',
            is_active: 'true',
            created_date: '2024/01/15'
        },
        {
            product_id: '1002',
            product_name: '製品B',
            category: '電子部品',
            price: '12000',
            stock_quantity: '80',
            is_active: 'true',
            created_date: '2024/02/10'
        },
        {
            product_id: '1003',
            product_name: '製品C',
            category: '機械部品',
            price: '5000',
            stock_quantity: '300',
            is_active: 'false',
            created_date: '2024/03/05'
        },
        {
            product_id: '1004',
            product_name: '製品D',
            category: 'テストカテゴリ',
            price: '0',
            stock_quantity: '0',
            is_active: 'true',
            created_date: '2025/01/01'
        },
        {
            product_id: '1005',
            product_name: '製品E',
            category: '消耗品',
            price: '200',
            stock_quantity: '5000',
            is_active: 'true',
            created_date: '2024/04/01'
        }
    ];

    // フィルタリング処理（複数条件対応）
    if (Object.keys(filters).length > 0) {
        const originalCount = records.length;
        const filteredRecords = records.filter(record => {
            // 全てのフィルタ条件に一致するレコードのみを返す
            return Object.entries(filters).every(([key, value]) => {
                return record[key] && record[key] === value;
            });
        });
        // 一致するレコードがない場合は全件返す
        if (filteredRecords.length === 0) {
            console.log('No matching records, returning all records');
        } else {
            records = filteredRecords;
            console.log(`Filtered: ${originalCount} -> ${records.length} records`);
        }
    }
    console.log('Final records count:', records.length);

    // カスタムマスター返却形式に整形
    const customMasterRecords = records.map(r => ({
        fields: [
            { no: 1, value: r.product_id },
            { no: 2, value: r.product_name },
            { no: 3, value: r.category },
            { no: 4, value: r.price },
            { no: 5, value: r.stock_quantity },
            { no: 6, value: r.is_active },
            { no: 7, value: r.created_date }
        ]
    }));

    const response = {
        result: {
            code: 0,
            remarks: [
                'レコード取得成功',
                `${records.length}件のレコードを取得`,
                Object.keys(filters).length > 0 ? `フィルタ条件: ${JSON.stringify(filters)}` : '全件取得'
            ]
        },
        fields: [
            { no: 1, name: 'product_id',     type: 'text',    item: 'product_id' },
            { no: 2, name: 'product_name',   type: 'text',    item: 'product_name' },
            { no: 3, name: 'category',       type: 'text',    item: 'category' },
            { no: 4, name: 'price',          type: 'numeric', item: 'price' },
            { no: 5, name: 'stock_quantity', type: 'numeric', item: 'stock_quantity' },
            { no: 6, name: 'is_active',      type: 'bool',    item: 'is_active' },
            { no: 7, name: 'created_date',   type: 'date',    item: 'created_date' }
        ],
        defaultRecord: {
            fields: [
                { no: 1, value: '1001' },
                { no: 2, value: '製品A' },
                { no: 3, value: '電子部品' },
                { no: 4, value: '15000' },
                { no: 5, value: '150' },
                { no: 6, value: 'true' },
                { no: 7, value: '2024/01/15' }
            ]
        },
        records: customMasterRecords
    };

    console.log('Response records count:', response.records.length);
    res.json(response);
});


/**
 * 404エラーハンドラー
 * @param {Object} req - Expressリクエストオブジェクト
 * @param {Object} res - Expressレスポンスオブジェクト
 */
app.use((req, res) => {
    res.status(404).json({
        result: {
            code: -1,
            description: `エンドポイントが見つかりません: ${req.path}`
        }
    });
});

/**
 * エラーハンドラー
 * @param {Error} err - エラーオブジェクト
 * @param {Object} req - Expressリクエストオブジェクト
 * @param {Object} res - Expressレスポンスオブジェクト
 * @param {Function} next - 次のミドルウェアを呼び出す関数
 */
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        result: {
            code: -1,
            description: 'サーバーエラーが発生しました',
            error: err.message
        }
    });
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`i-Reporter App Interface API Mock Server`);
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`API Token: ${API_TOKEN}`);
    console.log('\nAvailable endpoints:');
    console.log('  GET/POST /api/v1/getValue - 通常の値取得');
    console.log('  GET      /api/v1/master/fields - フィールド取得');
    console.log('  GET      /api/v1/master/params - パラメータ取得');
    console.log('  POST     /api/v1/master/getrecords - レコード取得');
});
