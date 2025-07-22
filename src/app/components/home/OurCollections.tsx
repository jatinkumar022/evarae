import Image from "next/image";
import Link from "next/link";
import Container from "../layouts/Container";

const collections = [
  {
    name: "Mia",
    image:
      "https://www.tanishq.co.in/dw/image/v2/BKCK_PRD/on/demandware.static/-/Library-Sites-TanishqSharedLibrary/default/dw47da8133/homepage/shopByCategory/rings-cat.jpg",
    description: "Modern jewellery for the working woman",
  },
  {
    name: "Rivaah",
    image:
      "https://www.tanishq.co.in/dw/image/v2/BKCK_PRD/on/demandware.static/-/Library-Sites-TanishqSharedLibrary/default/dw47da8133/homepage/shopByCategory/rings-cat.jpg",
    description: "Exquisite wedding jewellery",
  },
  {
    name: "Zoya",
    image:
      "https://www.tanishq.co.in/dw/image/v2/BKCK_PRD/on/demandware.static/-/Library-Sites-TanishqSharedLibrary/default/dw47da8133/homepage/shopByCategory/rings-cat.jpg",
    description: "Luxury jewellery with a story",
  },
];

const OurCollections = () => {
  return (
    <section className="py-16">
      <Container>
        <h2 className="text-3xl font-bold text-center mb-8">Our Collections</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {collections.map((collection) => (
            <Link
              href={`/collections/${collection.name.toLowerCase()}`}
              key={collection.name}
              className="group"
            >
              <div className="relative overflow-hidden rounded-lg">
                <Image
                  src={collection.image}
                  alt={collection.name}
                  width={400}
                  height={400}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-xl font-bold">{collection.name}</h3>
                <p className="text-md text-gray-600">
                  {collection.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default OurCollections;
