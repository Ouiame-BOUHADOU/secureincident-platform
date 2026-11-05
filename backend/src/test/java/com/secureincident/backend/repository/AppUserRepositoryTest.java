
package com.secureincident.backend.repository;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import com.secureincident.backend.entity.AppUser;
import com.secureincident.backend.enums.UserRole;

@DataJpaTest
class AppUserRepositoryTest {

    @Autowired
    private AppUserRepository appUserRepository;

    @Test
    void shouldSaveAndFindUserByEmail() {

        // Arrange: create a test user
        AppUser user = new AppUser();
        user.setFullName("Test Employee");
        user.setEmail("employee@test.com");
        user.setPasswordHash("test-hash");
        user.setRole(UserRole.EMPLOYEE);

        // Act: save and retrieve the user
        appUserRepository.save(user);

        var foundUser =
                appUserRepository.findByEmail("employee@test.com");

        // Assert: verify the result
        assertThat(foundUser).isPresent();
        assertThat(foundUser.get().getFullName())
                .isEqualTo("Test Employee");
        assertThat(foundUser.get().getRole())
                .isEqualTo(UserRole.EMPLOYEE);
        assertThat(foundUser.get().getCreatedAt()).isNotNull();
    }
}
