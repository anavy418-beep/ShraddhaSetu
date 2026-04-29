function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function openRazorpayCheckout({ orderConfig, onSuccess, onFailure }) {
  const loaded = await loadRazorpayScript();
  if (!loaded || !window.Razorpay) {
    throw new Error("Unable to load Razorpay checkout script.");
  }

  const options = {
    key: orderConfig.keyId,
    amount: orderConfig.amount,
    currency: orderConfig.currency,
    name: orderConfig.name,
    description: orderConfig.description,
    order_id: orderConfig.orderId,
    prefill: orderConfig.prefill,
    notes: {
      entityType: orderConfig.entityType,
      paymentOption: orderConfig.paymentOption
    },
    theme: {
      color: "#d97706"
    },
    handler: onSuccess,
    modal: {
      ondismiss: onFailure
    }
  };

  const razorpay = new window.Razorpay(options);
  razorpay.open();
}
