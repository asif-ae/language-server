const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.db_username}:${process.env.db_password}@cluster0.oxnofiz.mongodb.net/?retryWrites=true&w=majority`;

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
    const classCollection = await client.db("languageHub").collection("class");
    const userCollection = await client.db("languageHub").collection("user");
    const feedbackMessageCollection = await client
      .db("languageHub")
      .collection("message");

    // save user info
    app.post("/userinfo", async (req, res) => {
      const newuser = req.body;
      const query = { email: newuser?.email };
      const isExistsUser = await userCollection.findOne(query);
      if (!isExistsUser) {
        const result = await userCollection.insertOne(newuser);
        res.send(result);
      }
    });

    // class add
    app.post("/allclass", async (req, res) => {
      const newclass = req.body;
      const result = await classCollection.insertOne(newclass);
      res.send(result);
    });

    app.get("/classes", async (req, res) => {
      const email = req.query?.email;
      if (!email) {
        res.status(404).send({ message: "Email Not Found", error: true });
      }
      const result = await classCollection.find({ email: email }).toArray();
      res.send(result);
    });

    // load All Class by all instructor
    app.get("/allclass", async (req, res) => {
      const result = await classCollection.find().toArray();
      res.send(result);
    });

    // load ll users data
    app.get("/allusers", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    // update single data about class status
    app.patch("/class/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateStatus = req.body;
      const updateDoc = {
        $set: {
          status: updateStatus.status,
        },
      };
      const result = await classCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // update single data about user role
    app.patch("/user-role/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateStatus = req.body;
      const updateDoc = {
        $set: {
          role: updateStatus.role,
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // load All Approve class fro displaying in website
    app.get("/class/approved", async (req, res) => {
      const result = await classCollection
        .find({ status: "approved" })
        .toArray();
      res.send(result);
    });

    // load login user data
    app.get("/userData", async (req, res) => {
      const email = req.query?.email;
      if (!email) {
        res.status(404).send({ message: "Email Not Found", error: true });
      }
      const result = await userCollection.findOne({ email: email });
      res.send(result);
    });

    app.get("/filterByPopularClass", async (req, res) => {
      const results = await classCollection
        .aggregate([
          { $match: { status: "approved" } },
          { $sort: { students: -1 } },
        ])
        .toArray();
      res.send(results);
    });

    // load all instructor
    app.get("/instructor", async (req, res) => {
      const result = await userCollection
        .find({ role: "instructor" })
        .toArray();
      res.send(result);
    });

    // add booked data
    app.post("/booked", async (req, res) => {
      const newCart = req.body;
      const results = await classCollection.insertOne(newCart);
      res.send(results);
    });

    // get booked data
    app.get("/booked", async (req, res) => {
      const email = req.query?.email;
      let query = {};
      if (email) {
        query = { email: email, status: "booked" };
      }
      const results = await classCollection.find(query).toArray();
      res.send(results);
    });

    app.delete("/booked/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const results = await classCollection.deleteOne(query);
      res.send(results);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (err) {
    console.error(err);
  }
}
run().catch(console.dir);

app.get("/", async (req, res) => {
  res.send("Laguage Hub Server....");
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
