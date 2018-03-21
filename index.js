const express = require('express')
const path = require('path')
const bodyParser = require('body-parser');
const cors = require('cors');
const PORT = process.env.PORT || 5000
const app = express();


const data = [
  [],
  [],
  [],
  []
];
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));


app.get('/', (req, res) => res.send('ESP3903 Data Distribution Center'))
app.get("/api/data/", (req, res) => {
  res.status(200).send(
    data
  );
})

app.post("/api/update", (req, res) => {

  const row = req.body.row;
  const col = req.body.col;
  const voltage = req.body.voltage;
  if (!isNil([row, col, voltage])) {
    res.status(400).send({
      msg: `Parameter missing: 
      row:${row}, col:${col}, voltage:${voltage} 
    `
    })
    return;
  }


  data[row][col] = voltage;
  res.status(200).send({
    msg: `row:${row}, col:${col}, voltage:${voltage}`
  });
});


app.listen(PORT, () => console.log(`Listening on ${ PORT }`))


function isNil(args) {
  console.log(args)
  for (let arg of args) {
    if (arg == null || arg == undefined) {
      return false;
    }
  }
  return true;
}