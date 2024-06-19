import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "femi_site",
  password: "Ikeadeas!#",
  port: 5432,
});

const app = express();
const port = 3000;

//Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

db.connect();

async function doneReading() {
  const result = await db.query("select book from done_reading");
  let books = [];
  result.rows.forEach((book) => {
    books.push(book.book);
  });
  return books;
}
async function doMusic() {
  const result = await db.query("select album from do_music");
  let albums = [];
  result.rows.forEach((album) => {
    albums.push(album.album);
  });
  return albums;
}

async function doReading() {
  const result = await db.query("select book from do_reading");
  let books = [];
  result.rows.forEach((book) => {
    books.push(book.book);
  });
  return books;
}

app.get("/", async (req, res) => {
  const done_reading = await doneReading();
  const do_reading = await doReading();
  const do_music = await doMusic();
  res.render("index.ejs", {
    done_reading: done_reading,
    do_reading: do_reading,
    do_music: do_music,
  });
});
// to make a page that is password protected and can delete and add
// one column is doing
// one column is did
// click a button shows a form and a list items
// the delete option for doing reading will add to done reading
// the add option for doing reading and doing music will insert into their respective tables

app.get("/edit", async (req, res) => {
  const done_reading = await doneReading();
  const do_reading = await doReading();
  const do_music = await doMusic();
  res.render("edit.ejs", {
    done_reading: done_reading,
    do_reading: do_reading,
    do_music: do_music,
  });
});


// list the items that can be edited
app.post('/edit', async (req, res) => {
    console.log(req.body);
    switch (req.body.list) {
        case 'do-read':
           var list = await doReading();
            break;
    
        case 'do-music':
             var list= await doMusic();
            break;
        case 'done-reading':
            var list =  await doneReading();
            break;
        default:
            break;
    }
    res.render('edit.ejs', {
        items: list,
    });
});

// add or delete items in the database
app.post('/configure', async (req, res) => {
    console.log(req.body);

    if (req.body.mode === 'add'){
        switch (req.body.set) {
            case 'do-read':
                await db.query(
                    "insert into do_reading (book) values ($1)",
                    [req.body.data]
                )
                break;
            case 'do-music':
                await db.query(
                    "insert into do_music (book) values ($1)",
                    [req.body.data]
                )
                break;
             case 'done-read':
                await db.query(
                    "insert into done_reading (book) values ($1)",
                    [req.body.data]
                )
                break;
        
            default:
                break;
        }
    } else if (req.body.mode === 'delete'){
         switch (req.body.set) {
            case 'do-read':
                try {
                await db.query(
                    "delete from do_reading where book= $1",
                    [req.body.data]
                )
                await db.query(
                    "insert into done_reading (book) values ($1)",
                    [req.body.data]
                )
                } catch (err){
                    console.log(err);
                    res.redirect('/edit');
                }
                break;
            case 'do-music':
                try {
                await db.query(
                    "delete from do_music where album= $1",
                    [req.body.data]
                )
                } catch (err){
                    console.log(err);
                    res.redirect('/edit');
                }
                break;
             case 'done-read':
                try {
                await db.query(
                   "delete from done_reading where book= $1",
                    [req.body.data]
                )
                } catch (err){
                    console.log(err);
                    res.redirect('/edit');
                }
                break;
        
            default:
                break;
        }
    }
    res.redirect('/edit');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
