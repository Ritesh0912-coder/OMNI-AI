const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, globalShortcut } = require('electron');
const path = require('path');

let mainWindow;
let tray;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        titleBarStyle: 'hidden',
        trafficLightPosition: { x: 15, y: 15 },
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false
        },
        backgroundColor: '#050505'
    });

    const startUrl = process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000/browser'
        : 'https://synapse-ai.com/browser';

    console.log('Loading URL:', startUrl);
    console.log('NODE_ENV:', process.env.NODE_ENV);

    mainWindow.loadURL(startUrl);

    // Open DevTools by default to debug black screen
    mainWindow.webContents.openDevTools();

    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error('Failed to load URL:', errorDescription, '(Code:', errorCode, ')');
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Register Global Shortcuts
    globalShortcut.register('CommandOrControl+T', () => {
        mainWindow.webContents.send('shortcut-new-tab');
    });
}

function createTray() {
    const iconPath = path.join(__dirname, 'icon.png'); // Ensure an icon exists
    const icon = nativeImage.createFromPath(iconPath);
    tray = new Tray(icon.isEmpty() ? nativeImage.createEmpty() : icon);

    const contextMenu = Menu.buildFromTemplate([
        { label: 'Thesys AI Browser', enabled: false },
        { type: 'separator' },
        { label: 'Show App', click: () => { mainWindow.show(); } },
        { label: 'Private Window', click: () => { /* IPC to open private */ } },
        { type: 'separator' },
        { label: 'Quit', click: () => { app.isQuitting = true; app.quit(); } }
    ]);

    tray.setToolTip('Thesys AI Browser');
    tray.setContextMenu(contextMenu);
}

app.whenReady().then(() => {
    createWindow();
    createTray();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});

// IPC listeners for native features
ipcMain.on('toMain', (event, args) => {
    console.log('Received from renderer:', args);
});
