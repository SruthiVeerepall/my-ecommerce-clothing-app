package com.example.ecommerce.service;

import com.example.ecommerce.model.Cart;
import com.example.ecommerce.model.Order;
import com.example.ecommerce.repository.CartRepository;
import com.example.ecommerce.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;

    @Autowired
    public CartService(CartRepository cartRepository, OrderRepository orderRepository) {
        this.cartRepository = cartRepository;
        this.orderRepository = orderRepository;
    }

    public List<Cart> getCartItems(Long userId) {
        return cartRepository.findByUserId(userId);
    }

    public Cart addItemToCart(Cart cartItem) {
        Optional<Cart> existingItem = cartRepository.findByUserIdAndProductId(cartItem.getUserId(), cartItem.getProductId());
        
        Cart savedItem;
        if (existingItem.isPresent()) {
            Cart item = existingItem.get();
            item.setQuantity(item.getQuantity() + cartItem.getQuantity());
            savedItem = cartRepository.save(item);
        } else {
            savedItem = cartRepository.save(cartItem);
        }
        
        // Manually reload the item with its product details to satisfy "added with all details"
        return cartRepository.findById(savedItem.getId()).orElse(savedItem);
    }

    public void removeItemFromCart(Long itemId) {
        cartRepository.deleteById(itemId);
    }

    public Cart updateCartItemQuantity(Long itemId, Integer newQuantity) {
        Optional<Cart> cartItem = cartRepository.findById(itemId);
        if (cartItem.isPresent()) {
            Cart item = cartItem.get();
            if (newQuantity <= 0) {
                cartRepository.deleteById(itemId);
                return null;
            }
            item.setQuantity(newQuantity);
            return cartRepository.save(item);
        }
        return null;
    }

    public void checkout(Long userId) {
        List<Cart> cartItems = cartRepository.findByUserId(userId);
        if (cartItems.isEmpty()) {
            return;
        }

        double totalAmount = cartItems.stream()
                .mapToDouble(item -> {
                    if (item.getProduct() != null) {
                        return item.getProduct().getPrice() * item.getQuantity();
                    }
                    return 0;
                })
                .sum();

        Order order = new Order(userId, totalAmount, new Date(), "PENDING");
        orderRepository.save(order);
        
        // Clear the cart after creating order
        cartRepository.deleteAll(cartItems);
    }
}
