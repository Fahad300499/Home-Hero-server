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
        // await client.connect();

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

        // reviews 
        app.post('/services/review/:id', async (req, res) => {
  const serviceId = req.params.id;
  const { rating, message, userEmail } = req.body;

  try {
    const result = await serviceCollection.updateOne(
      { _id: new ObjectId(serviceId) },
      {
        $push: {
          reviews: {
            serviceId,
            rating,
            message,
            userEmail,
            createdAt: new Date()
          }
        }
      }
    );

    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Failed to add review" });
  }
});


        // sorting
        app.get('/services/filter', async (req, res) => {
  try {
    const minPrice = parseFloat(req.query.minPrice);
    const maxPrice = parseFloat(req.query.maxPrice);
    const order = req.query.order; // asc or desc

    let query = {};
    let sortOrder = 1; // default ascending

    if (order === 'desc') {
      sortOrder = -1;
    }

    if (!isNaN(minPrice) && !isNaN(maxPrice)) {
      query.Price = { $gte: minPrice, $lte: maxPrice };
    } else if (!isNaN(minPrice)) {
      query.Price = { $gte: minPrice };
    } else if (!isNaN(maxPrice)) {
      query.Price = { $lte: maxPrice };
    }

    const result = await serviceCollection
      .find(query)
      .sort({ Price: sortOrder })
      .toArray();

    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

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
            console.log(email)
            let query = {};
            if (email) {
      query = { Email: email };
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
   
        const minPrice = req.query.minPrice; 
        const maxPrice = req.query.maxPrice;
        
        
        let query = {}; 

    
        if (minPrice || maxPrice) {
            query.Price = {}; 
            
            if (minPrice) {
                query.Price.$gte = Number(minPrice); 
            }
            
            if (maxPrice) {
                query.Price.$lte = Number(maxPrice); 
            }
        }
        
        const services = await serviceCollection.find(query).toArray();
        
        res.send(services);
        
    } catch (error) {
        console.error('Filtering Error:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});
// *****

        app.delete('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await serviceCollection.deleteOne(query);
            res.send(result);
        });

        const { ObjectId } = require('mongodb'); 


app.patch('/services/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        
       
        const { 
            ServiceName, 
            Price, 
            ProviderEmailForAuth,
            ...updatedFields 
        } = req.body;
        

        const service = await serviceCollection.findOne(query);

        if (!service) {
            return res.status(404).send({ message: 'Error: Service not found.' });
        }
        
       
        if (service.ProviderEmail !== ProviderEmailForAuth) { 
            return res.status(403).send({ message: 'Forbidden: You can only update your own service.' });
        }
        
    
        const updateDoc = {
            $set: {
               
                ServiceName:ServiceName,
                Price: Price, 
                
            },
        };

        
        const result = await serviceCollection.updateOne(query, updateDoc);

        if (result.modifiedCount > 0) {
            res.send({ success: true, message: 'Service updated successfully.', modifiedCount: result.modifiedCount });
        } else {
           
            res.send({ success: true, message: 'Update request successful, but no changes were made.' });
        }
        
    } catch (error) {
        console.error('Service Update Error:', error);
        res.status(500).send({ message: 'Internal Server Error during update.' });
    }
});


    

        // price filtering
        app.get('/services', async(req, res) => {
            const { minPrice, maxPrice } = req.query;

            const filter = {
                "price": {
                    $gte: 100, 
                    $lte: 500  
                }
            };
            const services = await serviceCollection.find(filter).toArray();
         
            res.send(services);
        })



        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})