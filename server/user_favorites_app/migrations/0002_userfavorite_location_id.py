from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user_favorites_app', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='userfavorite',
            name='location_id',
            field=models.CharField(
                blank=True,
                help_text='Kroger location_id — only applicable for product favorites.',
                max_length=50,
                null=True,
            ),
        ),
    ]
