const express = require('express')
const app = express();
const Port = process.env.PORT || 3000;
const mongodb = require('mongodb')
const { hashing } = require("./auth");
const { hashCompare } = require("./auth");
const { createJWT } = require("./auth");
const { authorize } = require("./auth");


const mongoClient = mongodb.MongoClient

const dburl = "mongodb+srv://sarankumar:sarankumar@cluster0.wmylt.mongodb.net/test"



app.use(express.json());


app.get('/', (req, res) => {
    res.status(200).send('users routes');
});

//------- Signup/Registration----------

app.get("/sign", async(req, res) => {
    let client = await mongoClient.connect(dburl)
    try {
        //select the db
        let db = client.db("password")
        const data = await db.collection("creation").find().toArray();
        res.json({ message: "Record fetched", data })
    } catch (error) {
        console.log(error);
        res.json({ message: "something went Wrong" })
    } finally {
        //close connection
        client.close();
    }

});

app.post("/signup", async(req, res) => {
    let client = await mongoClient.connect(dburl)
    try {
        // select db
        let db = client.db("password")
        const hash = await hashing(req.body.password);
        req.body.password = hash
            // console.log(hash)
        const data = await db.collection("creation").insertOne(req.body);
        res.json({ message: "Record Created" })
    } catch (error) {
        console.log(error);
        res.json({ message: "Something went wrong" })
    } finally {
        //close connection
        client.close();
    }
});

//--------Login--------------- 

app.post('/login', async(req, res) => {
    const client = await mongoClient.connect(dburl);
    const { password, email } = req.body;
    try {
        const db = client.db('password')
        const data = await db.collection('creation').findOne({ email });
        if (data) {
            // compare password
            const compare = await hashCompare(password, data.password) // compare password with hash value  
            console.log("compare:::", compare) //return boolean value -->   working
            if (compare) {
                const token = await createJWT({ _id: data._id });
                console.log("token", token)

                // const token = createJWT.sign({ email, _id: data._id }, secret);
                // res.header('auth-token', token).send(token)
                res.json({ message: "allow access", token: token });
            } else {
                res.json({ message: "wrong Password" })
            }
        } else {
            res.json({ message: "No user Exist with this credentials" })
        }
        //send response
    } catch (error) {}
});


app.get("/login", authorize, async(req, res) => {
    let client = await mongoClient.connect(dburl);
    try {
        let db = client.db("password");
        const data = await db.collection("creation").find().toArray();
        res.json({ message: "success", data });
    } catch (error) {
        console.log(error)
        res.json({ message: "something went wrong" })
    } finally {
        client.close();
    }
})


app.listen(3000, () => { console.log("Server is listening on port 3000") })

// user--> data in login post