import Image from "next/image";
import Link from "next/link";
import Container from "../layouts/Container";

const categories = [
  {
    name: "Rings",
    image:
      "https://www.tanishq.co.in/dw/image/v2/BKCK_PRD/on/demandware.static/-/Library-Sites-TanishqSharedLibrary/default/dw47da8133/homepage/shopByCategory/rings-cat.jpg",
  },
  {
    name: "Earrings",
    image:
      "https://www.tanishq.co.in/dw/image/v2/BKCK_PRD/on/demandware.static/-/Library-Sites-TanishqSharedLibrary/default/dw83758477/homepage/shopByCategory/earrings-cat.jpg",
  },
  {
    name: "Pendants",
    image:
      "https://www.tanishq.co.in/dw/image/v2/BKCK_PRD/on/demandware.static/-/Library-Sites-TanishqSharedLibrary/default/dw63553376/homepage/shopByCategory/pendants-cat.jpg",
  },
  {
    name: "Necklaces",
    image:
      "https://www.tanishq.co.in/dw/image/v2/BKCK_PRD/on/demandware.static/-/Library-Sites-TanishqSharedLibrary/default/dw442a2739/homepage/shopByCategory/mangalsutra-cat.jpg",
  },
  {
    name: "Bangles",
    image:
      "https://www.tanishq.co.in/dw/image/v2/BKCK_PRD/on/demandware.static/-/Library-Sites-TanishqSharedLibrary/default/dw1226b98b/homepage/shopByCategory/bangles-cat.jpg",
  },
  {
    name: "Chains",
    image:
      "https://www.tanishq.co.in/dw/image/v2/BKCK_PRD/on/demandware.static/-/Library-Sites-TanishqSharedLibrary/default/dwd0550e4c/homepage/shopByCategory/chains-cat.jpg",
  },
];

const ShopByCategory = () => {
  return (
    <section className="py-16">
      <Container>
        <h2 className="text-3xl font-bold text-center mb-8">
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {categories.map((category) => (
            <Link
              href={`/category/${category.name.toLowerCase()}`}
              key={category.name}
              className="group flex flex-col items-center"
            >
              <div className="w-32 h-32 rounded-full overflow-hidden mb-4 transition-transform duration-300 group-hover:scale-105">
                <Image
                  src={category.image}
                  alt={category.name}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-semibold">{category.name}</h3>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default ShopByCategory;
