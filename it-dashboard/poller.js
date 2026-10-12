const ping = require('ping');
const net = require('net');
const axios = require('axios');

const DB_URL = 'http://localhost:3000/network_devices';
const SETTINGS_URL = 'http://localhost:3000/network_settings/config';

function checkTcpPort(host, port, timeout = 2000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let status = 'offline';
    socket.setTimeout(timeout);
    socket.on('connect', () => { status = 'online'; socket.destroy(); });
    socket.on('timeout', () => { socket.destroy(); });
    socket.on('error', () => { socket.destroy(); });
    socket.on('close', () => { resolve(status); });
    socket.connect(port, host);
  });
}

async function checkHttp(url) {
  try {
    const target = url.startsWith('http') ? url : `http://${url}`;
    const res = await axios.get(target, { timeout: 2000 });
    return res.status >= 200 && res.status < 400 ? 'online' : 'offline';
  } catch (error) {
    return 'offline';
  }
}

// Опрос устройств
async function pollDevices() {
  try {
    const { data: devices } = await axios.get(DB_URL);
    if (!devices || devices.length === 0) return;

    console.log(`\n[${new Date().toLocaleTimeString()}] Опрос ${devices.length} устройств...`);

    for (const dev of devices) {
      const target = (dev.ip || '').trim();

      if (!target) {
        console.log(`🟡 [${dev.name}] IP адрес не указан. Статус: warning (Не настроен)`);
        if (dev.status !== 'warning') {
          await axios.patch(`${DB_URL}/${dev.id}`, { status: 'warning' });
        }
        continue;
      }

      let currentStatus = 'offline';

      try {
        switch (dev.pollingMethod) {
          case 'ICMP_PING':
            const res = await ping.promise.probe(target, { timeout: 2 });
            currentStatus = res.alive ? 'online' : 'offline';
            break;

          case 'TCP_PORT':
            const [host, port] = target.split(':');
            if (host && port) {
              currentStatus = await checkTcpPort(host, parseInt(port));
            }
            break;

          case 'HTTP_API':
            currentStatus = await checkHttp(target);
            break;

          case 'SNMP':
            const snmpRes = await ping.promise.probe(target, { timeout: 2 });
            currentStatus = snmpRes.alive ? 'online' : 'offline';
            break;
        }
      } catch (err) {
        currentStatus = 'offline';
      }

      if (dev.status !== currentStatus) {
        console.log(`🔄 Статус изменился: [${dev.name}] ${dev.status} -> ${currentStatus}`);
        await axios.patch(`${DB_URL}/${dev.id}`, { status: currentStatus });
      } else {
        console.log(`✅ [${dev.name}] (${target}) - ${currentStatus}`);
      }
    }
  } catch (error) {
    console.error('❌ Ошибка связи с БД:', error.message);
  }
}

// ПЕРЕМЕННЫЕ УПРАВЛЕНИЯ ТАЙМЕРОМ
let lastPollTime = 0;
let lastHandledForcePoll = 0;
let currentIntervalMs = 5000;
let isBusy = false;

// Быстрый управляющий цикл (проверяет сигналы каждую 1 секунду)
async function controlLoop() {
  if (isBusy) return;

  try {
    const { data: config } = await axios.get(SETTINGS_URL);

    if (config) {
      if (config.pollIntervalMs) {
        currentIntervalMs = config.pollIntervalMs;
      }

      const now = Date.now();
      const isForceTriggered = config.forcePoll && config.forcePoll > lastHandledForcePoll;
      const isTimeDue = (now - lastPollTime) >= currentIntervalMs;

      // Если нажата кнопка "Обновить" ИЛИ пришло время по таймеру:
      if (isForceTriggered || isTimeDue) {
        isBusy = true;

        if (isForceTriggered) {
          console.log(`\n⚡ [${new Date().toLocaleTimeString()}] Мгновенный запуск (сигнал из браузера)!`);
          lastHandledForcePoll = config.forcePoll;
        }

        lastPollTime = Date.now();
        await pollDevices();

        const sec = Math.round(currentIntervalMs / 1000);
        console.log(`⏱️ Следующий плановый опрос через ${sec >= 60 ? (sec / 60) + ' мин.' : sec + ' сек.'}`);

        isBusy = false;
      }
    }
  } catch (e) {
    // Если БД временно недоступна, ждем
  }
}

console.log('🚀 NMS Poller Service запущен (с мгновенной реакцией на кнопку обновить)...');
setInterval(controlLoop, 1000); // Проверяем флаги каждую секунду