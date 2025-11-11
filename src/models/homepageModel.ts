import mongoose, { Schema } from 'mongoose';

interface FreshlyMintedConfig {
  backgroundImage: string;
  topImage1: string;
  topImage2: string;
  topImage1Title: string;
  topImage2Title: string;
  topImage1Link: string;
  topImage2Link: string;
}

interface TrendingConfig {
  enabled: boolean;
  daysBack: number;
}

export interface HomepageDocument extends mongoose.Document {
  heroImages: string[];
  signatureCollections: mongoose.Types.ObjectId[];
  freshlyMinted: FreshlyMintedConfig;
  worldOfCaelviCollections: mongoose.Types.ObjectId[];
  trendingConfig: TrendingConfig;
  createdAt: Date;
  updatedAt: Date;
}

interface HomepageModel extends mongoose.Model<HomepageDocument> {
  getHomepage(): Promise<HomepageDocument>;
}

const homepageSchema = new Schema<HomepageDocument, HomepageModel>(
  {
    // Hero Section - Array of image URLs
    heroImages: {
      type: [String],
      default: [],
    },

    // Signature Collections - Array of collection IDs
    signatureCollections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Collection',
      },
    ],

    // Freshly Minted Section
    freshlyMinted: {
      backgroundImage: {
        type: String,
        default: '',
      },
      topImage1: {
        type: String,
        default: '',
      },
      topImage2: {
        type: String,
        default: '',
      },
      topImage1Title: {
        type: String,
        default: '',
      },
      topImage2Title: {
        type: String,
        default: '',
      },
      topImage1Link: {
        type: String,
        default: '',
      },
      topImage2Link: {
        type: String,
        default: '',
      },
    },

    // The World of Caelvi - Array of collection IDs
    worldOfCaelviCollections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Collection',
      },
    ],

    // Currently Trending - configuration only
    trendingConfig: {
      enabled: {
        type: Boolean,
        default: true,
      },
      daysBack: {
        type: Number,
        default: 30,
      },
    },
  },
  { timestamps: true }
);

// Ensure only one homepage configuration exists
homepageSchema.statics.getHomepage = async function () {
  let homepage = await this.findOne();
  if (!homepage) {
    homepage = await this.create({});
  }
  return homepage;
};

const HomepageModelInstance =
  (mongoose.models.Homepage as HomepageModel | undefined) ||
  mongoose.model<HomepageDocument, HomepageModel>('Homepage', homepageSchema);

export default HomepageModelInstance;

