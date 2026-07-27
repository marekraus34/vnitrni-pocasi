import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  settings: {
    role: { type: String, default: 'female' },
    cycleLength: { type: Number, default: 28 },
    periodLength: { type: Number, default: 5 },
    lutealLength: { type: Number, default: 14 },
    age: { type: String, default: '' },
    activity: { type: String, default: 'light' },
    contraception: { type: Boolean, default: false },
    periods: [{ type: String }],
    
    syncCode: { type: String }, 
    pairedWith: { type: String, default: null },
    
    pushSubscription: { type: Object, default: null },
    reminderFrequency: { type: String, default: '3days' },
    discreetMode: { type: Boolean, default: false },

    // NOVÉ NASTAVENÍ NOTIFIKACÍ PRO ŽENU
    periodAlert: { type: Boolean, default: true },
    pmsAlert: { type: Boolean, default: true },
    ovulationAlert: { type: Boolean, default: false },

    // NOVÉ NASTAVENÍ NOTIFIKACÍ PRO PARTNERA
    partnerEntryAlert: { type: Boolean, default: true },
    partnerPhaseAlert: { type: Boolean, default: true }
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
