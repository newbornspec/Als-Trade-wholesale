require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('./models/User');

const EMAIL = 'stephenukaeg@gmail.com'; // ← change this

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const user = await User.findOneAndUpdate(
    { email: EMAIL },
    { role: 'admin' },
    { new: true }
  );

  if (!user) {
    console.log('User not found:', EMAIL);
  } else {
    console.log(`✓ ${user.name} (${user.email}) is now an admin`);
  }

  process.exit();
});