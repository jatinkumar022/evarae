'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Save,
  Upload,
  X,
  Image as ImageIcon,
  Layers,
  Sparkles,
  Globe,
  TrendingUp,
  Plus,
  Trash2,
} from 'lucide-react';
import { useCollectionStore } from '@/lib/data/store/collectionStore';
import { useUploadStore } from '@/lib/data/store/uploadStore';
import { toastApi } from '@/lib/toast';
import InlineSpinner from '@/app/admin/components/InlineSpinner';
import CollectionSelectionModal from '@/app/admin/components/CollectionSelectionModal';
import { apiFetch } from '@/lib/utils';

interface HomepageData {
  heroImages: string[];
  signatureCollections: string[];
  storyCollections: string[];
  freshlyMinted: {
    backgroundImage: string;
    topImage1: string;
    topImage2: string;
    topImage1Title: string;
    topImage2Title: string;
    topImage1Link: string;
    topImage2Link: string;
  };
  worldOfCaelviCollections: string[];
  trendingConfig: {
    enabled: boolean;
    daysBack: number;
  };
}

export default function HomepagePage() {
  const { collections, fetchCollections } = useCollectionStore();
  const { uploadFile } = useUploadStore();

  const [homepageData, setHomepageData] = useState<HomepageData>({
    heroImages: [],
    signatureCollections: [],
    storyCollections: [],
    freshlyMinted: {
      backgroundImage: '',
      topImage1: '',
      topImage2: '',
      topImage1Title: '',
      topImage2Title: '',
      topImage1Link: '',
      topImage2Link: '',
    },
    worldOfCaelviCollections: [],
    trendingConfig: {
      enabled: true,
      daysBack: 30,
    },
  });

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [isWorldModalOpen, setIsWorldModalOpen] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    fetchCollections();
    fetchHomepageData();
  }, [fetchCollections]);

  const fetchHomepageData = async () => {
    setLoading(true);
    try {
      const response = await apiFetch<{ homepage: HomepageData }>(
        '/api/admin/homepage'
      );
      if (response.homepage) {
        setHomepageData(prev => ({
          ...prev,
          ...response.homepage,
          heroImages: response.homepage.heroImages ?? [],
          signatureCollections: response.homepage.signatureCollections ?? [],
          storyCollections: response.homepage.storyCollections ?? [],
          worldOfCaelviCollections: response.homepage.worldOfCaelviCollections ?? [],
          freshlyMinted: {
            ...prev.freshlyMinted,
            ...response.homepage.freshlyMinted,
          },
          trendingConfig: {
            ...prev.trendingConfig,
            ...response.homepage.trendingConfig,
          },
        }));
      }
    } catch (error) {
      console.error('Failed to fetch homepage data:', error);
      toastApi.error('Failed to load homepage data', 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await apiFetch<{ success: boolean }>(
        '/api/admin/homepage',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(homepageData),
        }
      );

      if (response.success) {
        toastApi.success(
          'Homepage updated successfully',
          'Your changes have been saved'
        );
      }
    } catch (error) {
      console.error('Failed to save homepage data:', error);
      toastApi.error('Failed to save homepage data', 'Please try again');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toastApi.error('Invalid file type', 'Please upload an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toastApi.error('File too large', 'Please upload an image under 5MB');
      return;
    }

    setUploadingImages(prev => ({ ...prev, [field]: true }));
    try {
      await uploadFile(file);
      const uploadState = useUploadStore.getState();
      if (uploadState.error) {
        toastApi.error('Upload failed', uploadState.error);
        return;
      }
      if (uploadState.fileUrl) {
        if (field === 'heroImages') {
          setHomepageData(prev => ({
            ...prev,
            heroImages: [...prev.heroImages, uploadState.fileUrl!],
          }));
        } else {
          setHomepageData(prev => ({
            ...prev,
            freshlyMinted: {
              ...prev.freshlyMinted,
              [field]: uploadState.fileUrl!,
            },
          }));
        }
        toastApi.success('Image uploaded successfully', '');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toastApi.error('Upload failed', 'Please try again');
    } finally {
      setUploadingImages(prev => ({ ...prev, [field]: false }));
    }
  };

  const removeHeroImage = (index: number) => {
    setHomepageData(prev => ({
      ...prev,
      heroImages: prev.heroImages.filter((_, i) => i !== index),
    }));
  };

  const handleCollectionSelection = (
    collectionIds: string[],
    type: 'signature' | 'world' | 'story'
  ) => {
    if (type === 'signature') {
      setHomepageData(prev => ({
        ...prev,
        signatureCollections: collectionIds,
      }));
      setIsSignatureModalOpen(false);
    } else if (type === 'story') {
      setHomepageData(prev => ({
        ...prev,
        storyCollections: collectionIds,
      }));
      setIsStoryModalOpen(false);
    } else {
      setHomepageData(prev => ({
        ...prev,
        worldOfCaelviCollections: collectionIds,
      }));
      setIsWorldModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0d0d0d] flex items-center justify-center">
        <InlineSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d0d0d]">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Homepage Management
              </h1>
              <p className="mt-2 text-gray-600 dark:text-[#bdbdbd] text-sm md:text-base">
                Manage all sections of your homepage
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSaving ? (
                <InlineSpinner size="sm" className="mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Hero Section */}
          <div className="bg-white dark:bg-[#191919] shadow-sm rounded-xl border border-gray-200 dark:border-[#3a3a3a] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1f1f1f]">
              <div className="flex items-center">
                <ImageIcon className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
                <h2 className="md:text-lg font-semibold text-gray-900 dark:text-white">
                  Hero Section
                </h2>
              </div>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hero Images (Carousel)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {homepageData.heroImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <Image
                      src={image}
                      alt={`Hero ${index + 1}`}
                      width={320}
                      height={128}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeHeroImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <label className="flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-[#3a3a3a] rounded-lg h-32 cursor-pointer hover:border-primary-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleImageUpload(e, 'heroImages')}
                    className="hidden"
                    disabled={uploadingImages['heroImages']}
                  />
                  {uploadingImages['heroImages'] ? (
                    <InlineSpinner size="sm" />
                  ) : (
                    <div className="text-center">
                      <Upload className="h-6 w-6 mx-auto text-gray-400 mb-1" />
                      <span className="text-xs text-gray-500">Add Image</span>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* Signature Collections */}
          <div className="bg-white dark:bg-[#191919] shadow-sm rounded-xl border border-gray-200 dark:border-[#3a3a3a] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1f1f1f]">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Layers className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
                  <h2 className="md:text-lg font-semibold text-gray-900 dark:text-white">
                    Signature Collections
                  </h2>
                </div>
                <button
                  onClick={() => setIsSignatureModalOpen(true)}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-primary-600 bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400 dark:hover:bg-primary-900/30"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Select Collections
                </button>
              </div>
            </div>
            <div className="p-6">
              {homepageData.signatureCollections.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No collections selected. Click &quot;Select Collections&quot; to add.
                </p>
              ) : (
                <div className="space-y-2">
                  {homepageData.signatureCollections.map(id => {
                    const collection = collections.find(c => c._id === id);
                    return collection ? (
                      <div
                        key={id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#1f1f1f] rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {collection.image && (
                            <Image
                              src={collection.image}
                              alt={collection.name}
                              width={48}
                              height={48}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {collection.name}
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            setHomepageData(prev => ({
                              ...prev,
                              signatureCollections: prev.signatureCollections.filter(
                                cid => cid !== id
                              ),
                            }))
                          }
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          </div>

        {/* Story Collections */}
        <div className="bg-white dark:bg-[#191919] shadow-sm rounded-xl border border-gray-200 dark:border-[#3a3a3a] overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1f1f1f]">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Layers className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
                <div>
                  <h2 className="md:text-lg font-semibold text-gray-900 dark:text-white">
                    Story Collections (Mobile)
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    These collections power the circular stories carousel on mobile.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsStoryModalOpen(true)}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-primary-600 bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400 dark:hover:bg-primary-900/30"
              >
                <Plus className="h-4 w-4 mr-1" />
                Select Collections
              </button>
            </div>
          </div>
          <div className="p-6">
            {homepageData.storyCollections.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No collections selected. Click &quot;Select Collections&quot; to add.
              </p>
            ) : (
              <div className="space-y-2">
                {homepageData.storyCollections.map(id => {
                  const collection = collections.find(c => c._id === id);
                  return collection ? (
                    <div
                      key={id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#1f1f1f] rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {collection.image && (
                          <Image
                            src={collection.image}
                            alt={collection.name}
                            width={48}
                            height={48}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {collection.name}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          setHomepageData(prev => ({
                            ...prev,
                            storyCollections: prev.storyCollections.filter(
                              cid => cid !== id
                            ),
                          }))
                        }
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : null;
                })}
              </div>
            )}
          </div>
        </div>

          {/* Freshly Minted */}
          <div className="bg-white dark:bg-[#191919] shadow-sm rounded-xl border border-gray-200 dark:border-[#3a3a3a] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1f1f1f]">
              <div className="flex items-center">
                <Sparkles className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
                <h2 className="md:text-lg font-semibold text-gray-900 dark:text-white">
                  Freshly Minted
                </h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Background Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Background Image
                </label>
                {homepageData.freshlyMinted.backgroundImage ? (
                  <div className="relative w-full h-48 mb-2">
                    <Image
                      src={homepageData.freshlyMinted.backgroundImage}
                      alt="Background"
                      fill
                      className="object-cover rounded-lg"
                    />
                    <button
                      onClick={() =>
                        setHomepageData(prev => ({
                          ...prev,
                          freshlyMinted: {
                            ...prev.freshlyMinted,
                            backgroundImage: '',
                          },
                        }))
                      }
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-[#3a3a3a] rounded-lg h-48 cursor-pointer hover:border-primary-500 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => handleImageUpload(e, 'backgroundImage')}
                      className="hidden"
                      disabled={uploadingImages['backgroundImage']}
                    />
                    {uploadingImages['backgroundImage'] ? (
                      <InlineSpinner size="sm" />
                    ) : (
                      <div className="text-center">
                        <Upload className="h-6 w-6 mx-auto text-gray-400 mb-1" />
                        <span className="text-xs text-gray-500">Upload Background</span>
                      </div>
                    )}
                  </label>
                )}
              </div>

              {/* Top Images */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Image 1 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Top Image 1
                  </label>
                  {homepageData.freshlyMinted.topImage1 ? (
                    <div className="relative w-full h-48 mb-2">
                      <Image
                        src={homepageData.freshlyMinted.topImage1}
                        alt="Top 1"
                        fill
                        className="object-cover rounded-lg"
                      />
                      <button
                        onClick={() =>
                          setHomepageData(prev => ({
                            ...prev,
                            freshlyMinted: {
                              ...prev.freshlyMinted,
                              topImage1: '',
                            },
                          }))
                        }
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-[#3a3a3a] rounded-lg h-48 cursor-pointer hover:border-primary-500 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handleImageUpload(e, 'topImage1')}
                        className="hidden"
                        disabled={uploadingImages['topImage1']}
                      />
                      {uploadingImages['topImage1'] ? (
                        <InlineSpinner size="sm" />
                      ) : (
                        <div className="text-center">
                          <Upload className="h-6 w-6 mx-auto text-gray-400 mb-1" />
                          <span className="text-xs text-gray-500">Upload Image</span>
                        </div>
                      )}
                    </label>
                  )}
                  <input
                    type="text"
                    placeholder="Title"
                    value={homepageData.freshlyMinted.topImage1Title}
                    onChange={e =>
                      setHomepageData(prev => ({
                        ...prev,
                        freshlyMinted: {
                          ...prev.freshlyMinted,
                          topImage1Title: e.target.value,
                        },
                      }))
                    }
                    className="mt-2 block w-full px-3 py-2 border border-gray-300 dark:border-[#3a3a3a] rounded-lg bg-white dark:bg-[#242424] text-gray-900 dark:text-white text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Link URL"
                    value={homepageData.freshlyMinted.topImage1Link}
                    onChange={e =>
                      setHomepageData(prev => ({
                        ...prev,
                        freshlyMinted: {
                          ...prev.freshlyMinted,
                          topImage1Link: e.target.value,
                        },
                      }))
                    }
                    className="mt-2 block w-full px-3 py-2 border border-gray-300 dark:border-[#3a3a3a] rounded-lg bg-white dark:bg-[#242424] text-gray-900 dark:text-white text-sm"
                  />
                </div>

                {/* Top Image 2 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Top Image 2
                  </label>
                  {homepageData.freshlyMinted.topImage2 ? (
                    <div className="relative w-full h-48 mb-2">
                      <Image
                        src={homepageData.freshlyMinted.topImage2}
                        alt="Top 2"
                        fill
                        className="object-cover rounded-lg"
                      />
                      <button
                        onClick={() =>
                          setHomepageData(prev => ({
                            ...prev,
                            freshlyMinted: {
                              ...prev.freshlyMinted,
                              topImage2: '',
                            },
                          }))
                        }
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-[#3a3a3a] rounded-lg h-48 cursor-pointer hover:border-primary-500 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handleImageUpload(e, 'topImage2')}
                        className="hidden"
                        disabled={uploadingImages['topImage2']}
                      />
                      {uploadingImages['topImage2'] ? (
                        <InlineSpinner size="sm" />
                      ) : (
                        <div className="text-center">
                          <Upload className="h-6 w-6 mx-auto text-gray-400 mb-1" />
                          <span className="text-xs text-gray-500">Upload Image</span>
                        </div>
                      )}
                    </label>
                  )}
                  <input
                    type="text"
                    placeholder="Title"
                    value={homepageData.freshlyMinted.topImage2Title}
                    onChange={e =>
                      setHomepageData(prev => ({
                        ...prev,
                        freshlyMinted: {
                          ...prev.freshlyMinted,
                          topImage2Title: e.target.value,
                        },
                      }))
                    }
                    className="mt-2 block w-full px-3 py-2 border border-gray-300 dark:border-[#3a3a3a] rounded-lg bg-white dark:bg-[#242424] text-gray-900 dark:text-white text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Link URL"
                    value={homepageData.freshlyMinted.topImage2Link}
                    onChange={e =>
                      setHomepageData(prev => ({
                        ...prev,
                        freshlyMinted: {
                          ...prev.freshlyMinted,
                          topImage2Link: e.target.value,
                        },
                      }))
                    }
                    className="mt-2 block w-full px-3 py-2 border border-gray-300 dark:border-[#3a3a3a] rounded-lg bg-white dark:bg-[#242424] text-gray-900 dark:text-white text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Currently Trending */}
          <div className="bg-white dark:bg-[#191919] shadow-sm rounded-xl border border-gray-200 dark:border-[#3a3a3a] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1f1f1f]">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
                <h2 className="md:text-lg font-semibold text-gray-900 dark:text-white">
                  Currently Trending
                </h2>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                This section automatically shows collections whose products have been sold recently.
                If only 1 collection has sales, 2 random collections will be added.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={homepageData.trendingConfig.enabled}
                      onChange={e =>
                        setHomepageData(prev => ({
                          ...prev,
                          trendingConfig: {
                            ...prev.trendingConfig,
                            enabled: e.target.checked,
                          },
                        }))
                      }
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Enable Trending Section
                    </span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Days to Look Back
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={homepageData.trendingConfig.daysBack}
                    onChange={e =>
                      setHomepageData(prev => ({
                        ...prev,
                        trendingConfig: {
                          ...prev.trendingConfig,
                          daysBack: parseInt(e.target.value) || 30,
                        },
                      }))
                    }
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-[#3a3a3a] rounded-lg bg-white dark:bg-[#242424] text-gray-900 dark:text-white text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* World of Caelvi */}
          <div className="bg-white dark:bg-[#191919] shadow-sm rounded-xl border border-gray-200 dark:border-[#3a3a3a] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1f1f1f]">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Globe className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
                  <h2 className="md:text-lg font-semibold text-gray-900 dark:text-white">
                    The World of Caelvi
                  </h2>
                </div>
                <button
                  onClick={() => setIsWorldModalOpen(true)}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-primary-600 bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400 dark:hover:bg-primary-900/30"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Select Collections
                </button>
              </div>
            </div>
            <div className="p-6">
              {homepageData.worldOfCaelviCollections.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No collections selected. Click &quot;Select Collections&quot; to add.
                </p>
              ) : (
                <div className="space-y-2">
                  {homepageData.worldOfCaelviCollections.map(id => {
                    const collection = collections.find(c => c._id === id);
                    return collection ? (
                      <div
                        key={id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#1f1f1f] rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {collection.image && (
                            <Image
                              src={collection.image}
                              alt={collection.name}
                              width={48}
                              height={48}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {collection.name}
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            setHomepageData(prev => ({
                              ...prev,
                              worldOfCaelviCollections: prev.worldOfCaelviCollections.filter(
                                cid => cid !== id
                              ),
                            }))
                          }
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Collection Selection Modals */}
        <CollectionSelectionModal
          isOpen={isSignatureModalOpen}
          onClose={() => setIsSignatureModalOpen(false)}
          collections={collections.filter(c => c.isActive)}
          selectedCollections={homepageData.signatureCollections}
          onSave={ids => handleCollectionSelection(ids, 'signature')}
        />

        <CollectionSelectionModal
          isOpen={isStoryModalOpen}
          onClose={() => setIsStoryModalOpen(false)}
          collections={collections.filter(c => c.isActive)}
          selectedCollections={homepageData.storyCollections}
          onSave={ids => handleCollectionSelection(ids, 'story')}
          maxSelection={8}
        />

        <CollectionSelectionModal
          isOpen={isWorldModalOpen}
          onClose={() => setIsWorldModalOpen(false)}
          collections={collections.filter(c => c.isActive)}
          selectedCollections={homepageData.worldOfCaelviCollections}
          onSave={ids => handleCollectionSelection(ids, 'world')}
        />
      </div>
    </div>
  );
}

