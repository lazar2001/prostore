import { auth } from "@/auth";
import { getMyCart } from "@/lib/actions/cart.actions";
import { getUserById } from "@/lib/actions/user.actions";
import { ShippingAddress } from "@/types";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
    title: "Shipping Address",
    description: "Enter your shipping address",
};
const ShippingAddressPage = async() => { 
    const cart = await getMyCart();

    if(!cart || cart.items.length === 0){
        redirect('/cart');
    }

    const session = await auth();

    const userId = session?.user?.id
    if(!userId){
        throw new Error("No user ID");}

    const user = await getUserById(userId);
    
    return (
        <div>
            Shipping Address Page
        </div>
    );
}

export default ShippingAddressPage;