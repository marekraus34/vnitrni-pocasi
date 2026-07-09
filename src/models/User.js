import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // Zde se budou ukládat uživatelova nastavení a nahrají se po přihlášení
  settings: {
    cycleLength: { type: Number, default: 28 },
    periodLength: { type: Number, default: 5 },
    age: { type: String, default: '' },
    activity: { type: String, default: 'light' },
    contraception: { type: Boolean, default: false },
    periods: [{ type: String }] // Pole datumů, např. ["2026-06-15", "2026-07-12"]
  },
  
  // Zde se bude ukládat kompletní deník
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