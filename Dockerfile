FROM python:3.11.0
ENV PYTHONUNBUFFERED 1
ENV TZ=Europe/Paris
ARG DJANGO_SUPERUSER_USERNAME=admin
ARG DJANGO_SUPERUSER_EMAIL=admin@gmail.com
ARG DJANGO_SUPERUSER_PASSWORD=admin123

ARG DJANGO_DEV_SERVER_PORT=8030
ARG DJANGO_STATIC_ROOT=/var/www/static
ARG DJANGO_MEDIA_ROOT=/var/www/media

ENV DJANGO_SUPERUSER_USERNAME=$DJANGO_SUPERUSER_USERNAME\
        DJANGO_SUPERUSER_EMAIL=$DJANGO_SUPERUSER_EMAIL\
        DJANGO_SUPERUSER_PASSWORD=$DJANGO_SUPERUSER_PASSWORD\
        DJANGO_DEV_SERVER_PORT=$DJANGO_DEV_SERVER_PORT

RUN apt-get update && \
        ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone &&\
        apt-get install -y default-jdk && \
        apt-get clean && \
        rm -rf /var/lib/apt/lists/*

RUN export DJANGO_SUPERUSER_USERNAME && export DJANGO_SUPERUSER_EMAIL && export DJANGO_SUPERUSER_PASSWORD

WORKDIR /facture_fly_app
COPY requirements.txt /facture_fly_app/
RUN pip install --no-cache-dir -r requirements.txt
COPY . /facture_fly_app/

EXPOSE $DJANGO_DEV_SERVER_PORT
CMD ["sh", "-c", "python manage.py makemigrations && python manage.py migrate && python manage.py createsuperuser --noinput && python manage.py fake_init && python manage.py runserver 0.0.0.0:$DJANGO_DEV_SERVER_PORT"]
