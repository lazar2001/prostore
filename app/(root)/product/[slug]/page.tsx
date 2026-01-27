import { getProductBySlug } from "@/lib/actions/product.actions";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ProductPrice from "@/components/shared/product/product-price";
import ProductImages from "@/components/shared/product/product-images";
import AddToCart from "@/components/shared/product/add-to-cart";
import { getMyCart } from "@/lib/actions/cart.action";

const ProductDetailsPage = async (props: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await props.params;

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const cart = await getMyCart();

  return (
    <>
      <section>
        <div className="grid grid-cols-1 md:grid-cols-5">
          <div className="col-span-2">
            <ProductImages images={product.images} />
          </div>
          <div className="col-span-2 p-3">
            <div className="flex flex-col gap-3">
              <p>{product.brand} {product.category}</p>
              <h1 className="h3-bold">{product.name}</h1>
              <p>{product.rating} of {product.numReviews}</p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 ">
                <ProductPrice value={Number(product.price)} className="rounded-full bg-green-100 text-green-700 px-5 py-2 "  />
              </div>
            </div>
            <div className="mt-10">
                <p className="font-semibold">Description</p>
                <p >{product.description}</p>
            </div>
          </div>
          <div>
            <Card className="pt-2"> 
                <CardContent >
                 <div className="flex justify-between items-center h-12">
                    <div>Price</div>
                    <div><ProductPrice value={Number(product.price)} /></div>
                 </div>
                 <div className=" flex justify-between items-center">
                    <div>Status</div>
                    {product.stock > 0 ? (
                        <Badge variant="outline">In Stock</Badge>
                    ):(
                        <Badge variant="destructive">Out of Stock</Badge>
                    )}
                 </div>
                 {product.stock > 0 && (
                    <AddToCart
                      cart={cart} 
                      item={{
                      productId: product.id,
                      name: product.name,
                      slug: product.slug,
                      qty: 1,
                      image: product.images![0],
                      price: product.price,
                    }}/>
                 )}
                </CardContent>    
            </Card>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProductDetailsPage;
