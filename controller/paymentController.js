const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const paymentController = {

    create: async (req, res) => {

        try {
            const { amount, currency } = req.body;

            const paymentIntent = await stripe.paymentIntents.create({
                amount: parseInt(req.query.amount),
                currency: req.query.currency,
            }, function (error, paymentIntent) {
                if (error != null) {
                    console.log(error);
                    res.json({ "error": error });
                } else {
                    res.json({
                        paymentIntent: paymentIntent.client_secret,
                        paymentIntentData: paymentIntent,
                        amount: req.body.amount,
                        currency: req.body.currency
                    });
                }
            });

            // const session = await stripe.checkout.sessions.create({
            //     line_items: [
            //       {
            //         price_data: {
            //           currency: 'usd',
            //           product_data: {
            //             name: 'T-shirt',
            //           },
            //           unit_amount: 2000,
            //         },
            //         quantity: 1,
            //       },
            //     ],
            //     mode: 'payment',
            //     success_url: 'https://www.google.com/',
            //     cancel_url: 'https://www.youtube.com/',
            //   });

            //   res.redirect(303, session.url);
        }
        catch (e) {
            console.log(e);
            return res.status(500).json({ status: "error", message: e.message })
        }
    },

    confirm: async (req, res) => {

        try {
            const { orderId } = req.body;
            
            const newOrder = await Orders.findOneAndUpdate(
                {orderId: orderId.toUpperCase()},
                    {
                        $set: {
                            status: "payment_received_with_card"
                        },
                    },
                    {new:true}
            );
            
            if(newOrder) {
                res.status(200).json({status: "success", message: "order updated", order: newOrder});

            }
            else return res.status(200).json({status: "error", message: "order update failed"});

        }
        catch (e) {
            console.log(e);
            return res.status(500).json({ status: "error", message: e.message })
        }
    },

}


module.exports = paymentController