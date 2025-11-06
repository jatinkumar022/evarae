import mongoose, { Model } from 'mongoose';

interface ISettings {
  general: {
    storeName: string;
    currency: string;
    timezone: string;
  };
  footer: {
    tagline: string;
    phone: string;
    email: string;
    location: string;
    socialLinks: {
      instagram: string;
      twitter: string;
      facebook: string;
      youtube: string;
    };
  };
}

interface ISettingsModel extends Model<ISettings> {
  getSettings(): Promise<ISettings & mongoose.Document>;
}

const settingsSchema = new mongoose.Schema(
  {
    // General Settings
    general: {
      storeName: { type: String, default: 'Caelvi' },
      currency: { type: String, default: 'INR' },
      timezone: { type: String, default: 'Asia/Kolkata' },
    },

    // Footer Settings
    footer: {
      tagline: {
        type: String,
        default: 'Exquisite Jewellery for Every Occasion. Crafted with passion, designed for elegance.',
      },
      phone: { type: String, default: '+91 9328901475' },
      email: { type: String, default: 'support@caelvi.com' },
      location: { type: String, default: 'Ahmedabad' },
      socialLinks: {
        instagram: { type: String, default: '#' },
        twitter: { type: String, default: '#' },
        facebook: { type: String, default: '#' },
        youtube: { type: String, default: '#' },
      },
    },
  },
  { timestamps: true }
);

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const Settings: ISettingsModel =
  (mongoose.models.Settings as ISettingsModel) || mongoose.model<ISettings, ISettingsModel>('Settings', settingsSchema);

export default Settings;

