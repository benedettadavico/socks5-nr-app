const { app, BrowserWindow, ipcMain } = require('electron');
const WebSocket = require('ws');
const { SocksProxyAgent } = require('socks-proxy-agent');
const axios = require('axios');
const net = require('net');

function createWindow() {
  // check if socks5 is running before attempting to open the app 
  const isSocksProxyReachable = () => {
    return new Promise((resolve) => {
      const testSocket = new net.Socket();
      testSocket.setTimeout(1000);

      testSocket.on('error', () => {
        resolve(false);
      });

      testSocket.on('connect', () => {
        testSocket.end();
        resolve(true);
      });

      testSocket.connect(1080, '127.0.0.1');
    });
  };

  // depending on the result above, either create a new window and launch the app, or show an error message
  isSocksProxyReachable()
    .then((isReachable) => {
      if (!isReachable) {
        console.error('SOCKS proxy is not reachable');
        const { dialog } = require('electron');
        dialog.showErrorBox('SOCKS proxy error', 'Could not connect to the SOCKS proxy at 127.0.0.1:1080');
        return;
      }

      const agent = new SocksProxyAgent(`socks5://127.0.0.1:1080`);
      const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
        },
      });
      win.webContents.openDevTools();
      win.loadFile('index.html');

      const wsServer = new WebSocket.Server({ noServer: true });
      wsServer.on('connection', (ws) => {
        console.log('WebSocket connection established');

        ws.send('Hi client, how you doin? ');

        ws.on('message', (message) => {
          console.log(`Received message from client: ${message}`);
        });
      });

      const server = require('http').createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('WebSocket server running');
      });

      // upgrade HTTP server to WebSocket server
      server.on('upgrade', (request, socket, head) => {
        wsServer.handleUpgrade(request, socket, head, (ws) => {
          wsServer.emit('connection', ws, request);
        });
      });

      // setup ws server on port 8080
      server.listen(8080, () => {
        console.log('WebSocket server is running on port 8080');
      });

      // create ws connection to the server (connection from ports 8080 and 1080)
      const ws = new WebSocket('ws://127.0.0.1:8080', { agent });

      ws.on('open', () => {
        console.log('WebSocket connection opened on: ', ws.url);
        ws.send('Hi server, I need some breakfast..');
      });

      ws.on('message', (message) => {
        console.log(`Received message from server: ${message}`);
      });

      // make a request to a random facts endpoint 
      ipcMain.on('fetch-data', async (event) => {
        try {
          const response = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en', {
            httpsAgent: agent,
          });
          event.reply('fetch-data-response', response.data);
        } catch (error) {
          event.reply('fetch-data-response', { error: error.message });
        }
      });
    });
  }
  app.whenReady().then(createWindow);

