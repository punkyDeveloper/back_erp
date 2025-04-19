const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express(); 

const router = require('./src/routers/router');

app.use(cors());
app.use(morgan('tiny'));
app.use(express.json());

const PORT = process.env.PORT || 3002;

app.use('/v1/', router);

app.listen(PORT, () => {
    console.log(`Conectado en el puerto ${PORT}`);
});
