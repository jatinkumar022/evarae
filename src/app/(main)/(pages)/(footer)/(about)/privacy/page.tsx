// File: src/app/privacy-policy/page.tsx
import React from 'react';

const PrivacyPolicy = () => {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-6 text-center">Privacy Policy</h1>
      <p className="mb-4 text-gray-700">
        Last updated on <strong>Sep 24, 2025</strong>
      </p>
      <p className="mb-4 text-gray-700">
        This privacy policy sets out how Caelvi uses and protects any
        information that you give Caelvi when you visit their website and/or
        agree to purchase from them.
      </p>
      <p className="mb-4 text-gray-700">
        Caelvi is committed to ensuring that your privacy is protected. Should
        we ask you to provide certain information by which you can be identified
        when using this website, you can be assured that it will only be used in
        accordance with this privacy statement.
      </p>
      <p className="mb-4 text-gray-700">
        Caelvi may change this policy from time to time by updating this page.
        You should check this page from time to time to ensure that you adhere
        to these changes.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">
        Information we may collect
      </h2>
      <ul className="list-disc list-inside mb-4 text-gray-700">
        <li>Name</li>
        <li>Contact information including email address</li>
        <li>
          Demographic information such as postcode, preferences and interests,
          if required
        </li>
        <li>Other information relevant to customer surveys and/or offers</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">
        What we do with the information we gather
      </h2>
      <ul className="list-disc list-inside mb-4 text-gray-700">
        <li>Internal record keeping.</li>
        <li>
          We may use the information to improve our products and services.
        </li>
        <li>
          We may periodically send promotional emails about new products,
          special offers or other information which we think you may find
          interesting using the email address which you have provided.
        </li>
        <li>
          From time to time, we may also use your information to contact you for
          market research purposes. We may contact you by email, phone, fax or
          mail. We may use the information to customise the website according to
          your interests.
        </li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Cookies</h2>
      <p className="mb-4 text-gray-700">
        A cookie is a small file which asks permission to be placed on your
        computer&apos;s hard drive. Once you agree, the file is added and the
        cookie helps analyze web traffic or lets you know when you visit a
        particular site. Cookies allow web applications to respond to you as an
        individual by remembering your preferences.
      </p>
      <p className="mb-4 text-gray-700">
        We use traffic log cookies to identify which pages are being used. This
        helps us analyze data about webpage traffic and improve our website in
        order to tailor it to customer needs. Overall, cookies help us provide
        you with a better website experience.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">
        Controlling your personal information
      </h2>
      <p className="mb-4 text-gray-700">
        You may choose to restrict the collection or use of your personal
        information in the following ways:
      </p>
      <ul className="list-disc list-inside mb-4 text-gray-700">
        <li>
          Whenever you are asked to fill in a form on the website, look for the
          box that you can click to indicate that you do not want the
          information to be used for direct marketing purposes.
        </li>
        <li>
          If you have previously agreed to us using your personal information
          for direct marketing purposes, you may change your mind at any time by
          writing to or emailing us at <strong>support@caelvi.com</strong>.
        </li>
      </ul>
      <p className="mb-4 text-gray-700">
        We will not sell, distribute or lease your personal information to third
        parties unless we have your permission or are required by law. If you
        believe that any information we are holding on you is incorrect or
        incomplete, please write to:
      </p>
      <address className="mb-4 text-gray-700 not-italic">
        36, SURAJ PARK SOCIETY, OPP. CHAMAK CHUNA, NR. HOLY CHILD SCHOOL,
        Saijpur Bogha, Ahmedabad, Gujarat, 382345 <br />
        Email: <strong>support@caelvi.com</strong>
      </address>
    </main>
  );
};

export default PrivacyPolicy;
