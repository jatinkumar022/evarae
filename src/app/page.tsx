import Hero from './components/home/Hero';
import Container from './components/layouts/Container';
import ImageGrid from './components/home/ImageGrid';
import CategoryGrid from './components/home/CategoryGrid';
import Trending from './components/home/Trending';
import AnimatedCards from './components/home/AnimatedCards';
import EvaraeWorld from './components/home/EvaraeWorld';
import NewArrival from './components/home/NewArrival';
// import Styling101Carousel from "./components/home/VideoSlider";
import OurPromise from './components/home/Assurance';
import SectionDivider from './components/layouts/SectionDivider';
import CircleCategories from './components/home/Category';
import { Devider } from './assets/Common';

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
        {/* <Styling101Carousel /> */}
      </Container>
      <Container>
        <SectionDivider />
        <OurPromise />
      </Container>
    </>
  );
}
