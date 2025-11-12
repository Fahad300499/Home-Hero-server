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
        app.post('/services', async (req, res) => {
            const newService = req.body;
            const result = await serviceCollection.insertOne(newService);
            res.send(result)
        })
        // ****
        // booking service
        app.post('/bookings', async (req, res) => {
            const newbooking = req.body;
            const result = await bookingCollection.insertOne(newbooking);
            res.send(result)
        })
        // ***
         // booking service
        app.get('/bookings', async (req, res) => {
            const email = req.query.email;
            const query = {};
            if (email) {
                query.email = email;
            }
            const cursor = bookingCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })
        // *****
         // bookings delete
        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await bookingCollection.deleteOne(query);
            res.send(result);
        });
        // ****
        // my service
        app.get('/all-services', async (req, res) => {
            const email = req.query.email;
            const query = {};
            if (email) {
                query.Email = email;
            }
            const cursor = serviceCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);

        });

        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find().limit(6);
            const services = await cursor.toArray();
            res.send(services);
        });
        // ****
        app.get('/all-services', async (req, res) => {
            const cursor = serviceCollection.find();
            const services = await cursor.toArray();
            res.send(services);
        });

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await serviceCollection.findOne(query);
            res.send(result);
        });
        // ****
         // Express Server (index.js বা servicesRoutes.js)

app.get('/services', async (req, res) => {
    try {
        // 1. ✅ Query Parameters গ্রহণ
        const minPrice = req.query.minPrice; 
        const maxPrice = req.query.maxPrice;
        
        // 2. ✅ MongoDB কোয়েরি অবজেক্ট তৈরি
        let query = {}; 

        // 3. ডায়নামিক ফিল্টারিং লজিক (Price)
        if (minPrice || maxPrice) {
            query.Price = {}; // Price ফিল্ডের জন্য অবজেক্ট তৈরি
            
            // যদি minPrice থাকে: Price >= minPrice
            if (minPrice) {
                query.Price.$gte = Number(minPrice); 
            }
            
            // যদি maxPrice থাকে: Price <= maxPrice
            if (maxPrice) {
                query.Price.$lte = Number(maxPrice); 
            }
        }
        
        // ⚠️ যদি আপনি ইউজার ইমেইল দিয়েও ফিল্টার করতে চান (যেমন: Provider এর সার্ভিস)
        // const email = req.query.email;
        // if (email) {
        //     query.ProviderEmail = email;
        // }


        // 4. MongoDB তে কোয়েরি চালানো
        // ⚠️ নিশ্চিত করুন Price ডেটাবেসে Number টাইপ হিসেবে সেভ করা আছে
        const services = await serviceCollection.find(query).toArray();
        
        res.send(services);
        
    } catch (error) {
        console.error('Filtering Error:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});
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