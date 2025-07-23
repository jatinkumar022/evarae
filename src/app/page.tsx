import Hero from "./components/home/Hero";
import Container from "./components/layouts/Container";
import ImageGrid from "./components/home/ImageGrid";
import CircleCategories from "./components/home/Category";
import { Devider } from "./assets/Common";
import Image from "next/image";
import CategoryGrid from "./components/home/CategoryGrid";

export default function Home() {
  return (
    <>
      <CircleCategories />
      <Hero />
      <div className="">
        <Container className="my-10">
          <Image src={Devider} alt="divider" className="w-full md:hidden" />

          <ImageGrid />
          <CategoryGrid />
        </Container>
      </div>
    </>
  );
}
