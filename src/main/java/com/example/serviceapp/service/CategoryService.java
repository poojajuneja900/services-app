package com.example.serviceapp.service;

import com.example.serviceapp.entity.Category;
import com.example.serviceapp.exception.ResourceNotFoundException;
import com.example.serviceapp.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<Category> getAll() {
        return categoryRepository.findAll();
    }

    public Category getById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    }

    public Category create(Category category) {
        return categoryRepository.save(category);
    }

    public Category update(Long id, Category updated) {
        Category existing = getById(id);
        existing.setCategoryName(updated.getCategoryName());
        return categoryRepository.save(existing);
    }

    public void delete(Long id) {
        Category existing = getById(id);
        categoryRepository.delete(existing);
    }
}
