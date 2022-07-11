const mongoose = require("mongoose");

var noteSchema = new mongoose.Schema({
    title:String,
    content:String,
    owner:String,
    status:String
},
{
    timestamps: true
})

module.exports = mongoose.model("Note",noteSchema);
