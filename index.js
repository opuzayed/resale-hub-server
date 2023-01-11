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

function verifyJWT(req, res, next) {

  const authHeader = req.headers.authorization;
  if (!authHeader) {
      return res.status(401).send('unauthorized access');
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
      if (err) {
          return res.status(403).send({ message: 'forbidden access' })
      }
      req.decoded = decoded;
      next();
  })

}

async function run()
{
  try
  {
    const productsCollection = client.db('resaleDb').collection('productsItem');
    const bookingsCollection = client.db('resaleDb').collection('bookings');
    const usersCollection = client.db('resaleDb').collection('users');
    const sellerProductsCollection = client.db('resaleDb').collection('sellerProducts');

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
      const result = await bookingsCollection.insertOne(booking);
      res.send(result);
  });

  app.get('/bookings', async (req, res) => {
    const email = req.query.email;
    //const decodedEmail = req.decoded.email;

    // if (email !== decodedEmail) {
    //     return res.status(403).send({ message: 'forbidden access' });
    // }

    const query = { email: email };
    const bookings = await bookingsCollection.find(query).toArray();
    res.send(bookings);
});

    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
  });

  app.get('/users/seller/:email', async (req, res) => {
    const email = req.params.email;
    const query = { email }
    const user = await usersCollection.findOne(query);
    res.send({ isSeller: user?.category === 'seller' });
});
// give seller admin and jwt
app.get('/sellerproducts', async (req, res) => {
  // const decoded = req.decoded;
  
  // if(decoded.email !== req.query.email){
  //     res.status(403).send({message: 'unauthorized access'})
  // }

  let query = {};
  if (req.query.email) {
      query = {
          email: req.query.email
      }
  }
  const cursor = sellerProductsCollection.find(query);
  const sellerProducts = await cursor.toArray();
  res.send(sellerProducts);
});

  //check seller verification and jwt
  app.post('/sellerproducts', async (req, res) => {
    const product = req.body;
    const result = await sellerProductsCollection.insertOne(product);
    res.send(result);
  });
//check seller verification and jwt
  app.patch('/sellerproducts/:id', async (req, res) => {
    const id = req.params.id;
    const status = req.body.status
    const query = { _id: ObjectId(id) }
    const updatedDoc = {
        $set:{
            status: status
        }
    }
    const result = await sellerProductsCollection.updateOne(query, updatedDoc);
    res.send(result);
});
//check seller verification and jwt
app.delete('/sellerproducts/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await sellerProductsCollection.deleteOne(query);
    res.send(result);
});



app.get('/users/admin/:email', async (req, res) => {
  const email = req.params.email;
  const query = { email }
  const user = await usersCollection.findOne(query);
  res.send({ isAdmin: user?.category === 'admin' });
});

app.get('/allbuyers', async (req, res) => {
  const query = {category:"buyer"}
  const cursor = usersCollection.find(query);
  const buyers = await cursor.toArray();
  res.send(buyers);
});

app.delete('/allbuyers/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: ObjectId(id) };
  const result = await usersCollection.deleteOne(query);
  res.send(result);
});
app.get('/allsellers', async (req, res) => {
  const query = {category:"seller"}
  const cursor = usersCollection.find(query);
  const sellers = await cursor.toArray();
  res.send(sellers);
});

app.delete('/allsellers/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: ObjectId(id) };
  const result = await usersCollection.deleteOne(query);
  res.send(result);
});

// app.get('/users/allbuyers/:email', async (req, res) => {
//   const email = req.params.email;
//   const query = { email }
//   const user = await usersCollection.find(query).toArray();
//   res.send({ isBuyer: user?.category === 'buyer' });
// });



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
  