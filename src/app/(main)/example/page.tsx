import Container from '@/app/(main)/components/layouts/Container';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      {/* Top Navbar Test */}
      <div className="navbar-top p-4">
        <Container>
          <h2>Navbar Top</h2>
        </Container>
      </div>

      {/* Bottom Navbar Test */}
      <div className="navbar-bottom p-2 text-sm">
        <Container>
          <p>
            Navbar Bottom — <Link href="#">Hover Me</Link>
          </p>
        </Container>
      </div>

      <main className="min-h-screen bg-white py-8">
        <Container>
          {/* Typography Test */}
          <section className="section border-b mb-6">
            <h1>Heading 1</h1>
            <h2>Heading 2</h2>
            <h3>Heading 3</h3>
            <p>This is a paragraph using body font.</p>
            <ul>
              <li>List item one</li>
              <li>List item two</li>
            </ul>
          </section>

          {/* Buttons Test */}
          <section className="section border-b mb-6">
            <button
              className="btn btn-filled"
              aria-label="Filled button example"
            >
              Filled Button
            </button>
            <button
              className="btn btn-accent"
              aria-label="Accent button example"
            >
              Accent Button
            </button>
            <button
              className="btn btn-outline"
              aria-label="Outline button example"
            >
              Outline Button
            </button>
            <button className="btn btn-ghost" aria-label="Ghost button example">
              Ghost Button
            </button>
            <button
              className="btn-animated"
              aria-label="Animated filled button example"
            >
              Animated Filled
            </button>
          </section>

          {/* Menu Dropdown Test */}
          <section className="section border-b mb-6">
            <h2>Menu Dropdown</h2>
            <div className="menu-dropdown p-4 w-fit">
              <p>This is a dropdown content box</p>
            </div>
          </section>

          {/* Cart Total Test */}
          <section className="section border-b mb-6">
            <h2>Cart Total</h2>
            <div className="cart-total mt-2">
              <p>Subtotal: ₹10,000</p>
              <p>Tax: ₹500</p>
              <p>Total: ₹10,500</p>
            </div>
          </section>

          {/* Close Button Test */}
          <section className="section border-b mb-6">
            <h2>Close Button</h2>
            <button className="btn-close" aria-label="Close dialog">
              <span className="sr-only">Close</span>✕
            </button>
          </section>

          {/* Utility Class Test */}
          <section className="section">
            <h2>Utility Classes</h2>
            <p className="text-primary">This text uses `.text-primary`</p>
            <p className="text-accent">This text uses `.text-accent`</p>
            <div className="bg-primary text-white p-2 mt-2">
              Primary background
            </div>
            <div className="bg-cart p-2 mt-2">Cart background</div>
          </section>
        </Container>
      </main>
    </>
  );
}
