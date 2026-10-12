Для реальной работы вам нужно, чтобы были запущены 3 процесса (откройте 3 терминала):
- Терминал 1 (БД): json-server --watch server/db.json --port 3000
- Терминал 2 (Angular): ng serve
- Терминал 3 (Poller - НОВОЕ): node poller.js

node -e "const fs = require('fs'); const p = 'C:/Users/Admin/AppData/Roaming/npm/node_modules/json-server/node_modules/milliparsec/dist/index.js'; fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replace(/102400/g, '52428800')); console.log('Лимит успешно увеличен до 50 МБ!');"