import { FlowerCombo, FlowerMini, FlowerTail } from "@/app/assets/Common";

export default function SectionDivider() {
  return (
    <div className="flex items-center justify-center lg:gap-2 gap-10 flex-col lg:flex-row mt-20">
      <div className="lg:flex items-center hidden">
        <div>
          <FlowerTail />
        </div>
        <div>
          <FlowerMini />
        </div>
      </div>

      <div className="block lg:hidden">
        <FlowerCombo className="w-full h-7" />
      </div>

      <div className="text-center break-words text-muted-foreground max-w-md">
        Trust us to be part of your precious moments and to deliver jewellery
        that you&apos;ll cherish forever.
      </div>

      <div className="block lg:hidden">
        <FlowerCombo className="w-full h-7" />
      </div>

      <div className="lg:flex items-center hidden">
        <div>
          <FlowerMini />
        </div>
        <div className="rotate-180">
          <FlowerTail />
        </div>
      </div>
    </div>
  );
}
