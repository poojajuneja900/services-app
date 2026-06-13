package com.example.serviceapp.service;

import com.example.serviceapp.entity.Category;
import com.example.serviceapp.entity.ServiceListing;
import com.example.serviceapp.entity.User;
import com.example.serviceapp.exception.ResourceNotFoundException;
import com.example.serviceapp.repository.CategoryRepository;
import com.example.serviceapp.repository.ServiceListingRepository;
import com.example.serviceapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ServiceListingService {

    private final ServiceListingRepository serviceListingRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public List<ServiceListing> getAll() {
        return serviceListingRepository.findAll();
    }

    public ServiceListing getById(Long id) {
        return serviceListingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + id));
    }

    public List<ServiceListing> getByCategory(Long categoryId) {
        return serviceListingRepository.findByCategoryId(categoryId);
    }

    public List<ServiceListing> getByUser(Long userId) {
        return serviceListingRepository.findByUserId(userId);
    }

    public ServiceListing create(ServiceListing serviceListing) {
        Category category = categoryRepository.findById(serviceListing.getCategory().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + serviceListing.getCategory().getId()));
        User user = userRepository.findById(serviceListing.getUser().getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + serviceListing.getUser().getId()));
        serviceListing.setCategory(category);
        serviceListing.setUser(user);
        return serviceListingRepository.save(serviceListing);
    }

    public ServiceListing update(Long id, ServiceListing updated) {
        ServiceListing existing = getById(id);

        Category category = categoryRepository.findById(updated.getCategory().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + updated.getCategory().getId()));
        User user = userRepository.findById(updated.getUser().getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + updated.getUser().getId()));

        existing.setCategory(category);
        existing.setUser(user);
        existing.setTitle(updated.getTitle());
        existing.setDescription(updated.getDescription());
        existing.setAmount(updated.getAmount());
        existing.setUnit(updated.getUnit());

        return serviceListingRepository.save(existing);
    }

    public void delete(Long id) {
        ServiceListing existing = getById(id);
        serviceListingRepository.delete(existing);
    }
}
