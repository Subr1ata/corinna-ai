"use client";
import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { useStripeCustomer } from "@/hooks/billing/use-billing";
import { Loader } from "@/components/loader";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { CustomerPaymentForm } from "./payment-form";
import { useToast } from "@/components/ui/use-toast";
import Script from "next/script";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

type Props = {
  onBack(): void;
  products?:
    | {
        name: string;
        image: string;
        price: number;
      }[]
    | undefined;
  amount?: number;
  onNext(): void;
  stripeId?: string;
};

const PaymentCheckout = ({
  onBack,
  onNext,
  amount,
  products,
  stripeId,
}: Props) => {
  const StripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISH_KEY!,
    {
      stripeAccount: stripeId!,
    }
  );

  const { stripeSecret, loadForm, razorpayKey } = useStripeCustomer(
    amount!,
    stripeId!
  );

  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);

  // console.log(
  //   "razorpayKey || process.env.RAZORPAY_KEY_ID:: ",
  //   razorpayKey || process.env.RAZORPAY_KEY_ID
  // );

  const processPayment = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    try {
      setProcessing(true);

      const options = {
        key: razorpayKey,
        amount: amount,
        currency: "INR",
        name: "Acme Corp",
        description: "Test Transaction",
        order_id: stripeSecret,
        handler: async function (response: any) {
          const data = {
            orderCreationId: stripeSecret,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
          };

          const result = await fetch("/api/verify", {
            method: "POST",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" },
          });
          const res = await result.json();
          if (res.isOk) {
            toast({
              title: "Success",
              description: "Payment complete",
            });
            onNext();
          } else {
            alert(res.message);
          }
        },
        prefill: {
          name: "Gaurav Kumar",
          email: "gaurav.kumar@example.com",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on("payment.failed", function (response: any) {
        alert(response.error.description);
      });
      paymentObject.open();
      // }
    } catch (error) {
      console.log(error, `razorpay-key:: ${razorpayKey}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
      />

      <Loader loading={loadForm}>
        <div className="flex flex-col gap-5 justify-center">
          <div className="flex justify-center">
            <h2 className="text-4xl font-bold mb-5">Payment</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="col-span-1 border-r-2 pr-5 flex flex-col">
              <h2 className="text-3xl font-bold mb-5">${amount}</h2>
              {products &&
                products.map((product, key) => (
                  <Card key={key} className="w-full flex gap-2 p-3">
                    <div className="w-2/12 aspect-square relative">
                      <Image
                        src={`https://ucarecdn.com/${product.image}/`}
                        alt="product"
                        fill
                      />
                    </div>
                    <div className="flex-1 flex justify-between">
                      <p className="text-xl font-semibold">{product.name}</p>
                      <p className="text-2xl font-bold">${product.price}</p>
                    </div>
                  </Card>
                ))}
            </div>
            <div className="col-span-1 pl-5">
              {
                // <></>
                <CustomerPaymentForm
                  onMakePayment={processPayment}
                  processing={processing}
                />
                // <Elements
                //   stripe={StripePromise}
                //   options={{
                //     clientSecret: stripeSecret,
                //   }}
                // >
                // </Elements>
              }
            </div>
          </div>
        </div>
      </Loader>
    </>
  );
};

export default PaymentCheckout;
