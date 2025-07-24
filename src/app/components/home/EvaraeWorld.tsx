import Image from "next/image";
import { wedding, gold, diamond, dailywear } from "@/app/assets/EvaraeWorld";

const categories = [
  {
    href: "",
    src: wedding,
    alt: "Wedding",
    label: "Wedding",
  },
  {
    href: "",
    src: gold,
    alt: "Gold",
    label: "Gold",
  },
  {
    href: "",
    src: diamond,
    alt: "Diamond",
    label: "Diamond",
  },
  {
    href: "",
    src: dailywear,
    alt: "Dailywear",
    label: "Dailywear",
  },
];

const CategoryCard = ({ href, src, alt, label }: (typeof categories)[0]) => (
  <div className="relative">
    <a href={href} className={``}>
      <Image
        src={src}
        alt={alt}
        className="max-w-[100%] h-auto w-[100%] rounded-[12px]"
      />
      <div className="absolute bottom-0 w-full rounded-[10px] h-[44px] md:h-24 lg:h-32 bg-[linear-gradient(360deg,rgba(131,39,41,1)_0%,rgba(131,39,41,0.95)_5%,rgba(131,39,41,0)_100%)]">
        <p className="absolute bottom-[10px] md:bottom-[20px] lg:bottom-[30px] w-full flex justify-center text-white text-[16px] md:text-[20px] lg:text-[30px] font-medium capitalize font-[Fraunces,serif]">
          {label}
        </p>
      </div>
    </a>
  </div>
);

export default function EvaraeWorld() {
  return (
    <section>
      <div className="heading-component-main-container">
        <h1 className="heading-component-main-heading">Evarae World</h1>
        <h2 className="heading-component-main-subheading">
          Explore the World of Evarae
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-2">
          <CategoryCard {...categories[0]} />
          <CategoryCard {...categories[1]} />
        </div>
        <div className="flex flex-col gap-2">
          <CategoryCard {...categories[2]} />
          <CategoryCard {...categories[3]} />
        </div>
      </div>
    </section>
  );
}
