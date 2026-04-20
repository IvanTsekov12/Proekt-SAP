package com.example.dmsserver.config;

import com.example.dmsserver.model.Role;
import com.example.dmsserver.model.User;
import com.example.dmsserver.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {

        if (userRepository.count() > 0) {
            return;
        }

        User admin = new User(
                UUID.randomUUID(),
                "admin",
                passwordEncoder.encode("admin123"),
                Role.ADMIN
        );

        User author = new User(
                UUID.randomUUID(),
                "author",
                passwordEncoder.encode("author123"),
                Role.AUTHOR
        );

        User reviewer = new User(
                UUID.randomUUID(),
                "reviewer",
                passwordEncoder.encode("reviewer123"),
                Role.REVIEWER
        );

        User reader = new User(
                UUID.randomUUID(),
                "reader",
                passwordEncoder.encode("reader123"),
                Role.READER
        );

        userRepository.save(admin);
        userRepository.save(author);
        userRepository.save(reviewer);
        userRepository.save(reader);
    }


}
