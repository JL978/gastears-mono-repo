import "dotenv/config"
import express from 'express'
import cors from "cors"
import getExplorerResponse from '../handler/explorer'

const app = express()

var corsOptions = {
  origin: [process.env.FRONT_END_URL],
  credentials: true,
};


app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});


app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors(corsOptions))

const port = process.env.PORT || 5000

app.post('/explorer', async (req, res) => {
  const { addresses } = req.body
  const result = await getExplorerResponse(addresses)
  res.status(200).json(result)
})

app.listen(port, () => console.log(`Running on port ${port}`))

