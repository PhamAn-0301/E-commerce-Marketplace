const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5174',
  credentials: true
}));

const apiAuthRoute = require('./routes/apiAuth');
const protectedRoute = require('./routes/protected');

app.use('/', apiAuthRoute);
app.use('/api/protected', protectedRoute);

if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}

module.exports = app;
