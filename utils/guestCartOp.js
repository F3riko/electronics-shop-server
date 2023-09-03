const handleCartObj = (cart, productId, action) => {
  const updatedCart = { ...cart };
  if (updatedCart[productId]) {
    const product = updatedCart[productId];
    if (action === "incr") {
      product.quantity += 1;
    } else if (action === "decr") {
      product.quantity = Math.max(product.quantity - 1, 1);
    }

    // Optionally, update the "selected" property if needed
    // product.selected = true; // You can set this based on your logic

    // Return the updated cart
    return updatedCart;
  }

  // If the product doesn't exist in the cart, you can handle it here
  // For example, you can add it to the cart with an initial quantity of 1
  if (action === "incr") {
    updatedCart[productId] = { id: productId, quantity: 1, selected: true };
  }

  return updatedCart;
};

// Example usage:
const cart = {
  items: {
    1: { id: 1, quantity: 4, selected: true },
    // ...other items
  },
};
