package com.example.serviceapp.controller;

import com.example.serviceapp.entity.ServiceListing;
import com.example.serviceapp.service.ServiceListingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/services")
@RequiredArgsConstructor
public class ServiceListingController {

    private final ServiceListingService serviceListingService;

    @GetMapping
    public ResponseEntity<List<ServiceListing>> getAll() {
        return ResponseEntity.ok(serviceListingService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceListing> getById(@PathVariable Long id) {
        return ResponseEntity.ok(serviceListingService.getById(id));
    }

    @GetMapping("/by-category/{categoryId}")
    public ResponseEntity<List<ServiceListing>> getByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(serviceListingService.getByCategory(categoryId));
    }

    @GetMapping("/by-user/{userId}")
    public ResponseEntity<List<ServiceListing>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(serviceListingService.getByUser(userId));
    }

    @PostMapping
    public ResponseEntity<ServiceListing> create(@Valid @RequestBody ServiceListing serviceListing) {
        return ResponseEntity.status(HttpStatus.CREATED).body(serviceListingService.create(serviceListing));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceListing> update(@PathVariable Long id, @Valid @RequestBody ServiceListing serviceListing) {
        return ResponseEntity.ok(serviceListingService.update(id, serviceListing));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        serviceListingService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
