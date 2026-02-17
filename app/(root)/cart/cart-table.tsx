"use client";

import { Cart } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { formatCurrency, roundToTwoDecimalPlaces } from "@/lib/utils";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.actions";
import { ArrowRight, Loader, Minus, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "path";

const CartTable = ({ cart }: { cart?: Cart }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <h1 className="py-4 h2-bold">Shopping Cart</h1>
      {!cart || cart.items.length === 0 ? (
        <div>
          Cart is empty. <Link href="/">Go Shopping</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-4 md:gap-5">
          <div className="overflow-x-auto md:col-span-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.items.map((item) => (
                  <TableRow key={item.slug}>
                    <TableCell>
                      <Link href={`/product/${item.slug}`} className="flex items-center">
                      <Image src={item.image} alt={item.name} width={50} height={50}/>
                      <span className="px-2">
                        {item.name}
                      </span>
                      </Link>
                    </TableCell>
                    <TableCell className="flex-center gap-2">
                        <Button disabled={isPending} variant='outline' type="button"
                        onClick={()=>startTransition(async()=>{
                            const res = await removeItemFromCart(item.productId);
                            if(!res.success){
                                toast.error(res.message);
                                return;
                            }
                            toast.success(res.message);
                        })}
                        >{isPending ? (<Loader className="w-4 h-4 animate-spin" />) : (<Minus className="w-4 h-4" />) }</Button>
                        {item.qty}
                        <Button disabled={isPending} variant='outline' type="button"
                        onClick={()=>startTransition(async()=>{
                            const res = await addItemToCart(item);
                            if(!res.success){
                                toast.error(res.message);
                                return;
                            }
                            toast.success(res.message);
                        })}
                        >{isPending ? (<Loader className="w-4 h-4 animate-spin" />) : (<Plus className="w-4 h-4" />) }</Button>
                        </TableCell>
                    <TableCell className="text-right">
                      ${roundToTwoDecimalPlaces(item.price)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Card>
            <CardContent>
                <div className="gap-4 text-lg">
                    Subtotal ({cart.items.reduce((a,b) => a + b.qty,0)}):{" "}
                    <span className="font-bold">
                        {formatCurrency(cart.itemsPrice)}
                    </span>
                </div>
                <hr/>
                <Button className="w-full" disabled={isPending} onClick={()=>
                    startTransition(()=>{ router.push('/shipping-address')})}>
                    {isPending ? <Loader className="h-4 w-4 animate-spin" /> :(<ArrowRight className="h-4 w-4" />)} Proceed to Checkout
                    </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};
export default CartTable;
