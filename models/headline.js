
var mongoose = require("mongoose");
var Note = require("./note");

var Schema = mongoose.Schema;

// Schema for the the headline
var headlineSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true
    },
     link:{
         type: String,
         required: true
     },
    saved: {
        type: Boolean,
        default: false
    },
    note: [{
        type: Schema.Types.ObjectId,
        ref: "Note"
    }]
});

// Create the headline model with the headlineSchema
var headline = mongoose.model("headline", headlineSchema);

// Export the model 
module.export = headline;
