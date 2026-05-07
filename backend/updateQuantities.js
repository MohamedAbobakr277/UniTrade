const admin = require('firebase-admin');
const dotenv = require('dotenv');
dotenv.config();

admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'unitrade-cc943'
});

const db = admin.firestore();

async function updateProducts() {
    console.log("Starting product update...");
    const productsRef = db.collection('products');
    const snapshot = await productsRef.get();
    
    let updatedCount = 0;
    
    // We'll update sequentially to avoid batch limits for now, since it's just a one off script
    for (const doc of snapshot.docs) {
        const data = doc.data();
        if (data.quantityAvailable === undefined) {
            await doc.ref.update({ quantityAvailable: 1 });
            updatedCount++;
        }
    }
    
    console.log(`Successfully updated ${updatedCount} products to have quantityAvailable: 1`);
}

updateProducts().then(() => {
    process.exit(0);
}).catch(e => {
    console.error(e);
    process.exit(1);
});
