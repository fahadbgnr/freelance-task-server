const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const app = express();
const port = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vinhwjm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const freelancerTaskCollection = client.db('freelancerDB').collection('freelancerData');
    const userCollection = client.db('freelancerDB').collection('users');



    app.get('/freelancerData', async (req, res) => {
      const result = await freelancerTaskCollection.find().toArray()
      res.send(result)
    })


    app.get('/freelancerData/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await freelancerTaskCollection.findOne(query)
      res.send(result)
    })

    app.get('/freelancers', async (req, res) => {
      const email = req.query.email;
      const result = await freelancerTaskCollection.find({ email: email }).toArray();
      res.send(result);
    });

    app.get('/featuredTasks', async (req, res) => {
      try {
        const result = await freelancerTaskCollection
          .find()
          .sort({ deadline: 1 })
          .limit(6)
          .toArray();

        res.send(result);
      } catch (error) {
        console.error("Error fetching featured tasks:", error);
        res.status(500).send({ error: "Failed to fetch featured tasks" });
      }
    });

    app.post('/freelancerData', async (req, res) => {
      const newAddTaskData = req.body;
      const result = await freelancerTaskCollection.insertOne(newAddTaskData)
      res.send(result)
    })

    app.put('/freelancerData/:id', async (req, res) => {
      const id = req.params.id;
      const updatedTask = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          title: updatedTask.title,
          category: updatedTask.category,
          deadline: updatedTask.deadline,
          budget: updatedTask.budget,
          description: updatedTask.description,
        },
      };
      const result = await freelancerTaskCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.delete('/freelancer/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await freelancerTaskCollection.deleteOne(query);
      res.send(result)
    })



    // User related ApIs

    app.get('/users', async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result)
    })

    app.post('/users', async (req, res) => {
      const userProfile = req.body;
      const result = await userCollection.insertOne(userProfile)
      res.send(result)
    })


    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await userCollection.deleteOne(query);
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send("freelancer task server is ready")
});

app.listen(port, () => {
  console.log(`freelancer task server is running on port ${port}`)
});