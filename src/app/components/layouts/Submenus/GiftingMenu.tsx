import Image from "next/image";
import Link from "next/link";
import {
  Gifting,
  Wedding,
  DailyWear,
  Diamond,
} from "@/app/assets/NavigationMenu";
import { pendantsCat } from "@/app/assets/CategoryGrid"; // Your gifting banner image

const giftOccasions = [
  { label: "Birthday", icon: Wedding },
  { label: "Anniversary", icon: DailyWear },
  { label: "Weddings", icon: Wedding },
  { label: "Festivals", icon: Gifting },
  { label: "Just Because", icon: Diamond },
  { label: "Corporate Gifting", icon: Gifting },
];

const giftCombos = [
  "Golden Bloom Set",
  "Elegant Minimalist Duo",
  "Me & You Twin Rings",
];

export default function GiftingMenu() {
  return (
    <div
      className="bg-white rounded-b-xl"
      style={{
        boxShadow: "rgba(0, 0, 0, 0.20) 0px 4px 12px",
        clipPath: "inset(0px -30px -38px)",
      }}
    >
      <div className="grid grid-cols-12 px-8 py-10 gap-8">
        {/* Left Panel: Gift by Occasion */}
        <div className="col-span-4">
          <h4 className="text-sm font-semibold text-primary-dark mb-4 tracking-wide font-heading">
            Gifts by Occasion
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {giftOccasions.map((item) => (
              <Link
                href="#"
                key={item.label}
                className="group flex items-center gap-3 px-3 py-2 rounded-lg bg-[#fdf4f5] hover:bg-primary/10 transition"
              >
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-200/50 group-hover:bg-primary/10 transition-all">
                  <item.icon className="h-5 w-5 text-primary-dark group-hover:text-primary transition-colors" />
                </div>
                <span className="text-sm group-hover:text-primary transition-colors">
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Center: Gift Banner + Guide */}
        <div className="col-span-5 flex flex-col justify-between">
          {/* Banner */}
          <div className="relative rounded-lg overflow-hidden shadow-md group h-48">
            <Image
              src={pendantsCat}
              alt="Curated Gift Sets"
              className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 p-5 z-10">
              <h3 className="text-lg font-bold text-white">
                Wrapped with Love
              </h3>
              <p className="text-sm text-gray-200">
                Curated gift sets for moments that matter.
              </p>
              <p className="mt-2 text-sm text-white font-semibold">
                Explore Gift Sets &rarr;
              </p>
            </div>
          </div>

          {/* Mini Gift Guide */}
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-heading mb-3">
              Quick Gift Guide
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {["Under ₹1999", "Top Picks", "Express Delivery"].map((label) => (
                <Link
                  key={label}
                  href="#"
                  className="text-xs text-center rounded border px-3 py-2 hover:bg-primary/10 transition text-dark font-medium"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel: Combos + Promo */}
        <div className="col-span-3 flex flex-col justify-between">
          {/* Special Promo */}
          <div className="bg-[#f6e6e9] rounded-lg p-4 shadow-sm">
            <h4 className="text-sm font-semibold text-heading mb-2">
              Festive Gift Deal
            </h4>
            <p className="text-xs text-dark mb-4">
              Save <span className="font-bold text-primary">₹500</span> on
              combos above ₹3999. Limited time!
            </p>
            <Link href="#" className="btn btn-filled text-xs px-4 py-2">
              Send a Gift
            </Link>
          </div>

          {/* Favorite Gift Combos */}
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-heading mb-3">
              Popular Gift Combos
            </h4>
            <ul className="space-y-2">
              {giftCombos.map((item) => (
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
