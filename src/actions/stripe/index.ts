'use server'

import { client } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs'
import Stripe from 'stripe'
import Razorpay from 'razorpay';

// const stripe = new Stripe(process.env.STRIPE_SECRET!, {
//   typescript: true,
//   apiVersion: '2024-04-10',
// })

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET
})

export const onCreateCustomerPaymentIntentSecret = async (
  amount: number,
  stripeId: string
) => {
  let key_id = process.env.RAZORPAY_KEY_ID;
  try {
    // {
    //   "amount": 50000,
    //   "currency": "INR",
    //   "receipt": "receipt#1",
    //   "notes": {
    //     "key1": "value3",
    //     "key2": "value2"
    //   }
    // }
    const paymentIntent = await razorpay.orders.create(
      {
        // amount: amount * 100,
        amount: 1.00,
        currency: "INR",
        receipt: "receipt#1",
        notes: {
          key1: "value3",
          key2: "value2"
        }
      }
    )

    if (paymentIntent) {
      return { secret: paymentIntent.id, key: key_id }
    }
  } catch (error) {
    console.log(error)
  }
}

export const onUpdateSubscription = async (
  plan: 'STANDARD' | 'PRO' | 'ULTIMATE'
) => {
  try {
    const user = await currentUser()
    if (!user) return
    const update = await client.user.update({
      where: {
        clerkId: user.id,
      },
      data: {
        subscription: {
          update: {
            data: {
              plan,
              credits: plan == 'PRO' ? 50 : plan == 'ULTIMATE' ? 500 : 10,
            },
          },
        },
      },
      select: {
        subscription: {
          select: {
            plan: true,
          },
        },
      },
    })
    if (update) {
      return {
        status: 200,
        message: 'subscription updated',
        plan: update.subscription?.plan,
      }
    }
  } catch (error) {
    console.log(error)
  }
}

const setPlanAmount = (item: 'STANDARD' | 'PRO' | 'ULTIMATE') => {
  if (item == 'PRO') {
    return 1500
  }
  if (item == 'ULTIMATE') {
    return 3500
  }
  return 0
}

export const onGetStripeClientSecret = async (
  item: 'STANDARD' | 'PRO' | 'ULTIMATE'
) => {
  try {
    const amount = setPlanAmount(item)
    const paymentIntent = await razorpay.orders.create({
      amount: amount,
      currency: "INR",
      receipt: "receipt#1",
      notes: {
        key1: `${item} PLAN`,
        key2: "value2"
      }
    })

    if (paymentIntent) {
      return { secret: paymentIntent.id, amount: 1 }
    }
  } catch (error) {
    console.log(error)
  }
}