
const fs = require("fs");
const path = require("path");
const mongodb = require("mongodb");
const express = require("express");

const MongoClient = mongodb.MongoClient;

const uri = "mongodb+srv://markguti97:markguti977@cluster0.wmnc7.mongodb.net/Prooktatas?retryWrites=true&w=majority";

function dbAction(dbName, collectionName, handler){

    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    client.connect( err => {

        const dbo = client.db(dbName);
        const collection = dbo.collection(collectionName);

        handler(client, dbo, collection);

    });

}

const app = express();

app.use( express.static(__dirname + "/public") );

app.get( '/', (req, res) => {

    var indexPath = path.join(__dirname, 'public', 'index.html');

    fs.readFile(indexPath, (err, file) => {

        res.write(file);
        res.end();
    });
} );

app.get('/products', (req, res) => {

    dbAction("Prooktatas", "barkacs", (cli, db, coll) =>{
        coll.find().toArray( (err, resp) => {
            console.log(resp);
            res.json(resp);
            cli.close();
        });
    } );

});

app.use( express.json() );

app.post("/newproduct", (req, res) => {

    var newProduct = req.body;

    newProduct.img = 'img/noimage.jpg';
    newProduct._id = new Date().getTime() + "-" + Math.floor(Math.random() * 10000000);
    newProduct.id = newProduct._id;

    dbAction("Prooktatas", "barkacs", (cli, db, coll) =>{
        
        coll.insertOne(newProduct, (err, resp) => {

            res.json({message: "Inserted OK"});
        })

    } );

});

app.post('/editproduct', (req, res) => {

    dbAction("Prooktatas", "barkacs", (cli, db, coll) =>{
        
        coll.updateOne({_id: req.body.id}, {$set: req.body }, (err, resp) => {
            res.json({message: "Updted ok", id: req.body.id});
            cli.close();
        });

    } );

});

app.delete("/:id", (req, res) => {

    dbAction("Prooktatas", "barkacs", (cli, db, coll) =>{
        
        coll.deleteOne({_id: req.params.id}, (err, resp)=>{
            if ( !resp.deletedCount )
                res.json({message: "Nincs ilyen elem ezzel a kulccsal: "+req.params.id});
            else res.json({message: "Sikeres torles", deleted: "OK"});

            cli.close();
        });

    } );
});

app.listen("3000");