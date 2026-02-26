const { WebSocketServer } = require('ws');
const jwt = require('jsonwebtoken');

let wss = null;

// 所有连接的客户端，key 是 userId，value 是 Set<WebSocket>
const clients = new Map();

function initWebSocket(server) {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {
    // 从 URL 参数里取 token，例如 ws://localhost:3001/ws?token=xxx
    const url = new URL(req.url, 'http://localhost');
    const token = url.searchParams.get('token');

    let userId = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch {
        // token 无效，作为匿名连接
      }
    }

    // 记录连接
    if (userId) {
      if (!clients.has(userId)) clients.set(userId, new Set());
      clients.get(userId).add(ws);
    }

    ws.on('close', () => {
      if (userId && clients.has(userId)) {
        clients.get(userId).delete(ws);
        if (clients.get(userId).size === 0) clients.delete(userId);
      }
    });

    ws.on('error', () => {});

    // 发送连接成功消息
    ws.send(JSON.stringify({ type: 'connected', message: 'WebSocket 连接成功' }));
  });

  console.log('WebSocket 服务已启动，路径：/ws');
  return wss;
}

/**
 * 通知特定用户酒店状态已变化
 * @param {number} merchantId 商户ID
 * @param {object} payload 通知内容
 */
function notifyMerchant(merchantId, payload) {
  const conns = clients.get(merchantId);
  if (!conns || conns.size === 0) return;

  const msg = JSON.stringify({ type: 'hotel_status_changed', ...payload });
  conns.forEach(ws => {
    if (ws.readyState === 1) ws.send(msg); // 1 = OPEN
  });
}

/**
 * 通知所有管理员有新的待审核酒店
 */
function notifyAdmins(payload) {
  const msg = JSON.stringify({ type: 'new_hotel_pending', ...payload });
  clients.forEach((conns) => {
    conns.forEach(ws => {
      if (ws.readyState === 1) ws.send(msg);
    });
  });
}

module.exports = { initWebSocket, notifyMerchant, notifyAdmins };
