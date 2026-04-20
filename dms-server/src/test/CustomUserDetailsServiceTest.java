package com.example.dmsserver.security;

import com.example.dmsserver.model.Role;
import com.example.dmsserver.model.User;
import com.example.dmsserver.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomUserDetailsServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CustomUserDetailsService customUserDetailsService;

    // Proverqva che pri validen потребител service-vut vrushta UserDetails
    // sus suotvetnite username, hash-parola i pravilna authority (ROLE_ADMIN).
    @Test
    void loadUserByUsername_shouldReturnUserDetailsWithRoleAuthority() {
        User user = new User(UUID.randomUUID(), "admin", "encoded-pass", Role.ADMIN);
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(user));

        UserDetails details = customUserDetailsService.loadUserByUsername("admin");

        assertEquals("admin", details.getUsername());
        assertEquals("encoded-pass", details.getPassword());
        assertTrue(details.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")));
    }

    // Proverqva che pri lipsvasht потребител se hvurlq UsernameNotFoundException
    // i suobshtenieto e tochno "Username not found".
    @Test
    void loadUserByUsername_shouldThrowWhenUserMissing() {
        when(userRepository.findByUsername("missing")).thenReturn(Optional.empty());

        UsernameNotFoundException ex = assertThrows(
                UsernameNotFoundException.class,
                () -> customUserDetailsService.loadUserByUsername("missing")
        );

        assertEquals("Username not found", ex.getMessage());
    }

    // Proverqva za vsqka rolya (ADMIN/AUTHOR/REVIEWER/READER), che se map-va
    // kum tochno edna authority s format ROLE_<ROLENAME>.
    @ParameterizedTest
    @EnumSource(value = Role.class, names = {"ADMIN", "AUTHOR", "REVIEWER", "READER"})
    void loadUserByUsername_shouldMapRoleToSingleAuthority(Role role) {
        String username = role.name().toLowerCase();
        User user = new User(UUID.randomUUID(), username, "hash-" + username, role);
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));

        UserDetails details = customUserDetailsService.loadUserByUsername(username);

        assertEquals(1, details.getAuthorities().size());
        String actualAuthority = details.getAuthorities().iterator().next().getAuthority();
        assertEquals("ROLE_" + role.name(), actualAuthority);
    }

    // Proverqva che service-vut NE promenq hash-parolata,
    // a q vrushta 1:1 kakto e v modela.
    @Test
    void loadUserByUsername_shouldKeepEncodedPasswordAsIs() {
        String encoded = "$2a$10$abcdefghijklmnopqrstuv";
        User user = new User(UUID.randomUUID(), "author", encoded, Role.AUTHOR);
        when(userRepository.findByUsername("author")).thenReturn(Optional.of(user));

        UserDetails details = customUserDetailsService.loadUserByUsername("author");

        assertEquals(encoded, details.getPassword());
    }

    // Proverqva che repository metodut findByUsername se vika tochno vednuj
    // i nqma drugi neochakvani vzaimodeistviq s repository-to.
    @Test
    void loadUserByUsername_shouldCallRepositoryExactlyOnce() {
        User user = new User(UUID.randomUUID(), "reader", "hash", Role.READER);
        when(userRepository.findByUsername("reader")).thenReturn(Optional.of(user));

        customUserDetailsService.loadUserByUsername("reader");

        verify(userRepository, times(1)).findByUsername("reader");
        verifyNoMoreInteractions(userRepository);
    }

    // Proverqva che service-vut podava input username-a kum repository-to bez da go
    // promenq (important za case-sensitive scenarii).
    @Test
    void loadUserByUsername_shouldPassExactUsernameToRepository() {
        String inputUsername = "ReviewerCaseSensitive";
        when(userRepository.findByUsername(inputUsername)).thenReturn(Optional.empty());

        assertThrows(
                UsernameNotFoundException.class,
                () -> customUserDetailsService.loadUserByUsername(inputUsername)
        );

        verify(userRepository).findByUsername(inputUsername);
    }
}
