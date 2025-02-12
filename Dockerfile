# Stage 1: Download JAR files
FROM maven:3.8.4-openjdk-11 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:copy-dependencies -DoutputDirectory=/app/libs

# Stage 2: final images
FROM python:3.11.0
ENV PYTHONUNBUFFERED 1
ENV TZ=Europe/Paris
ARG DJANGO_SUPERUSER_USERNAME=admin
ARG DJANGO_SUPERUSER_EMAIL=admin@gmail.com
ARG DJANGO_SUPERUSER_PASSWORD=admin123

ARG DJANGO_DEV_SERVER_PORT=8030
ARG DJANGO_STATIC_ROOT=/var/www/static
ARG DJANGO_MEDIA_ROOT=/var/www/media

RUN apt-get update && \
        ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone &&\
        apt-get install -y default-jdk && \
        apt-get clean && \
        rm -rf /var/lib/apt/lists/*

ENV JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64\
        PATH=$PATH:$JAVA_HOME/bin\
        DJANGO_SUPERUSER_USERNAME=$DJANGO_SUPERUSER_USERNAME\
        DJANGO_SUPERUSER_EMAIL=$DJANGO_SUPERUSER_EMAIL\
        DJANGO_SUPERUSER_PASSWORD=$DJANGO_SUPERUSER_PASSWORD\
        DJANGO_DEV_SERVER_PORT=$DJANGO_DEV_SERVER_PORT

RUN export JAVA_HOME && export DJANGO_SUPERUSER_USERNAME && export DJANGO_SUPERUSER_EMAIL && export DJANGO_SUPERUSER_PASSWORD && export PATH

# Copy JAR files from the downloader stage
COPY --from=builder /app/libs/* /app/libs/
ENV CLASSPATH=/app/libs/*
RUN export CLASSPATH

WORKDIR /app
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt
COPY . /app/

EXPOSE $DJANGO_DEV_SERVER_PORT
CMD ["sh", "-c", "python manage.py makemigrations && python manage.py migrate && python manage.py createsuperuser --noinput && python manage.py fake_init && python manage.py runserver 0.0.0.0:$DJANGO_DEV_SERVER_PORT"]
