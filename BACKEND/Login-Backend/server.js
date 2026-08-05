require('dotenv').config();   // 👈 FIRST LINE

const app = require('./src/app');
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Login backend running on port ${PORT}`);
});
