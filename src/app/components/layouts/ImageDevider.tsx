import React from "react";
import { Devider } from "@/app/assets/Common";
import Image from "next/image";
const ImageDevider = () => {
  return (
    <>
      <Image src={Devider} alt="divider" className="w-full md:hidden  my-8" />
    </>
  );
};

export default ImageDevider;
