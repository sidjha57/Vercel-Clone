import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());

const port = process.env.PORT || 4500;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})

