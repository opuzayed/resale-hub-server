const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.rsulfhn.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run()
{
  try
  {
    const productsCollection = client.db('resaleDb').collection('productsItem');
    const bookingsCollection = client.db('resaleDb').collection('bookings');

    app.get('/products', async (req, res) => {
      const query = {}
      const cursor = productsCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
  });

  app.get('/products/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const product = await productsCollection.findOne(query);
    res.send(product);
  });

  app.post('/bookings', async(req, res) => {
      const booking = req.body;
      console.log(booking);
      const result = await bookingsCollection.insertOne(booking);
      res.send(result);
  })

  }
  finally{

  }
}
run().catch(err => console.error(err));



app.get('/', (req, res) => {
    res.send('Resale server is running');
  });

app.listen(port, () => {
    console.log(`Resale server is running on  ${port}`);
  });
  