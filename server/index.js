import dotenv from 'dotenv';
import { connectDB } from './databases/db.js';
import express from 'express';
dotenv.config();


const app = express();

app.use(express.json());
// app.use(cors());
app.use('/public', express.static("uploads") );


// import routes
import userRoutes from './routes/user.routes.js'


//using routes
app.use('/api',userRoutes);


app.listen(process.env.PORT , ()=>{
    console.log("Server is running at port : ", process.env.PORT);
    connectDB();
});
