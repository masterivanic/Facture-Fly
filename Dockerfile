FROM python:3.11.0
ENV PYTHONUNBUFFERED 1
ENV TZ=Europe/Paris
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
RUN apt-get update && \
        apt-get install -y default-jdk && \
        apt-get clean && \
        rm -rf /var/lib/apt/lists/*

ENV JAVA_HOME /usr/lib/jvm/java-11-openjdk-amd64
ENV PATH $PATH:$JAVA_HOME/bin
RUN export JAVA_HOME

ARG DJANGO_DEV_SERVER_PORT=8030
ARG DJANGO_STATIC_ROOT=/var/www/static
ARG DJANGO_MEDIA_ROOT=/var/www/media

ENV DJANGO_DEV_SERVER_PORT=$DJANGO_DEV_SERVER_PORT

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

EXPOSE $DJANGO_DEV_SERVER_PORT
CMD ["sh", "-c", "python manage.py makemigrations && python manage.py migrate && python manage.py runserver 0.0.0.0:$DJANGO_DEV_SERVER_PORT"]
