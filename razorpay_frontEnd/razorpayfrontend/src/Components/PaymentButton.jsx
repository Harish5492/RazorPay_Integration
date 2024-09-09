import useRazorpay from "react-razorpay";

export default function PaymentButton() {
  const [Razorpay] = useRazorpay();

  const RAZORPAY_KEY_ID = "rzp_test_9BAtxiHhXAj4oD";
  console.log("shoteu", RAZORPAY_KEY_ID);

  const handlePayment = async () => {
    try {
      const response = await fetch("http://localhost:3001/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: 5000 }),
      });

      const order = await response.json();
      console.log("Order:", order);

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Your Company Name",
        description: "Payment for your order",
        order_id: order.id,
        handler: async (response) => {
          console.log("Handler Response:", response);
          try {
            const verifyResponse = await fetch(
              "http://localhost:3001/verify-payment",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              }
            );

            const verifyResult = await verifyResponse.json();
            if (verifyResult.error === "Invalid payment signature") {
              console.log("payment failed");
              alert("Payment Failed");
            } else {
              console.log("Verify Result:", verifyResult);
              alert("Payment successful!");
            }
          } catch (err) {
            console.error("Verification Error:", err);
            alert("Payment verification failed: " + err.message);
          }
        },
        prefill: {
          name: "John Doe",
          email: "john@example.com",
          contact: "9999999999",
        },
        notes: {
          address: "Razorpay Corporate Office",
        },
        theme: {
          color: "#3399cc",
        },
      };
      const rzpay = new Razorpay(options);
      rzpay.open();
    } catch (err) {
      console.error("Order Creation Error:", err);
      alert("Error creating order: " + err.message);
    }
  };

  return <button onClick={handlePayment}>Pay with Razorpay</button>;
}
