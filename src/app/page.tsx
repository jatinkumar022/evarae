import Hero from "./components/home/Hero";
import Container from "./components/layouts/Container";
import ImageGrid from "./components/home/ImageGrid";
import CircleCategories from "./components/home/Category";

import CategoryGrid from "./components/home/CategoryGrid";
import Trending from "./components/home/Trending";
import ImageDevider from "./components/layouts/ImageDevider";
import AnimatedCards from "./components/home/AnimatedCards";
import EvaraeWorld from "./components/home/EvaraeWorld";
import NewArrival from "./components/home/NewArrival";
import Styling101Carousel from "./components/home/VideoSlider";

export default function Home() {
  return (
    <>
      <CircleCategories />
      <Hero />
      <div className="">
        <Container>
          <ImageDevider />

          <ImageGrid />
          <AnimatedCards />
          <CategoryGrid />
          <ImageDevider />
          <Trending />
          <EvaraeWorld />
        </Container>
        <NewArrival />
        <Container>
          <ImageDevider />

          <Styling101Carousel />
        </Container>
      </div>
    </>
  );
}
