"use client";

import {
  AppStore,
  FooterLogo,
  PlayStore,
  QRCode,
  Visa,
  Mastercard,
  Paypal,
  AmericanExpress,
  DinersClub,
  Maestro,
  Pillar,
  Main,
} from "@/app/assets/Footer";
import Container from "./Container";
import {
  FaFacebookF,
  FaYoutube,
  FaInstagram,
  FaXTwitter,
  FaWhatsapp,
} from "react-icons/fa6";
import { IoIosChatbubbles } from "react-icons/io";
import { MdEmail } from "react-icons/md";
export default function Footer() {
  return (
    <footer className="relative m-4 mt-[100px]">
      <img
        src={Main.src}
        alt="footer-bg"
        className="absolute -top-[36px] h-[42px] md:-top-[60px] md:h-[70px] left-[50%] translate-x-[-50%]"
      />
      <img
        src={Pillar.src}
        alt="footer-bg"
        className="absolute -top-[35px] h-[42px] md:-top-[79px] md:h-[91px] left-[10px]"
      />
      <img
        src={Pillar.src}
        alt="footer-bg"
        className="absolute -top-[35px] h-[42px] md:-top-[79px] md:h-[91px] right-[10px]"
      />
      <img
        src={Pillar.src}
        alt="footer-bg"
        className="absolute -top-[25px] h-[42px] md:-top-[55px] md:h-[91px] left-[70px]"
      />{" "}
      <img
        src={Pillar.src}
        alt="footer-bg"
        className="absolute -top-[25px] h-[42px] md:-top-[55px] md:h-[91px] right-[70px]"
      />
      <div className="bg-gradiant text-white  md:py-16 py-5 rounded-lg">
        <Container>
          {/* Logo */}
          <div className=" mb-10 text-3xl">
            <FooterLogo className="md:h-20 h-5" />
          </div>

          {/* Main grid */}
          <div className="flex flex-col md:flex-row gap-10">
            {/* QR & App buttons */}
            <div className="flex flex-col  items-center gap-4">
              <h1 className="lg:text-2xl text-lg md:text-xl font-heading text-center">
                Download the Tanishq App Now
              </h1>
              <QRCode className="max-md:max-h-40 h-52" />
              <div className="flex gap-4 mt-2 max-sm:flex-col">
                <PlayStore />
                <AppStore />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-6 justify-between max-md:text-center w-full">
              <div>
                <h3 className=" lg:text-2xl text-lg md:text-xl font-heading mb-2">
                  Useful Links
                </h3>
                <ul className="space-y-2 text-sm md:text-base  text-white/80">
                  <li>Delivery Information</li>
                  <li>International Shipping</li>
                  <li>Payment Options</li>
                  <li>Track your Order</li>
                  <li>Returns</li>
                  <li>Find a Store</li>
                </ul>
              </div>

              {/* Information */}
              <div>
                <h3 className="lg:text-2xl text-lg md:text-xl font-heading mb-2">
                  Information
                </h3>
                <ul className="space-y-2 text-sm md:text-base text-white/80">
                  <li>Blog</li>
                  <li>Offers & Contest Details</li>
                  <li>Help & FAQs</li>
                  <li>About Tanishq</li>
                </ul>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="lg:text-2xl text-lg md:text-xl font-heading mb-2">
                  Contact Us
                </h3>
                <div className="flex flex-col">
                  <p className=" text-white/80 text-sm md:text-base">
                    1800-266-0123
                  </p>
                  <h3 className=" lg:text-2xl text-lg md:text-xl font-heading mt-5 mb-2">
                    Chat With Us
                  </h3>
                  <p className=" md:border-b border-white/80 md:w-fit md:pb-4 md:mb-4 text-sm md:text-base  text-white/80">
                    +91 8147349242
                  </p>
                  <div className="w-full flex justify-center min-md:hidden">
                    <hr className="border-white/20 my-3 w-20" />
                  </div>
                  <div className="flex max-md:justify-center gap-4 text-xl  text-white/80">
                    <FaWhatsapp />
                    <MdEmail />
                    <IoIosChatbubbles />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Social & Payments */}
          <hr className="border-white/20 my-6" />
          <div className="lg:flex justify-between items-center text-sm space-y-4 lg:space-y-0">
            <div className="flex max-md:justify-center items-center gap-4">
              <span className="lg:text-2xl text-lg md:text-xl font-heading">
                Social
              </span>
              <div className="flex gap-3 text-xl">
                <FaInstagram />
                <FaXTwitter />
                <FaFacebookF />
                <FaYoutube />
              </div>
            </div>
            <div className="flex justify-center lg:justify-start gap-4 flex-wrap">
              <Visa />
              <Mastercard />
              <Paypal />
              <AmericanExpress />
              <DinersClub />
              <Maestro />
            </div>
          </div>

          {/* Footer Bottom */}
          <hr className="border-white/20 my-6" />
          <div className="flex flex-col lg:flex-row justify-between items-center text-xs text-white/70 gap-2">
            <p>© 2025 Titan Company Limited. All Rights Reserved.</p>
            <div className="flex gap-4">
              <p>Terms & Conditions</p>
              <p>Privacy Policy</p>
              <p>Disclaimer</p>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
}
