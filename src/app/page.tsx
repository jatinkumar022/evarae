import Hero from "./components/home/Hero";
import Container from "./components/layouts/Container";

export default function Home() {
  return (
    <>
      <Hero />
      <div className="mt-10 h-[calc(100vh-106px)]">
        <Container>
          <div className="heading-component-main-container">
            <h1 className="heading-component-main-heading">
              Tanishq Collections
            </h1>
            <h2 className="heading-component-main-subheading">
              Explore our newly launched collection
            </h2>
          </div>
        </Container>
      </div>
    </>
  );
}
