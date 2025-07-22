import Image from "next/image";
import Link from "next/link";
import Container from "../layouts/Container";

const products = [
  {
    name: "Elegant Diamond Ring",
    image:
      "https://www.tanishq.co.in/dw/image/v2/BKCK_PRD/on/demandware.static/-/Library-Sites-TanishqSharedLibrary/default/dw47da8133/homepage/shopByCategory/rings-cat.jpg",
    price: "₹ 50,000",
  },
  {
    name: "Gold Bangle",
    image:
      "https://www.tanishq.co.in/dw/image/v2/BKCK_PRD/on/demandware.static/-/Library-Sites-TanishqSharedLibrary/default/dw47da8133/homepage/shopByCategory/rings-cat.jpg",
    price: "₹ 80,000",
  },
  {
    name: "Pearl Necklace",
    image:
      "https://www.tanishq.co.in/dw/image/v2/BKCK_PRD/on/demandware.static/-/Library-Sites-TanishqSharedLibrary/default/dw47da8133/homepage/shopByCategory/rings-cat.jpg",
    price: "₹ 1,20,000",
  },
  {
    name: "Sapphire Earrings",
    image:
      "https://www.tanishq.co.in/dw/image/v2/BKCK_PRD/on/demandware.static/-/Library-Sites-TanishqSharedLibrary/default/dw47da8133/homepage/shopByCategory/rings-cat.jpg",
    price: "₹ 75,000",
  },
  {
    name: "Ruby Pendant",
    image:
      "https://www.tanishq.co.in/dw/image/v2/BKCK_PRD/on/demandware.static/-/Library-Sites-TanishqSharedLibrary/default/dw47da8133/homepage/shopByCategory/rings-cat.jpg",
    price: "₹ 40,000",
  },
];

const NewForYou = () => {
  return (
    <section className="py-16 bg-gray-50">
      <Container>
        <h2 className="text-3xl font-bold text-center mb-8">New For You</h2>
        <div className="flex overflow-x-auto space-x-8 pb-4">
          {products.map((product) => (
            <div key={product.name} className="flex-shrink-0 w-64">
              <Link href="#" className="group">
                <div className="relative overflow-hidden rounded-lg">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={256}
                    height={256}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <p className="text-md text-gray-600">{product.price}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default NewForYou;
