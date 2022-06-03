import "dotenv/config"
import express from 'express'
import cors from "cors"
import getExplorerResponse from '../handler/explorer'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))


const FRONT_END_URL = process.env.FRONT_END_LOCAL_URL || process.env.FRONT_END_URL
const FRONT_END_URL_REXP = process.env.FRONT_END_LOCAL_URL_REXP || process.env.FRONT_END_URL_REXP

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

var corsOptions = {
  origin: [FRONT_END_URL, FRONT_END_URL_REXP],
  credentials: true,
};
app.use(cors(corsOptions))


app.post('/explorer', async (req, res) => {
  const { addresses } = req.body
  const result = await getExplorerResponse(addresses)
  res.status(200).json(result)
})

const port = process.env.PORT || 5000
app.listen(port, () => console.log(`Running on port ${port}`))

