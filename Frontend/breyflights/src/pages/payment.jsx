import { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "./CheckoutForm";
import { useAuth } from "../context/AuthContext";


const stripePromise = loadStripe("pk_test_51SWKDoPiIRjnqDAVfyK6CoSJbPq0OK69YkDhPc3ayaVvP6bpi5Aphj10ahMvTTG5MZ9mn7voS0myfqMSbdQ0XBCq00GoQ8luJ2");

const api="http://localhost:5000/api";
export default function PaymentPage() {
  const [clientSecret, setClientSecret] = useState(null);
  const { user, logout} = useAuth();

  useEffect(() => {
    async function createIntent() {
      const cart = JSON.parse(localStorage.getItem("cart"));
      let eemail=user.email;
      // Map cart items to expected format for backend
      const items = cart.map(item => ({
        _id: item._id,
        flightId: item.idFlight,
        email: eemail,
        unit_amount: item.price,
        quantity: item.reserved_chairs,
        name: `Flight of ${item.company}, From: ${item.from}, To: ${item.to}`,
        currency: 'usd'
      }));

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
