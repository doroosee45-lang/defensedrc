const mongoose = require('mongoose');

const LOCAL_URI = 'mongodb://localhost:27017/milsys_rdc';

const connectDB = async () => {
  const isProd = process.env.NODE_ENV === 'production';
  const primaryURI = process.env.MONGO_URI;

  // En production, on n'a qu'Atlas — pas de fallback
  if (isProd) {
    try {
      const conn = await mongoose.connect(primaryURI, {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 75000,
      });
      console.log(`[MongoDB] Connecté: ${conn.connection.host}`);
    } catch (error) {
      console.error(`[MongoDB] Erreur de connexion: ${error.message}`);
      process.exit(1);
    }
  } else {
    // En développement : essaie Atlas d'abord, puis MongoDB local en fallback
    try {
      const conn = await mongoose.connect(primaryURI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      console.log(`[MongoDB] Connecté Atlas: ${conn.connection.host}`);
    } catch {
      console.warn('[MongoDB] Atlas inaccessible (réseau) — bascule sur MongoDB local...');
      try {
        const conn = await mongoose.connect(LOCAL_URI, {
          serverSelectionTimeoutMS: 5000,
        });
        console.log(`[MongoDB] Connecté local: ${conn.connection.host}`);
      } catch (localError) {
        console.error(`[MongoDB] Échec connexion locale: ${localError.message}`);
        process.exit(1);
      }
    }
  }

  mongoose.connection.on('error', (err) => {
    console.error(`[MongoDB] Erreur: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB] Déconnecté');
  });
};

module.exports = connectDB;
