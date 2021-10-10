run with

    BOT_TOKEN="" deno --allow-net --allow-env=BOT_TOKEN createInvite.ts

develop with

    ls *.ts | entr -r ENVIRONMENT=development BOT_TOKEN="" deno --allow-net --allow-env=ENVIRONMENT --allow-env=BOT_TOKEN createInvite.ts
