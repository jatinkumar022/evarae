'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import Container from './components/layouts/Container';
import Hero from './components/home/Hero';
import CircleCategories from './components/home/Category';
import { Devider } from './assets/Common';
import { useHomepageStore } from '@/lib/data/mainStore/homepageStore';
import { usePublicCategoryStore } from '@/lib/data/mainStore/categoryStore';

// Dynamically import heavy components to improve initial page load
// These will be code-split and loaded on demand, while still supporting SSR
const CategoryGrid = dynamic(() => import('./components/home/CategoryGrid'));

const AnimatedCards = dynamic(() => import('./components/home/AnimatedCards'));

const ImageGrid = dynamic(() => import('./components/home/ImageGrid'));

const Trending = dynamic(() => import('./components/home/Trending'));

const NewArrival = dynamic(() => import('./components/home/NewArrival'));

const EvaraeWorld = dynamic(() => import('./components/home/EvaraeWorld'));

const OurPromise = dynamic(() => import('./components/home/Assurance'));

export default function Home() {
  const { fetchHomepage, data: homepageData } = useHomepageStore();
  const { setCategoriesFromHomepage } = usePublicCategoryStore();

  // Load homepage data once for all child components
  useEffect(() => {
    fetchHomepage();
    // Zustand actions are stable, but we only want this to run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync categories from homepage to category store (so navbar can use them)
  useEffect(() => {
    if (homepageData?.categories && homepageData.categories.length > 0) {
      // Map homepage categories to category store format
      const mappedCategories = homepageData.categories.map(cat => ({
        _id: cat._id,
        name: cat.name,
        slug: cat.slug,
        image: cat.image,
        description: cat.description,
        banner: cat.banner,
        mobileBanner: cat.mobileBanner,
        isActive: true,
        productCount: 0,
        sortOrder: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      setCategoriesFromHomepage(mappedCategories);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [homepageData?.categories]);

  return (
    <>
      <Container>
        <CircleCategories />
      </Container>

      <div className="w-full xl:max-w-screen-xl mx-auto md:px-6">
        <Hero />
      </div>
      <Container>
        <div className="my-16 md:hidden">
          <Devider className="w-full " />
        </div>

        <CategoryGrid />
        <AnimatedCards />
        <ImageGrid />
        <Trending />
      </Container>
      <NewArrival />

      <Container>
        <EvaraeWorld />
      </Container>
      <Container>
        <OurPromise />
      </Container>
    </>
  );
}
