import Link from "next/link";
import Container from "../layouts/Container";

const ConnectWithUs = () => {
  return (
    <section className="py-16 bg-primary text-white">
      <Container>
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Connect with Us</h2>
          <p className="mb-8">
            Follow us on social media and subscribe to our newsletter for the
            latest updates.
          </p>
          <div className="flex justify-center gap-6 mb-8">
            <Link href="#" className="text-2xl">
              FB
            </Link>
            <Link href="#" className="text-2xl">
              IG
            </Link>
            <Link href="#" className="text-2xl">
              TW
            </Link>
          </div>
          <div className="flex justify-center">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-4 py-2 w-full max-w-sm text-black"
            />
            <button className="bg-white text-primary px-6 py-2">
              Subscribe
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default ConnectWithUs;
