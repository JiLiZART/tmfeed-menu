import fs from 'fs'
import Winston from 'winston'
import NewrelicWinston from 'newrelic-winston'
import path from 'path'

module.exports = function (appDataPath, version) {
  const logDir = path.join(appDataPath, 'Log');
  const versionRewriter = function (level, msg, meta) {
    if (!meta) {
      meta = {}
    }

    meta.version = version;
    return meta
  };

  let env = 'prod';

  try {
    fs.statSync(path.join(__dirname, 'newrelic.js'))
  } catch (err) {
    env = 'dev'
  }

  try {
    fs.mkdirSync(logDir)
  } catch (e) {
    // ignore
  }

  return new Winston.Logger({
    transports: [
      new Winston.transports.Console(),
      new Winston.transports.DailyRotateFile({ filename: path.join(logDir, 'app.log') }),
      new NewrelicWinston({ env: env })
    ],
    rewriters: [ versionRewriter ]
  })
};
