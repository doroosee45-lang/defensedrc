const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`[MongoDB] Connecté: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error(`[MongoDB] Erreur: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Déconnecté');
    });

  } catch (error) {
    console.error(`[MongoDB] Erreur de connexion: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
