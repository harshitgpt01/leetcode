const mongooses = require('mongoose');

async function main() {
    await mongooses.connect(process.env.DB_CONNECT_STRING)
}

module.exports = main;



