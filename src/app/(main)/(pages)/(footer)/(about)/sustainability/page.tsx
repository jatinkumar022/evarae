'use client';
import Container from '@/app/(main)/components/layouts/Container';
import { motion } from 'framer-motion';
import {
  Leaf,
  Recycle,
  Heart,
  Award,
  TreePine,
  Droplets,
  Users,
  Package,
} from 'lucide-react';

export default function SustainabilityPage() {
  return (
    <div className="">
      <Container>
        {/* Hero Section */}
        <section className="text-center py-20">
          <h1 className="text-2xl md:text-3xl lg:text-5xl font- mb-4 font-heading text-primary-dark">
            Our Commitment to Sustainability
          </h1>
          <p className="text-gray-600 text-sm md:text-base  lg:text-lg max-w-2xl mx-auto leading-relaxed">
            At Caelvi, we believe luxury should never come at the cost of our
            planet. Discover our journey towards ethical sourcing, eco-friendly
            practices, and responsible craftsmanship.
          </p>
        </section>

        {/* Highlights */}
        <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 py-16">
          {[
            {
              icon: <Leaf className="w-8 h-8 text-primary" />,
              title: 'Ethical Sourcing',
              desc: 'Responsibly sourced materials from certified suppliers.',
            },
            {
              icon: <Recycle className="w-8 h-8 text-primary" />,
              title: 'Recycled Materials',
              desc: '80% of our metals come from recycled sources.',
            },
            {
              icon: <Package className="w-8 h-8 text-primary" />,
              title: 'Eco Packaging',
              desc: 'Biodegradable and recyclable packaging materials.',
            },
            {
              icon: <Users className="w-8 h-8 text-primary" />,
              title: 'Fair Trade',
              desc: 'Supporting artisan communities with fair wages.',
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="text-center bg-white shadow-sm rounded-2xl p-6 border border-primary/10"
            >
              <div className="mb-4 flex justify-center">{item.icon}</div>
              <h3 className="font-medium text-lg mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </motion.div>
          ))}
        </section>

        {/* Our Sustainability Journey */}
        <section className="py-16 border-t border-primary/20">
          <h2 className="text-xl lg:text-2xl font-medium mb-6 text-center font-heading text-primary-dark">
            Our Sustainability Journey
          </h2>
          <div className="max-w-3xl text-sm md:text-base  lg:text-lg mx-auto space-y-6 text-gray-600 leading-relaxed">
            <p>
              Since our inception, Caelvi has been committed to creating
              beautiful jewelry while minimizing our environmental impact. We
              understand that true luxury means preserving the beauty of our
              world for future generations.
            </p>
            <p>
              Our sustainability efforts span every aspect of our business -
              from sourcing raw materials to the final delivery of your jewelry.
              We continuously innovate and improve our processes to ensure
              we&apos;re making a positive impact.
            </p>
          </div>
        </section>

        {/* Environmental Initiatives */}
        <section className="py-16 border-t border-primary/20">
          <h2 className="text-xl lg:text-2xl font-medium mb-8 text-center font-heading text-primary-dark">
            Environmental Initiatives
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: <TreePine className="w-6 h-6 text-primary" />,
                title: 'Carbon Neutral Shipping',
                desc: 'All our deliveries are carbon offset through verified environmental projects including reforestation and renewable energy initiatives.',
              },
              {
                icon: <Droplets className="w-6 h-6 text-primary" />,
                title: 'Water Conservation',
                desc: 'Our manufacturing processes use 60% less water than industry standards through advanced recycling and purification systems.',
              },
              {
                icon: <Recycle className="w-6 h-6 text-primary" />,
                title: 'Circular Economy',
                desc: 'We offer a jewelry buyback program, ensuring precious metals and gems are continuously recycled and reused.',
              },
              {
                icon: <Package className="w-6 h-6 text-primary" />,
                title: 'Zero Waste Packaging',
                desc: 'Our packaging is made from recycled materials and designed to be fully biodegradable or recyclable.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border border-primary/20 rounded-xl shadow-sm p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 mb-2">
                      {item.title}
                    </h3>
                    <p className=" text-gray-600 text-xs md:text-sm">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Certifications & Partnerships */}
        <section className="py-16 border-t border-primary/20">
          <h2 className="text-xl lg:text-2xl font-medium mb-8 text-center font-heading text-primary-dark">
            Certifications & Partnerships
          </h2>
          <div className="max-w-3xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {[
                {
                  icon: (
                    <Award className=" w-6 h-6 md:w-8 md:h-8 text-primary" />
                  ),
                  title: 'RJC Certified',
                  desc: 'Responsible Jewellery Council member ensuring ethical practices.',
                },
                {
                  icon: (
                    <Heart className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                  ),
                  title: 'Conflict-Free',
                  desc: 'All diamonds are certified conflict-free through Kimberley Process.',
                },
                {
                  icon: <Leaf className="w-6 h-6 md:w-8 md:h-8 text-primary" />,
                  title: 'B-Corp Pending',
                  desc: 'Working towards B-Corporation certification for social impact.',
                },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="mb-3 flex justify-center">{item.icon}</div>
                  <h3 className="font-medium mb-2 text-sm lg:text-base">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-gray-600 text-center leading-relaxed text-sm md:text-base  lg:text-lg">
              We partner with organizations like the Alliance for Responsible
              Mining and support local communities through our fair trade
              initiatives, ensuring our jewelry creates positive impact at every
              level.
            </p>
          </div>
        </section>

        {/* Impact Metrics */}
        <section className="py-16 border-t border-primary/20">
          <h2 className="text-xl lg:text-2xl font-medium mb-8 text-center font-heading text-primary-dark">
            Our Impact in Numbers
          </h2>
          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { number: '80%', label: 'Recycled Materials Used' },
              { number: '60%', label: 'Less Water Consumption' },
              { number: '100%', label: 'Carbon Neutral Shipping' },
              { number: '50+', label: 'Artisan Communities Supported' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="text-center bg-gradient-to-br from-primary/10 to-pink-100 rounded-xl p-6"
              >
                <div className="text-xl md:text-3xl font-light text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 border-t border-primary/20">
          <h2 className="text-xl lg:text-2xl font-medium mb-8 text-center font-heading text-primary-dark">
            Sustainability FAQs
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                q: 'How do you ensure your materials are ethically sourced?',
                a: 'We work only with certified suppliers who meet strict environmental and social standards. All our gold is recycled or comes from responsible mining operations, and our diamonds are conflict-free.',
              },
              {
                q: 'What happens to the packaging after delivery?',
                a: 'Our packaging is designed to be either compostable or recyclable. We include instructions on how to properly dispose of each component to minimize environmental impact.',
              },
              {
                q: 'Do you have a jewelry recycling program?',
                a: 'Yes! We offer a buyback program for old jewelry, which we then recycle into new pieces. This helps keep precious materials in circulation and reduces the need for new mining.',
              },
              {
                q: 'How are you working to reduce carbon emissions?',
                a: 'We offset 100% of our shipping emissions, use renewable energy in our facilities, and are working towards becoming carbon negative by 2030 through various environmental projects.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="bg-white border border-primary/20 rounded-xl shadow-sm p-6"
              >
                <h3 className="font-medium text-primary mb-2 text-sm md:text-base">
                  {item.q}
                </h3>
                <p className="md:text-sm text-gray-600 text-xs">{item.a}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-20 border-t border-primary/20">
          <h3 className="text-xl font-medium mb-3 font-heading text-primary-dark">
            Join Our Sustainable Journey
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto text-sm md:text-base">
            Every piece you choose from Caelvi contributes to a more sustainable
            future. Together, we&apos;re creating beautiful jewelry while
            protecting our beautiful planet.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a
              href="/collections"
              className="px-6 py-2 text-sm bg-primary md:text-base text-white rounded-full shadow-md hover:bg-green-700 transition-colors"
            >
              Shop Sustainable
            </a>
            <a
              href="/sustainability"
              className="px-6 py-2 bg-primary/10 text-sm md:text-base text-primary rounded-full border border-primary/20 hover:bg-primary/10 transition-colors"
            >
              Learn More
            </a>
          </div>
        </section>
      </Container>
    </div>
  );
}
