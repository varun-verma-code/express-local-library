import mongoose from 'mongoose';

// MONGO_PASSWORD stored in .zshrc on Mac
const dbUrl = `mongodb+srv://root:${process.env.MONGO_PASSWORD}@demo-cluster.xvn8t.mongodb.net/localLibrary?retryWrites=true&w=majority&appName=demo-cluster`;
console.log(dbUrl);

const dbConnection = async () => {
  try {
    await mongoose.connect(dbUrl);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
  }
};

export default dbConnection;
