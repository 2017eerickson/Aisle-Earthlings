from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver


class AppUserManager(BaseUserManager):
    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("Email must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self._create_user(email, password, **extra_fields)


class AppUser(AbstractUser):
    """
    Replaces Django's default User.
    Uses email as the login identifier instead of username.

    Required in settings.py:
        AUTH_USER_MODEL = 'users_app.AppUser'
    """
    username = None
    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = AppUserManager()

    class Meta:
        verbose_name = 'user'
        verbose_name_plural = 'users'

    def __str__(self):
        return self.email


class UserProfile(models.Model):
    """
    Per-user preferences.
    Stores the zip code they last searched from and their preferred Kroger store.
    preferred_location_id is a soft reference to CachedStore.location_id.
    """
    user = models.OneToOneField(
        AppUser,
        on_delete=models.CASCADE,
        related_name='profile',
    )
    zip_code = models.CharField(
        max_length=5,
        blank=True,
        default='',
        help_text='5-digit zip used to look up nearby stores.',
    )
    preferred_location_id = models.CharField(
        max_length=20,
        blank=True,
        default='',
        help_text="Kroger locationId for the user's chosen store. Soft ref to CachedStore.",
    )
    gemini_uses = models.PositiveIntegerField(
        default=0,
        help_text='Number of fresh Gemini vegan checks this user has made.',
    )
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Profile({self.user.email})'

    @property
    def preferred_store(self):
        """Returns the CachedStore for this user's preferred location, or None."""
        if not self.preferred_location_id:
            return None
        try:
            from kroger_app.models import CachedStore
            return CachedStore.objects.get(location_id=self.preferred_location_id)
        except Exception:
            return None


@receiver(post_save, sender=AppUser)
def create_user_profile_and_list(sender, instance, created, **kwargs):
    """Auto-create UserProfile and ShoppingList when a new user registers."""
    if created:
        UserProfile.objects.create(user=instance)
        from list_app.models import ShoppingList
        ShoppingList.objects.create(user=instance)
