import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  settings: {
    role: { type: String, default: 'female' },
    cycleLength: { type: Number, default: 28 },
    periodLength: { type: Number, default: 5 },
    age: { type: String, default: '' },
    activity: { type: String, default: 'light' },
    contraception: { type: Boolean, default: false },
    periods: [{ type: String }],
    
    // Políčka pro párování účtů
    syncCode: { type: String }, 
    pairedWith: { type: String, default: null },
    
    // PŘIDÁNO: Uložení odběru pro push notifikace
    pushSubscription: { type: Object, default: null }
  },
  
  journal: [{
    date: { type: String },
    mood: { type: Number },
    sleep: { type: Number },
    stress: { type: Number },
    symptoms: [{ type: String }],
    note: { type: String }
  }]
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
