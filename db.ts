import 'dotenv/config'
import { Pool } from 'pg'

const pool = new Pool({
    host: process.env.DB_HOST,
    port: 5432,
    user: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
})


export default pool;