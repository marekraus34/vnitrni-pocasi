import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  
  // OPRAVA: Heslo už není povinné (Google přihlášení ho nemá)
  password: { type: String, required: false },
  
  settings: {
    role: { type: String, default: 'female' },
    cycleLength: { type: Number, default: 28 },
    periodLength: { type: Number, default: 5 },
    lutealLength: { type: Number, default: 14 },
    age: { type: String, default: '' },
    activity: { type: String, default: 'light' },
    contraception: { type: Boolean, default: false },
    periods: [{ type: String }],
    
    // Párování
    syncCode: { type: String }, 
    pairedWith: { type: String, default: null },
    
    // Notifikace a soukromí
    pushSubscription: { type: Object, default: null },
    reminderFrequency: { type: String, default: '3days' },
    periodAlert: { type: Boolean, default: true },
    phaseAlert: { type: Boolean, default: true },
    ovulationAlert: { type: Boolean, default: true },
    discreetMode: { type: Boolean, default: false }
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
