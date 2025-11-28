import { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "./CheckoutForm";
import { useAuth } from "../context/AuthContext";


const stripePromise = loadStripe("pk_test_51SWKDoPiIRjnqDAVfyK6CoSJbPq0OK69YkDhPc3ayaVvP6bpi5Aphj10ahMvTTG5MZ9mn7voS0myfqMSbdQ0XBCq00GoQ8luJ2");

const api="http://localhost:5000/api";

const getPriceMultiplier = (category) => {
  switch (category) {
    case 'Business': return 1.5;
    case 'First Class': return 2;
    default: return 1;
  }
};

export default function PaymentPage() {
  const [clientSecret, setClientSecret] = useState(null);
  const { user, logout} = useAuth();

  useEffect(() => {
    async function createIntent() {
      console.log("User:", user);
      if (!user) {
        console.error("User not logged in");
        return;
      }
      const cart = JSON.parse(localStorage.getItem("cart"));
      let eemail=user.email;
      // Map cart items to expected format for backend
      const items = cart.map(item => {
        const multiplier = getPriceMultiplier(item.category);
        const adjustedPrice = item.price * multiplier;
        const quantity = item.selectedSeats && item.selectedSeats.length > 0 ? item.selectedSeats.length : item.reserved_chairs;
        return {
          _id: item._id,
          flightId: item.idFlight,
          email: eemail,
          unit_amount: adjustedPrice,
          quantity: quantity,
          name: `${item.company}: ${item.from}-${item.to}`,
          currency: 'usd',
          category: item.category,
          seats:item.selectedSeats
        };
      });

      const res = await fetch(`${api}/create-payment-intent`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items })
      });

      const data = await res.json();
      setClientSecret(data.clientSecret);
      // Removed localStorage storage to prevent reuse of expired clientSecrets
    }

    createIntent();
  }, []);

  if (!clientSecret) return <p>Cargando formulario de pago...</p>;

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm />
    </Elements>
  );
}
