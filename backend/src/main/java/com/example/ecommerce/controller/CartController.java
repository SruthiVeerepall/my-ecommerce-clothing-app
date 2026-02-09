package com.example.ecommerce.controller;

import com.example.ecommerce.model.Cart;
import com.example.ecommerce.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @GetMapping("/{userId}")
    public ResponseEntity<List<Cart>> getCartItems(@PathVariable Long userId) {
        List<Cart> cartItems = cartService.getCartItems(userId);
        return ResponseEntity.ok(cartItems);
    }

    @PostMapping("/add")
    public ResponseEntity<Cart> addItemToCart(@RequestBody Cart cartItem) {
        Cart addedItem = cartService.addItemToCart(cartItem);
        return ResponseEntity.ok(addedItem);
    }

    @DeleteMapping("/remove/{itemId}")
    public ResponseEntity<Void> removeItemFromCart(@PathVariable Long itemId) {
        cartService.removeItemFromCart(itemId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/checkout/{userId}")
    public ResponseEntity<Void> checkout(@PathVariable Long userId) {
        cartService.checkout(userId);
        return ResponseEntity.ok().build();
    }
}