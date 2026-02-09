package com.example.ecommerce.service;

import com.example.ecommerce.model.Cart;
import com.example.ecommerce.repository.CartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CartService {

    private final CartRepository cartRepository;

    @Autowired
    public CartService(CartRepository cartRepository) {
        this.cartRepository = cartRepository;
    }

    public List<Cart> getCartItems(Long userId) {
        return cartRepository.findByUserId(userId);
    }

    public Cart addItemToCart(Cart cartItem) {
        return cartRepository.save(cartItem);
    }

    public void removeItemFromCart(Long itemId) {
        cartRepository.deleteById(itemId);
    }

    public void checkout(Long userId) {
        List<Cart> cartItems = cartRepository.findByUserId(userId);
        // Here you could create an order, but for now, just clear the cart
        cartRepository.deleteAll(cartItems);
    }
}