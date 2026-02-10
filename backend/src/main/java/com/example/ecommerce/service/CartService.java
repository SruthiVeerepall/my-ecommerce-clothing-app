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
        
        if (existingItem.isPresent()) {
            Cart item = existingItem.get();
            item.setQuantity(item.getQuantity() + cartItem.getQuantity());
            return cartRepository.save(item);
        } else {
            return cartRepository.save(cartItem);
        }
    }

    public void removeItemFromCart(Long itemId) {
        cartRepository.deleteById(itemId);
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
