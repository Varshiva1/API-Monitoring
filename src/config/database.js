import mongoose, { mongo } from "mongoose";

const connectDB = async()=>{
    try{
        const conn = await mongoose.connect(process.env.MONGODB_URI)
        console.log(`✅  MongoDB Connected: ${conn.connection.host}`)

        mongoose.connection.on('error',(err)=>{
            console.error(`❌ DB connection errror"${err}`);
        });
        mongoose.connection.on('disconnected',()=>{
            console.error('⚠️ DB Diconnected');
        });
    }
    catch(error){
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    };
};
export default connectDB