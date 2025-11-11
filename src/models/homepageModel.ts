import mongoose from 'mongoose';

const homepageSchema = new mongoose.Schema(
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

    // Currently Trending - This will be auto-calculated based on recent sales
    // We'll store the logic preference here, but actual data comes from orders
    trendingConfig: {
      enabled: {
        type: Boolean,
        default: true,
      },
      // Number of days to look back for trending
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

const Homepage =
  mongoose.models.Homepage || mongoose.model('Homepage', homepageSchema);
export default Homepage;

