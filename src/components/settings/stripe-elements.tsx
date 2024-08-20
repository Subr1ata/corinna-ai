"use client";

// import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import React, { useState } from "react";
import { Loader } from "../loader";
import { useStripeElements } from "@/hooks/billing/use-billing";
import { PaymentForm } from "./payment-form";
import Script from "next/script";
import { useToast } from "../ui/use-toast";
import { onUpdateSubscription } from "@/actions/stripe";
import { useRouter } from "next/navigation";

type StripeElementsProps = {
  payment: "STANDARD" | "PRO" | "ULTIMATE";
};

export const StripeElements = ({ payment }: StripeElementsProps) => {
  // const StripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISH_KEY!);
  const { stripeSecret, loadForm, amount } = useStripeElements(payment);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  console.log("amount::", amount, stripeSecret);

  const processPayment = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    try {
      setProcessing(true);

      const options = {
        key: process.env.RAZORPAY_KEY_ID,
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
            const plan = await onUpdateSubscription(payment);
            if (plan) {
              toast({
                title: "Success",
                description: plan.message,
              });
            }
            router.refresh();
            // toast({
            //   title: "Success",
            //   description: "Payment complete",
            // });
            // onNext();
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
      console.log(error, `razorpay-key:: ${process.env.RAZORPAY_KEY_ID}`);
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

      {stripeSecret && (payment == "PRO" || payment == "ULTIMATE") && (
        <Loader loading={loadForm}>
          {/* <Elements
          stripe={StripePromise}
          options={{
            clientSecret: stripeSecret,
          }}
        >
        </Elements> */}
          <PaymentForm
            plan={payment}
            onMakePayment={processPayment}
            processing={processing}
          />
        </Loader>
      )}
    </>
  );
};
