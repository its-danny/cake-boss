import csv from 'csvtojson';
import { createConnection } from 'typeorm';
import Server from './src/entity/server';
import Member from './src/entity/member';

if (process.argv.length < 3) {
  console.log(`Missing file: npm run import <path-to-csv-file>`);
}

const file = process.argv[2];

createConnection().then(() => {
  csv()
    .fromFile(file)
    .then(async rows => {
      // eslint-disable-next-line no-restricted-syntax
      for (const row of rows) {
        // eslint-disable-next-line no-await-in-loop
        const server = await Server.findOrCreate(row['Server ID']);
        // eslint-disable-next-line no-await-in-loop
        const member = await Member.findOrCreate(server.discordId, row['User ID'], row['Member ID']);

        member.balance = parseInt(row.Balance, 10);
        member.earned = parseInt(row.Earned, 10);
        member.given = parseInt(row.Given, 10);

        // eslint-disable-next-line no-await-in-loop
        await member.save();
      }
    });

  console.log('Done!');
});
