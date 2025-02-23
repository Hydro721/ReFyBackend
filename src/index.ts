import { run, HandlerContext } from "@xmtp/message-kit";
import { send } from "n8n/dist/src/ResponseHelper";
import sqlite3 from 'sqlite3';
import * as sqlite from 'sqlite';

const stopWords = ["stop", "unsubscribe", "cancel", "unlist"];
const db = await sqlite.open({ filename: './mydatabase.db', driver: sqlite3.Database });


let sql = "CREATE TABLE IF NOT EXISTS users (address TEXT PRIMARY KEY)";
await db.run(sql);

let sql2 = "CREATE TABLE IF NOT EXISTS promotions (sno INTEGER, item TEXT, points INTEGER)";
await db.run(sql2);

run(async (context: HandlerContext) => {
  // Get the message and the address from the sender
  const {
    message: {
      typeId,
      content: { content: text, command, params },
      sender,
    },
  } = context;

  if (typeId !== "text") return;

  const lowerContent = text?.toLowerCase();
  if (stopWords.some((word) => lowerContent.includes(word))) {
  }

  console.log("Hey");
  console.log(sender.address);
  const query = 'SELECT * FROM users where address = ?';
  const row = await db.get(query, [sender.address]);  // Use db.get to retrieve a single row

  if (row) {
    console.log(row); 

    if(text === "1") {
      await context.send(`https://www.stack.so/leaderboard/leaderboard-40a3-78225-5462`);
    }
    else if(text === "2") {
      const query = 'DELETE FROM users WHERE address = ?';
      await db.run(query, [sender.address]); // Execute the query
      await context.send(`You have been unsubscribed`);
    }
    else {
      await context.send("Welcome subscriber! Here are the available Promotion challenges for October 2024");
      const query = 'select * from promotions';
      const rows = await db.all(query);  // Execute the query
      let promotionsMessage = "";
      rows.forEach(row => {
        console.log(`${row.sno} ) Buy ${row.item} to get: ${row.points} points`);
        promotionsMessage += `${row.sno} ) Buy ${row.item} to get: ${row.points} points\n`;
      });
      await context.send(promotionsMessage);
      await context.send("Choose an option:\n1. See my rank on leaderBoard  \n2. Unsubscribe");
    }
  } else {
      if(text === "1") {
        await context.send("We are the Chipotle rewards bot where you can earn points on every purchase. These points can be redeemed for discounts and cashback.");
        await context.send("To enroll for reward points reply back with 2! Thanks");
      }
      else if(text ===  "2") {
        const query = 'INSERT INTO users (address) VALUES (?)';
        await db.run(query, [sender.address]);  // Execute the query
        await context.send("Thanks for subscribing! You can win upto 1000$ in cashback. Say yes to enter October 2024 promo challenge");
      }
      else {
        let message = "Welcome to Chipotle rewards! Please Choose an option:\n 1. Infomation \n2. Subscribe";
        await context.send(message);
      }
  }
});