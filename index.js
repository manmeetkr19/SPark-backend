import dotenv from "dotenv";
import express, { response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

const salt = 10;

const url = process.env.URI;

const connectionParams = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
mongoose
  .connect(url, connectionParams)
  .then(() => {
    console.log("Connected to the database ");
  })
  .catch((err) => {
    console.error(`Error connecting to the database. n${err}`);
  });

//user schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const User = new mongoose.model("user", userSchema);

app.get("/", function (req, res) {
  res.send("Spark Backend");
});

//routes routes
app.post("/Login", async (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email: email })
    .then((founduser) => {
      if (founduser) {
        bcrypt.compare(password, founduser.password, function(err, data){
          if (err) throw err;
          if (data) {
            return res.status(200).send({ message: "login sucess", user: founduser });
          } else {
            return res.status(401).json({ message: "Invalid credentials" });
          }
        });
        //res.send({ message: "login sucess", user: founduser });
      } else {
        res.send({ message: "no user found" });
      }
    })
    .catch((err) => console.log(err));
});

app.post("/Register", async (req, res) => {
  const password = await bcrypt.hash(req.body.password, salt);
  const { name, email } = req.body;

  User.findOne({ email: email }).then((founduser) => {
    if (founduser) {
      res.send({ message: "email already exsists" });
    } else {
      const newUser = new User({ name, email, password });
      newUser
        .save()
        .then(() => {
          res.send({ message: "user registration sucessful" });
        })
        .catch((err) => console.log(err));
    }
  });
});

app.listen(process.env.PORT, () => {
  console.log("started");
});
