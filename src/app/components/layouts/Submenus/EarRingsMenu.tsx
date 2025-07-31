import Image from "next/image";
import Link from "next/link";
import { earringsCat } from "@/app/assets/CategoryGrid"; // Replace with actual earrings image

const earringCategories = [
  "Stud Earrings",
  "Danglers & Drops",
  "Hoops",
  "Jhumkas",
  "Ear Cuffs",
  "Shoulder Grazers",
];

const favoriteEarrings = [
  "Rose Drop Jhumkas",
  "Gold Twist Hoops",
  "Pearl Stud Trio",
];

export default function EarringsMenu() {
  return (
    <div
      className="bg-white rounded-b-xl"
      style={{
        boxShadow: "rgba(0, 0, 0, 0.20) 0px 4px 12px",
        clipPath: "inset(0px -30px -38px)",
      }}
    >
      <div className="grid grid-cols-12 px-8 py-10 gap-8">
        {/* Left: Earring Types Grid */}
        <div className="col-span-4 grid grid-cols-2 gap-4">
          {earringCategories.map((name) => (
            <Link
              href="#"
              key={name}
              className="group flex items-center justify-center text-center bg-[#fdf4f5] text-dark rounded-lg h-20 text-sm px-3 py-2 hover:bg-primary/10 transition font-medium"
            >
              <span className="group-hover:text-primary transition">
                {name}
              </span>
            </Link>
          ))}
        </div>

        {/* Center: Banner */}
        <div className="col-span-5 relative rounded-lg overflow-hidden shadow-md group">
          <Image
            src={earringsCat}
            alt="Earrings Collection"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="relative z-10 p-6 flex flex-col justify-end h-full">
            <h3 className="text-lg font-bold text-white">
              Drape Your Ears in Art
            </h3>
            <p className="mt-1 text-sm text-gray-200">
              From delicate studs to dramatic drops, express yourself.
            </p>
            <p className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-white">
              Browse Earrings
              <span className="transform transition-transform group-hover:translate-x-1">
                &rarr;
              </span>
            </p>
          </div>
        </div>

        {/* Right: Offers + Favorites */}
        <div className="col-span-3 flex flex-col justify-between">
          {/* Seasonal Deal */}
          <div className="bg-[#f6e6e9] rounded-lg p-4 shadow-sm">
            <h4 className="text-sm font-semibold text-heading mb-2">
              Limited Time Deal
            </h4>
            <p className="text-xs text-dark mb-4">
              Buy 2 Get 1 Free on select{" "}
              <span className="font-bold text-primary">Earring Sets</span>.
            </p>
            <Link href="#" className="btn btn-filled text-xs px-4 py-2">
              Shop Now
            </Link>
          </div>

          {/* Favorites */}
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-heading mb-3">
              Most Adored Earrings
            </h4>
            <ul className="space-y-2">
              {favoriteEarrings.map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-sm text-dark hover:text-primary transition"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
