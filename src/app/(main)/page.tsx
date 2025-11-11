import dynamic from 'next/dynamic';
import Container from './components/layouts/Container';
import Hero from './components/home/Hero';
import CircleCategories from './components/home/Category';
import { Devider } from './assets/Common';

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
