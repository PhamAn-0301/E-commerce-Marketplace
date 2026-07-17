/**
 * start-all.js
 * Khởi chạy MeiliSearch + Sync dữ liệu + Backend server cùng lúc.
 * Chạy: node start-all.js
 *
 * Luồng:
 *  1. Bật MeiliSearch (file bin/meilisearch.exe)
 *  2. Đợi MeiliSearch sẵn sàng (health check)
 *  3. Chạy sync dữ liệu từ PostgreSQL → MeiliSearch
 *  4. Khởi chạy backend server (app.js)
 */

const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

// Đường dẫn tới file meilisearch.exe
const MEILI_BIN = path.join(__dirname, 'bin', 'meilisearch.exe');
const MEILI_HOST = process.env.MEILI_HOST || 'http://localhost:7700';
const MEILI_KEY = process.env.MEILI_API_KEY || 'masterKey';

// Danh sách child process để dọn dẹp khi thoát
const children = [];

function log(tag, message) {
  const time = new Date().toLocaleTimeString('vi-VN');
  console.log(`[${time}] [${tag}] ${message}`);
}

/**
 * Kiểm tra MeiliSearch đã sẵn sàng chưa bằng health endpoint
 */
function checkMeiliHealth() {
  return new Promise((resolve) => {
    const url = new URL('/health', MEILI_HOST);
    http.get(url.href, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          resolve(data.status === 'available');
        } catch {
          resolve(false);
        }
      });
    }).on('error', () => resolve(false));
  });
}

/**
 * Đợi MeiliSearch sẵn sàng, thử tối đa maxAttempts lần
 */
async function waitForMeili(maxAttempts = 30) {
  for (let i = 1; i <= maxAttempts; i++) {
    const ok = await checkMeiliHealth();
    if (ok) {
      log('MeiliSearch', '✔ Đã sẵn sàng!');
      return true;
    }
    if (i % 5 === 0) log('MeiliSearch', `Đang chờ khởi động... (${i}/${maxAttempts})`);
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

/**
 * Chạy script sync và đợi hoàn tất
 */
function runSync() {
  return new Promise((resolve, reject) => {
    log('Sync', 'Đang đồng bộ dữ liệu PostgreSQL → MeiliSearch...');
    const syncProcess = spawn('node', [path.join(__dirname, 'scripts', 'sync.js')], {
      cwd: __dirname,
      stdio: 'inherit',
    });
    syncProcess.on('close', (code) => {
      if (code === 0) {
        log('Sync', '✔ Đồng bộ hoàn tất!');
        resolve();
      } else {
        log('Sync', `⚠ Đồng bộ kết thúc với mã lỗi ${code} (backend vẫn chạy bình thường nhờ fallback)`);
        resolve(); // Không reject vì fallback vẫn hoạt động
      }
    });
    syncProcess.on('error', (err) => {
      log('Sync', `⚠ Lỗi đồng bộ: ${err.message}`);
      resolve(); // Không reject vì fallback vẫn hoạt động
    });
  });
}

/**
 * Dọn dẹp tất cả child process khi thoát
 */
function cleanup() {
  log('System', 'Đang dừng tất cả dịch vụ...');
  for (const child of children) {
    if (!child.killed) {
      child.kill();
    }
  }
}

async function main() {
  // Đăng ký cleanup
  process.on('SIGINT', () => { cleanup(); process.exit(0); });
  process.on('SIGTERM', () => { cleanup(); process.exit(0); });
  process.on('exit', cleanup);

  // --- 1. Khởi chạy MeiliSearch ---
  log('MeiliSearch', `Đang khởi chạy từ ${MEILI_BIN}...`);
  const meiliProcess = spawn(MEILI_BIN, [
    '--master-key', MEILI_KEY,
    '--db-path', path.join(__dirname, 'bin', 'data.ms'),
  ], {
    cwd: __dirname,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  children.push(meiliProcess);

  meiliProcess.stdout.on('data', (data) => {
    const msg = data.toString().trim();
    if (msg) log('MeiliSearch', msg);
  });

  meiliProcess.stderr.on('data', (data) => {
    const msg = data.toString().trim();
    if (msg) log('MeiliSearch', msg);
  });

  meiliProcess.on('error', (err) => {
    log('MeiliSearch', `❌ Không thể khởi chạy: ${err.message}`);
    log('MeiliSearch', 'Backend sẽ chạy với fallback PostgreSQL.');
  });

  meiliProcess.on('close', (code) => {
    if (code !== null && code !== 0) {
      log('MeiliSearch', `Đã dừng với mã ${code}`);
    }
  });

  // --- 2. Đợi MeiliSearch sẵn sàng ---
  const meiliReady = await waitForMeili();

  // --- 3. Sync dữ liệu nếu MeiliSearch sẵn sàng ---
  if (meiliReady) {
    await runSync();
  } else {
    log('MeiliSearch', '⚠ Không thể kết nối. Backend sẽ dùng fallback PostgreSQL.');
  }

  // --- 4. Khởi chạy Backend ---
  log('Backend', 'Đang khởi chạy server...');
  const backendProcess = spawn('node', ['app.js'], {
    cwd: __dirname,
    stdio: 'inherit',
    env: { ...process.env },
  });

  children.push(backendProcess);

  backendProcess.on('close', (code) => {
    log('Backend', `Server đã dừng (mã ${code})`);
    cleanup();
    process.exit(code || 0);
  });

  backendProcess.on('error', (err) => {
    log('Backend', `❌ Lỗi: ${err.message}`);
    cleanup();
    process.exit(1);
  });
}

main().catch((err) => {
  console.error('Lỗi khởi chạy:', err);
  cleanup();
  process.exit(1);
});
