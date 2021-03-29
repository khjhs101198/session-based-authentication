const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const driveSchema = new Schema({
    google_id: {
        type: String,
        unique: true
    },
    aud: {
        type: String
    },
    access_token: {
        type: String
    },
    refresh_token: {
        type: String
    },
    expiry_date: {
        type: Number
    }
});

const driveModel = mongoose.model("drive", driveSchema);

module.exports = driveModel;