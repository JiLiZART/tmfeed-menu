import packager from 'electron-packager';
import pkg from '../package.json';

export default function pack() {
    var opts = {
        dir: '.',
        name: pkg.name,
        overwrite: true,
        icon: 'assets/images/icon.png',
        platform: 'linux',
        arch: 'x64',
        version: pkg.config.electron_version,
        ignore: [
            'src',
            'script',
            'release',
            'node_modules/(babel|standard|csscomb)',
            'node_modules/electron-(packager|prebuild|rebuild)'
        ]
    };

    if (!process.env.CI) {
        opts.sign = 'Developer ID Application: Nikolay Kost'
    }

    packager(opts, function done(err, appPaths) {
        if (err) {
            if (err.message) {
                console.error(err.message)
            } else {
                console.error(err, err.stack)
            }

            process.exit(1)
        }

        if (appPaths.length > 1) {
            console.error('Wrote new apps to:\n' + appPaths.join('\n'))
        } else if (appPaths.length === 1) {
            console.error('Wrote new app to', appPaths[0])
        }
    });
}

