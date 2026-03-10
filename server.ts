import type {Express, Request, Response} from 'express';
import express from 'express';
import 'dotenv/config'
import userRoutes from "./src/routes/user.routes.js";

const port = process.env.PORT || 8000;

const app: Express = express();
app.use(express.json());

app.get('/', async (req: Request, res: Response) => {
    try {
        res.status(200).send('Hello World!');
    } catch (err) {
        console.log(err)
        res.sendStatus(500);
    }
})

app.use('/users', userRoutes);

app.post('/registration', async (req: Request, res: Response) => {
    try {
        const {body: {login, password}} = req
        res.status(200).send(`Your variables are ${login}, ${password}`);
    } catch (err) {
        console.log(err)
        res.sendStatus(500);
    }
})
app.post('/login', async (req: Request, res: Response) => {
    try {
        console.log(req.body)
        const {body: {login, password}} = req
        res.status(200).send(`Your variables are ${login}, ${password}`);
    } catch (err) {
        console.log(err)
        res.sendStatus(500);
    }
})

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
})
