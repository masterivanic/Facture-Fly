FROM python:3.11.0
ENV PYTHONUNBUFFERED 1
ENV TZ=Europe/Paris
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
RUN apt-get update && \
        apt-get install -y default-jdk && \
        apt-get clean && \
        rm -rf /var/lib/apt/lists/*

ARG DJANGO_SUPERUSER_USERNAME=admin
ARG DJANGO_SUPERUSER_EMAIL=admin@gmail.com
ARG DJANGO_SUPERUSER_PASSWORD=admin123

ENV JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64\
        PATH=$PATH:$JAVA_HOME/bin\
        DJANGO_SUPERUSER_USERNAME=$DJANGO_SUPERUSER_USERNAME\
        DJANGO_SUPERUSER_EMAIL=$DJANGO_SUPERUSER_EMAIL\
        DJANGO_SUPERUSER_PASSWORD=$DJANGO_SUPERUSER_PASSWORD


RUN export JAVA_HOME && export DJANGO_SUPERUSER_USERNAME && export DJANGO_SUPERUSER_EMAIL && export DJANGO_SUPERUSER_PASSWORD

ARG DJANGO_DEV_SERVER_PORT=8030
ARG DJANGO_STATIC_ROOT=/var/www/static
ARG DJANGO_MEDIA_ROOT=/var/www/media

ENV DJANGO_DEV_SERVER_PORT=$DJANGO_DEV_SERVER_PORT

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

EXPOSE $DJANGO_DEV_SERVER_PORT
CMD ["sh", "-c", "python manage.py makemigrations && python manage.py migrate && python manage.py createsuperuser --noinput && python manage.py runserver 0.0.0.0:$DJANGO_DEV_SERVER_PORT"]
