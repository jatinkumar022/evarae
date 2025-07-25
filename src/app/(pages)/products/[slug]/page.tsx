import React from "react";

type ProductPageProps = {
  params: {
    slug: string;
  };
};

export default function ProductPage({ params }: ProductPageProps) {
  const { slug } = params;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold capitalize">
        {slug.replace(/-/g, " ")}
      </h1>
      <p className="mt-4">Product details for {slug} will be displayed here.</p>
    </div>
  );
}
