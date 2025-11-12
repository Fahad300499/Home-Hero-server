const express = require('express')
const cors = require('cors')
require('dotenv').config()
const app = express()
const port = process.env.Port || 3000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middleware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.co3ydzz.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
async function run() {

    try {
        await client.connect();

        const homeDB = client.db("homeDB");
        const userCollection = homeDB.collection("users");
        const serviceCollection = homeDB.collection("services");
        const bookingCollection = homeDB.collection("booking");

        // *****

        //  app.patch('/services/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: new ObjectId(id) }
        //     const result = await serviceCollection.updateOne(query);
        //     res.send(result);
        // });

        // price filtering
        app.get('/services', async(req, res) => {
            const { minPrice, maxPrice } = req.query;
            // const filter = {}

            const filter = {
                "price": {
                    $gte: 100, // Greater than or Equal to 100
                    $lte: 500  // Less than or Equal to 500
                }
            };
            const services = await serviceCollection.find(filter).toArray();
            // services-এর মধ্যে 100 থেকে 500-এর মধ্যে দামের সব পরিষেবা থাকবে।
            res.send(services);
        })



        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

// v9v6313IR5tVoaTP
// homeDBUser