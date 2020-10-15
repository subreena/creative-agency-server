const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lkdxj.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const port = 4000
const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('doctors'));
app.use(fileUpload());

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

client.connect(err => {
  const adminCollection = client.db("creativeAgency").collection("admin");
  const serviceCollection = client.db("creativeAgency").collection("services");
  const reviewCollection = client.db("creativeAgency").collection("clientReview");
  const serviceAddedCollection = client.db("creativeAgency").collection("serviceAdded");




  console.log("Database connected successfully");

  // ADD SERVICE
  app.post('/allService', (req, res) => {
    // const service = req.body;
    // console.log(service);
    // serviceCollection.insertOne(service)
    //   .then(result => {
    //     res.status(200).send(result.insertedCount > 0);
    //     console.log(result);
    //   })
    const file = req.files.file;
    const service = req.body.service;
    const summary = req.body.summary;

    const newImg = file.data;
    const encImg = newImg.toString('base64');

    const image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, 'base64')
    };
    serviceCollection.insertOne({ service, summary, image })
      .then(result => {
        console.log(result);
        res.send(result.insertedCount > 0);
      })
  })
  //  ALL SERVICE
  app.get('/allService', (req, res) => {
    serviceCollection.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  })
  //  ADDING REVIEW
  app.post('/allReview', (req, res) => {
    const review = req.body;
    console.log(review);
    reviewCollection.insertOne(review)
      .then(result => {
        console.log(result);
        res.status(200).send(result.insertedCount > 0);
      })
  })
  //  ALL Review
  app.get('/allReview', (req, res) => {
    reviewCollection.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  })


  // Add Admin
  app.post('/addAdmin', (req, res) => {
    const admin = req.body;
    adminCollection.insertOne(admin)
      .then(result => {
        console.log(result);
        res.status(200).send(result.insertedCount > 0);
      })
  })

  // verifying admin
  app.post('/isAdmin', (req, res) => {
    const email = req.body.email;
    adminCollection.find({ email: email })
      .toArray((err, admin) => {
        res.status(200).send(admin.length > 0);
      })
  })

  // ADD SERVICE
  app.post('/userAddedService', (req, res) => {
    const addedService = req.body;
    console.log(addedService);
    serviceAddedCollection.insertOne(addedService)
      .then(result => {
        res.status(200).send(result.insertedCount > 0);
        console.log(result);
      })
  })
  // GET SERVICE
  app.get('/userAddedService', (req, res) => {
    serviceAddedCollection.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  })
  //  getting service by email
  app.get('/userAddedService/:email', (req, res) => {
    serviceAddedCollection.find({ email: req.params.email })
      .toArray((err, documents) => {
        // console.log(documents);
        res.status(200).send(documents);
      })


  })
  //  UPDATE STATUS
  app.patch(`/updateOrders`, (req, res) => {
    serviceAddedCollection.updateOne({ _id: req.body.id },
      {
        $set: { status: req.body.status }
      })
      .then(result => {
        console.log(result);
      })
  })
})












// respond with "hello world" when a GET request is made to the homepage

app.get('/', (req, res) => {
  res.send("Hello from creative agency db. It works perfectly up to now!")
})
app.listen(process.env.PORT || port);