import express from 'express';
const port = process.env.PORT || 8000;

const app = express();
app.use(express.json());

app.get('/', async (req, res) => {
    try {
        res.status(200).send('Hello World!');
    } catch (err) {
        console.log(err)
        res.sendStatus(500);
    }
})

app.get('/login', async (req, res) => {
    try {
        res.status(200).send('Hello World!');
    } catch (err) {
        console.log(err)
        res.sendStatus(500);
    }
})

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
})
