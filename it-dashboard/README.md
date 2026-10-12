Для реальной работы вам нужно, чтобы были запущены 3 процесса (откройте 3 терминала):
- Терминал 1 (БД): json-server --watch server/db.json --port 3000
- Терминал 2 (Angular): ng serve
- Терминал 3 (Poller - НОВОЕ): node poller.js

