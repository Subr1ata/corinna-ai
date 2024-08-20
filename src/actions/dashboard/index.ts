'use server'

import { client } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs'
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID as string,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
})

export const getUserClients = async () => {
    try {
        const user = await currentUser()
        if (user) {
            const clients = await client.customer.count({
                where: {
                    Domain: {
                        User: {
                            clerkId: user.id,
                        },
                    },
                },
            })
            if (clients) {
                return clients
            }
        }
    } catch (error) {
        console.log(error)
    }
}

export const getUserBalance = async () => {
    try {
        const user = await currentUser()
        if (user) {
            const connectedStripe = await client.user.findUnique({
                where: {
                    clerkId: user.id,
                },
                select: {
                    stripeId: true,
                },
            })

            if (connectedStripe) {
                const transactions = await razorpay.payments.all();

                if (transactions) {
                    // User Balance = Total Transactions - deduction by razorpay
                    const sales = transactions.items.reduce((total, next) => {
                        return total + Number(next.amount)
                    }, 0)

                    return sales / 100
                }
            }
        }
    } catch (error) {
        console.log(error)
    }
}

export const getUserPlanInfo = async () => {
    try {
        const user = await currentUser()
        if (user) {
            const plan = await client.user.findUnique({
                where: {
                    clerkId: user.id,
                },
                select: {
                    _count: {
                        select: {
                            domains: true,
                        },
                    },
                    subscription: {
                        select: {
                            plan: true,
                            credits: true,
                        },
                    },
                },
            })
            if (plan) {
                return {
                    plan: plan.subscription?.plan,
                    credits: plan.subscription?.credits,
                    domains: plan._count.domains,
                }
            }
        }
    } catch (error) {
        console.log(error)
    }
}

export const getUserTotalProductPrices = async () => {
    try {
        const user = await currentUser()
        if (user) {
            const products = await client.product.findMany({
                where: {
                    Domain: {
                        User: {
                            clerkId: user.id,
                        },
                    },
                },
                select: {
                    price: true,
                },
            })

            if (products) {
                const total = products.reduce((total, next) => {
                    return total + next.price
                }, 0)

                return total
            }
        }
    } catch (error) {
        console.log(error)
    }
}

export const getUserTransactions = async () => {
    try {
        const user = await currentUser();

        if (user) {
            const connectedStripe = await client.user.findUnique({
                where: {
                    clerkId: user.id,
                },
                select: {
                    stripeId: true,
                },
            })

            if (connectedStripe) {
                const transactions = await razorpay.payments.all();

                if (transactions) {
                    // const total = transactions.items.reduce((total, next) => {
                    //     return total + Number(next.amount)
                    // }, 0)
                    return transactions
                }
            }
        }
    } catch (error) {
        console.log(error)
    }
}
