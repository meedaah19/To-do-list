import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
db.connect();


let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];

async function getitems() {

  try{
    const result = await db.query('SELECT * FROM items ORDER BY id ASC');
    items = result.rows;
    return items;

  }catch(err){
    console.log(err);
  }
}

app.get("/", async(req, res) => {
  const lists = await getitems();
  console.log(lists)
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: lists,
  });
});

app.post("/add", async(req, res) => {
  const item = req.body.newItem;
  try{
     await db.query('INSERT INTO items (title) VALUES ($1);',
      [item]
    );
    res.redirect("/");
  }catch(err){
    console.log(err)
  }
});

app.post("/edit", async(req, res) => {
  const editedItem = req.body.updatedItemTitle;
  const updatedItemId = req.body.updatedItemId;
  try{
    await db.query('UPDATE items SET title = ($1) WHERE id = ($2);',
       [editedItem, updatedItemId]
      );
      res.redirect("/");
  }catch(err){
    console.log(err);
  }

  
});

app.post("/delete", async(req, res) => {
  const id = req.body.deleteItemId
  try{
    await db.query('DELETE FROM items WHERE id = ($1);', [id])
    res.redirect('/');
  }catch(err){
      console.log(err);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
