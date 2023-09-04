function addItemGuestCart(productId, cart) {
  if (cart) {
    let updatedCart = cart.slice();
    const existingItem = updatedCart.find(
      (item) => item.item_id === parseInt(productId)
    );
    if (existingItem) {
      existingItem.item_quantity++;
    } else {
      updatedCart.push({
        cart_id: 0,
        item_id: parseInt(productId),
        item_quantity: 1,
      });
    }
    return updatedCart;
  } else {
    return [{ cart_id: 0, item_id: parseInt(productId), item_quantity: 1 }];
  }
}

function deleteGuestCartItem(productId, cart) {
  if (cart) {
    let updatedCart = cart.slice();
    const itemIndex = updatedCart.findIndex(
      (item) => item.item_id === parseInt(productId)
    );
    if (itemIndex !== -1) {
      if (updatedCart[itemIndex].item_quantity > 1) {
        updatedCart[itemIndex].item_quantity--;
      } else {
        updatedCart.splice(itemIndex, 1);
      }
    }
    return updatedCart;
  } else {
    return [];
  }
}

module.exports = { addItemGuestCart, deleteGuestCartItem };
