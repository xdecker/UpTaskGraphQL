const mongoose = require('mongoose');

const TareaSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },

    proyecto: {
        type: mongoose.Schema.Types.ObjectId,
            ref: 'Proyecto'
    },

    estado : {
      type: Boolean,
      default: false
    },

    creador: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario'
    }
}, {
    timestamp: true
} );
module.exports = mongoose.model('Tarea', TareaSchema);
