const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', async (req, res) => {
  const targetUrl = req.query.url;

  if (!targetUrl) {
    return res.send('使い方: URLの末尾に ?url=https://example.com を付けてアクセスしてください');
  }

  try {
    // ブラウザからのアクセスに見せるためのヘッダー設定
    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // JS, CSS, 画像のURLを抽出
    const scripts = [];
    $('script[src]').each((_, el) => scripts.push($(el).attr('src')));

    const styles = [];
    $('link[rel="stylesheet"]').each((_, el) => styles.push($(el).attr('href')));

    const images = [];
    $('img[src]').each((_, el) => images.push($(el).attr('src')));

    // 結果をJSONで返す
    res.json({
      targetUrl,
      status: response.status,
      assets: {
        js: scripts,
        css: styles,
        png_and_images: images
      },
      htmlSource: html
    });
  } catch (error) {
    res.status(500).json({ error: '取得に失敗しました', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
