import Link from "next/link";
import { Sparkles } from "lucide-react"; // You can replace with your own icons

const collections = [
  "Wedding Collection",
  "Party Wear",
  "Casual Wear",
  "Office Wear",
  "Traditional",
  "Modern",
];

const featuredCollection = {
  title: "Timeless Wedding Styles",
  desc: "Celebrate your big day with elegance, tradition, and unmatched design intricacy.",
};

const quickLinks = ["New Arrivals", "Festive Edit", "Luxury Essentials"];

export default function CollectionsMenu() {
  return (
    <div
      className="bg-white rounded-b-xl"
      style={{
        boxShadow: "rgba(0, 0, 0, 0.2) 0px 4px 12px",
        clipPath: "inset(0px -30px -38px)",
      }}
    >
      <div className="grid grid-cols-12 px-8 py-10 gap-8">
        {/* Left: Collection Tiles */}
        <div className="col-span-4 grid grid-cols-2 gap-4">
          {collections.map((name) => (
            <Link
              key={name}
              href="#"
              className="group flex items-center justify-center text-center bg-[#fdf4f5] text-dark rounded-lg h-20 text-sm px-3 py-2 hover:bg-primary/10 transition font-medium"
            >
              <span className="group-hover:text-primary transition">
                {name}
              </span>
            </Link>
          ))}
        </div>

        {/* Center: Featured Collection */}
        <div className="col-span-5 flex flex-col justify-center bg-[#f6e6e9] rounded-lg p-6 shadow-inner">
          <div className="mb-3">
            <Sparkles className="h-6 w-6 text-primary mb-2" />
            <h4 className="text-lg font-heading text-heading mb-2">
              {featuredCollection.title}
            </h4>
            <p className="text-sm text-dark">{featuredCollection.desc}</p>
          </div>
          <Link
            href="#"
            className="inline-block mt-4 btn btn-filled text-xs px-4 py-2"
          >
            Shop Featured
          </Link>
        </div>

        {/* Right: Quick Links */}
        <div className="col-span-3">
          <h4 className="text-sm font-semibold text-primary-dark mb-4 tracking-wide font-heading">
            Explore More
          </h4>
          <ul className="space-y-3">
            {quickLinks.map((item) => (
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
  );
}
