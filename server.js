const express = require('express');
const app = express();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Securely loads your key from Render environment variables

app.use(express.json());
app.use(express.static(__dirname)); // Serves your game files from this folder

app.post('/create-checkout-session', async (req, res) => {
    const { packageId, amount, username } = req.body;

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: { name: `Brainrot Go - ${packageId}` },
                    unit_amount: amount,
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `http://localhost:3000/index.html?payment=success&pack=${packageId}&user=${username}`,
            cancel_url: `http://localhost:3000/index.html?payment=cancelled`,
        });

        res.json({ url: session.url });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Stripe payment server running on port ${PORT}`));