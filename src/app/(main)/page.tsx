'use client';

import dynamic from 'next/dynamic';
import Container from './components/layouts/Container';
import { Devider } from './assets/Common';

// Critical above-the-fold components - load immediately
import Hero from './components/home/Hero';
import CircleCategories from './components/home/Category';

// Lazy load below-the-fold components - only load when user scrolls
const CategoryGrid = dynamic(() => import('./components/home/CategoryGrid'), {
  ssr: true, // SSR for SEO
});

const AnimatedCards = dynamic(() => import('./components/home/AnimatedCards'), {
  ssr: true,
});

const ImageGrid = dynamic(() => import('./components/home/ImageGrid'), {
  ssr: true,
});

const Trending = dynamic(() => import('./components/home/Trending'), {
  ssr: true,
});

const NewArrival = dynamic(() => import('./components/home/NewArrival'), {
  ssr: true,
});

const EvaraeWorld = dynamic(() => import('./components/home/EvaraeWorld'), {
  ssr: true,
});

const OurPromise = dynamic(() => import('./components/home/Assurance'), {
  ssr: true,
});

export default function Home() {
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
