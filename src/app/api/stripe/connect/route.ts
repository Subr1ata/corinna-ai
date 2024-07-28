import { client } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs'
import { NextResponse } from 'next/server'
import Razorpay from 'razorpay';

// const stripe = new Stripe(process.env.STRIPE_SECRET!, {
//     typescript: true,
//     apiVersion: '2024-04-10',
// })
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID as string,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})

const auth = {
    username: process.env.RAZORPAY_KEY_ID as string,
    password: process.env.RAZORPAY_KEY_SECRET as string,
};

function getRandomId() {
    let nums = '0123456789';
    let result = '';
    for (let i = 0; i < 7; i++) {
        const randIndex = Math.floor(Math.random() * nums.length);
        result += nums[randIndex]
    }
    return result;
}

const names = [
    'john', 'jane', 'michael', 'sarah', 'david', 'emily', 'daniel', 'emma',
    'william', 'olivia', 'james', 'ava', 'alex', 'mia', 'robert', 'amelia'
]

const getRandomElement = (array: string[]) => {
    return array[Math.floor(Math.random() * array.length)];
};

export async function GET() {
    try {
        const user = await currentUser()
        if (!user) return new NextResponse('User not authenticated')

        const account = await razorpay.accounts.create({
            email: `test1@mailinator.com`,
            phone: "9999990000",
            type: "route",
            reference_id: getRandomId(),
            legal_business_name: "anyuser",
            business_type: "partnership",
            contact_name: "User",
            profile: {
                category: "healthcare",
                subcategory: "clinic",
                addresses: {
                    registered: {
                        street1: "507, Koramangala 1st block",
                        street2: "MG Road",
                        city: "Bengaluru",
                        state: "KARNATAKA",
                        postal_code: "560034",
                        country: "IN"
                    }
                }
            },
            legal_info: {
                pan: "AAACL1254D",
                gst: "18AAACU9603R1ZZ"
            }
        })

        if (account) {
            console.log('if (account)::')
            const approve = await razorpay.accounts.edit(account.id, {
                customer_facing_business_name: "ABCD Ltd"
            })
            if (approve) {
                console.log('if (approve)::')
                const person = await razorpay.stakeholders.create(account.id, {
                    name: 'Jenny Rosen',
                    phone: { primary: '9348607064' },
                    email: `${getRandomElement(names)}@mailinator.com`,
                    kyc: { pan: 'AVOPB1111K' },
                    relationship: {
                        executive: true,
                        director: false,
                    },
                })
                if (person) {
                    console.log('if (person)::')
                    const approvePerson = await razorpay.stakeholders.edit(
                        account.id,
                        person.id,
                        {
                            addresses: {
                                residential: {
                                    street: "506, Koramangala 1st block",
                                    city: "Bengaluru",
                                    state: "Karnataka",
                                    postal_code: "560034",
                                    country: "IN"
                                }
                            },
                            phone: {
                                primary: "9000090000",
                                secondary: "9000090000"
                            },
                            relationship: {
                                executive: true,
                            },
                        }
                    )
                    if (approvePerson) {
                        console.log('if (approvePerson)::')
                        const owner = await razorpay.stakeholders.edit(account.id, person.id, {
                            name: 'Kathleen Banks',
                            percentage_ownership: 80,
                            addresses: {
                                residential: {
                                    street: "506, Koramangala 1st block",
                                    city: "Bengaluru",
                                    state: "Karnataka",
                                    postal_code: "560034",
                                    country: "IN"
                                }
                            },
                            kyc: { pan: 'AVOPB1111K' },
                            phone: {
                                primary: "9000090000",
                                secondary: "9000090000"
                            },
                            relationship: {
                                executive: true,
                                director: true,
                            },
                        })
                        if (owner) {
                            console.log('if (owner)::');
                            const complete = await razorpay.stakeholders.edit(account.id, person.id, {
                                notes: { owners_provided: 'true' }
                            })
                            if (complete) {
                                console.log('if (complete)::');
                                const saveAccountId = await client.user.update({
                                    where: {
                                        clerkId: user.id,
                                    },
                                    data: {
                                        stripeId: account.id,
                                    },
                                })

                                if (saveAccountId) {
                                    console.log('if (saveAccountId)::');
                                    const accountLink = await razorpay.webhooks.create({
                                        url: 'http://localhost:3000/callback/stripe/success',
                                        events: 'account_onboarding',
                                    })

                                    return NextResponse.json({
                                        url: accountLink.url,
                                    })
                                }
                            }
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error(
            'An error occurred when calling the Stripe API to create an account:',
            error
        )
    }
}