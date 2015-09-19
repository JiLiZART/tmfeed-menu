import Menubar from 'menubar'
import Shell from 'shell'
import Server from 'electron-rpc/server'
import path from 'path'
import _ from 'lodash'
import { AutoUpdateManager, StoryManager, TrayManager } from './server'
import { ReadCache , StoryType } from './model'
import Logger from './logger'

var server = new Server();

var opts = {
    dir: __dirname,
    icon: path.join(__dirname, '..', 'assets', 'images', 'icon.png'),
    iconNew: path.join(__dirname, '..', 'assets', 'images', 'icon-new.png'),
    preloadWindow: true
};

var menubar = Menubar(opts);
var appDataPath = path.join(menubar.app.getPath('appData'), menubar.app.getName());
var logger = Logger(appDataPath, menubar.app.getVersion());
var readCache = new ReadCache(appDataPath, 500, logger);

menubar.on('after-create-window', function () {
    server.configure(menubar.window.webContents);
    readCache.load();

    menubar.window.webContents.on('new-window', function (e, url, frameName, disposition) {
        e.preventDefault();
        Shell.openExternal(url);
    });

    menubar.window.on('closed', function () {
        menubar.window = null;
        readCache.store();
    })
});

menubar.on('ready', function () {
    menubar.tray.setToolTip('Show TM Feed');

    var autoUpdateManager = new AutoUpdateManager(menubar.app.getVersion(), logger);
    var trayManager = new TrayManager(menubar.window, menubar.tray, opts.icon, opts.iconNew);
    var storyManager = new StoryManager(20, readCache);

    autoUpdateManager.on('update-available', function (releaseVersion) {
        server.send('update-available', releaseVersion)
    });

    storyManager.on('new-story', function () {
        trayManager.notifyNewStories()
    });

    storyManager.on('story-manager-status', function (status) {
        logger.info('story-manager-status', status)
    });

    StoryType.ALL.forEach((type) => {
        server.on(type, (req, next) => {
            storyManager.fetch(type, function(err, items) {
                if (err) {
                    logger.error('story-manager-fetch-error', {message: err.message, stack: err.stack});
                    return next(err)
                }

                var body = {};
                body[type] = items;

                next(null, body);
            })
        });

        //storyManager.watch(type, function (err, stories) {
        //    if (err) {
        //        logger.error('story-manager-watch-error', {message: err.message, stack: err.stack});
        //        return
        //    }
        //
        //    var body = {};
        //    body[type] = stories;
        //
        //    server.send(type, body);
        //})
    });

    server.on('current-version', (req, next) => {
        next(null, menubar.app.getVersion());
    });

    server.on('terminate', (e) => {
        server.destroy();

        if (autoUpdateManager.isUpdateAvailable()) {
            autoUpdateManager.quitAndInstall()
        } else {
            menubar.app.terminate();
        }
    });

    server.on('open-url', (req) => {
        var url = _.trim(req.body.url, '#');
        Shell.openExternal(url);
    });

    server.on('mark-as-read', (req, next) => {
        readCache.set(req.body.id);
        next();
    });
});

process.on('uncaughtException', function (error) {
    if (error) {
        logger.error('uncaughtException', {message: error.message, stack: error.stack})
    }
});