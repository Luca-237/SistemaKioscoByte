const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const res = await mongoose.connection.collection('organizations').updateMany({}, { $set: { adminId: 'demo_admin' } });
    console.log('Updated:', res.modifiedCount);
    process.exit(0);
}).catch(console.error);
