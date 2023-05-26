const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Madness of Superfinity is Coming....");
});

// MongoDB Connection URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.poiwoh3.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const toyCollection = client
      .db("superfinityDB")
      .collection("toyCollection");

      // Create Toy
    app.post("/toy", async (req, res) => {
      const newToy = req.body;
      const result = await toyCollection.insertOne(newToy);
      res.send(result);
    });

    // Get All Toy (But Limit = 20)
    app.get("/toy", async (req, res) => {
      const result = await toyCollection.find().limit(20).toArray();
      res.send(result);
    });


    // Get A Toy (by Id)
    app.get("/toy/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: new ObjectId(id) };

      const result = await toyCollection.findOne(query);
      res.send(result);
    });

    // Email Specific toys
    app.get("/my_toy", async (req, res) => {
      const email = req.query.email;
      const query = { sellerEmail: email };
      const result = await toyCollection.find(query).toArray();
      res.send(result);
    });

    // Update Toys
    app.patch("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const newToy = req.body;
      const filter = { _id: new ObjectId(id) };

      const updatedToy = {
        $set: {
          toyName : newToy.newName,
          price : newToy.newPrice,
          quantity: newToy.newQuantity,
          rating: newToy.newRating,
          photo: newToy.newPhoto,
          categories: newToy.newCategories,
          description: newToy.newDescription,
          sellerName: newToy.sellerName,
          sellerEmail: newToy.sellerEmail,
        },
      };

      const result = await toyCollection.updateOne(filter, updatedToy);
      res.send(result);
    });

    // Delete
    app.delete('/toy/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}

      const result = await toyCollection.deleteOne(query);
      res.send(result);
    })

    // Sorting Low to High & High to Low
    app.get('/sortedToy', async(req, res) => {
      const query = req.query;
      const email = req.query.email;
      const filter = { sellerEmail: email };
      if(query.sort === 'lowtohigh'){
        const result = await toyCollection.find(filter).sort({price: 1}).toArray();
        res.send(result);
      }
      if(query.sort === 'hightolow'){
        const result = await toyCollection.find(filter).sort({price: -1}).toArray();
        res.send(result);
      }
    })

    // If categories is avengers it returns only that categories data
    app.get('/categories', async(req, res) => {
      const query = decodeURIComponent(req.query.category);
      const result = await toyCollection.find({ categories: { $elemMatch: { value: query } } }).toArray();
      res.send(result)
    })
    
    // Search (Case insensitive)
    app.get('/search', async(req, res) => {
      const searchKey = req.query.key;
      const result = await toyCollection.find({ toyName: { $regex: searchKey, $options: 'i' } }).limit(20).toArray();
      res.send(result);
    })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Superfinity Server is running on port: ${port}`);
});
