from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('kroger_app', '0002_cachedstore_searched_zip'),
    ]

    operations = [
        migrations.AddField(
            model_name='cachedstore',
            name='logo_url',
            field=models.URLField(blank=True, default='', help_text='Constructed from chain domain via Clearbit logo API.'),
        ),
        migrations.AddField(
            model_name='cachedstore',
            name='hours',
            field=models.TextField(blank=True, default='', help_text='Typical chain hours as returned by Gemini, e.g. "Mon\u2013Sun 6am\u201311pm".'),
        ),
        migrations.AddField(
            model_name='cachedstore',
            name='review_summary',
            field=models.TextField(blank=True, default='', help_text='2\u20133 sentence customer sentiment summary from Gemini.'),
        ),
        migrations.AddField(
            model_name='cachedstore',
            name='rating',
            field=models.DecimalField(blank=True, decimal_places=1, help_text='Typical customer rating (e.g. 4.2) as reported by Gemini.', max_digits=3, null=True),
        ),
        migrations.AddField(
            model_name='cachedstore',
            name='info_checked',
            field=models.BooleanField(default=False, help_text='True once Gemini has been called for store info, regardless of result.'),
        ),
    ]
