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
import Assurance from "./components/home/Assurance";
import Gift from "./components/home/Gift";
import { FlowerCombo, FlowerMini, FlowerTail } from "./assets/Common";
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
        <Assurance />
        <Container>
          <div className="flex items-center justify-center lg:gap-2  gap-10 flex-col lg:flex-row  my-20">
            <div className=" lg:flex items-center hidden ">
              <div>
                <FlowerTail />
              </div>
              <div>
                <FlowerMini />
              </div>
            </div>

            <div className=" block lg:hidden ">
              <FlowerCombo className="w-full h-7" />
            </div>

            <div className="text-center break-words">
              Trust us to be part of your precious moments and to deliver
              jewellery that you'll cherish forever.
            </div>
            <div className=" block lg:hidden ">
              <FlowerCombo className="w-full h-7" />
            </div>

            <div className="lg:flex items-center hidden ">
              <div>
                <FlowerMini />
              </div>
              <div className="rotate-180">
                <FlowerTail />
              </div>
            </div>
          </div>

          <Gift />
        </Container>
      </div>
    </>
  );
}
