package com.example.serviceapp.repository;

import com.example.serviceapp.entity.ServiceListing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceListingRepository extends JpaRepository<ServiceListing, Long> {
    List<ServiceListing> findByCategoryId(Long categoryId);
    List<ServiceListing> findByUserId(Long userId);
}
