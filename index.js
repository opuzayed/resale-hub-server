const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
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

    app.get('/products', async (req, res) => {
      const query = {}
      const cursor = productsCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
  });

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
  