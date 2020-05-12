const mongoose = require('mongoose');

const ProyectoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    creador: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario'
    }
}, {
    timestamp: true
} );
module.exports = mongoose.model('Proyecto', ProyectoSchema);
