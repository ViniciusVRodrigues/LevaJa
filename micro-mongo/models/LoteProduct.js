const mongoose = require('mongoose');

/**
 * Schema de Lote de Produto
 */
const loteProductSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 150
  },
  categoria: {
    type: String,
    required: true
  },
  estoque: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  valor: {
    type: Number,
    required: true,
    min: 0
  },
  validade: {
    type: Date,
    required: false
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Índice para busca por categoria
loteProductSchema.index({ categoria: 1 });

module.exports = mongoose.model('LoteProduct', loteProductSchema);
