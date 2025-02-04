FROM python:3.11.0
ENV PYTHONUNBUFFERED 1
ENV TZ=Europe/Paris
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
RUN groupadd -r flyadm; \
        useradd -r -m -g flyadm flyadm; \
        mkdir /app; \
        chown flyadm /app; \
        apt-get update; \
        apt-get install -y locales postgresql-client locales-all python3-dev

ARG DJANGO_DEV_SERVER_PORT=8030
ARG POSTGRES_PORT=5432
ARG POSTGRES_HOST=db
ARG FRONT_HOST=http://localhost:8030
ARG DJANGO_STATIC_ROOT=/var/www/static
ARG DJANGO_MEDIA_ROOT=/var/www/media
ARG POSTGRES_DATA=/var/lib/postgresql/data/

ENV DJANGO_DEV_SERVER_PORT=$DJANGO_DEV_SERVER_PORT\
        DJANGO_STATIC_ROOT=$DJANGO_STATIC_ROOT\
        FRONT_HOST=$FRONT_HOST \
        DJANGO_MEDIA_ROOT=$DJANGO_MEDIA_ROOT\
        POSTGRES_DATA=$POSTGRES_DATA\
        POSTGRES_PORT=$POSTGRES_PORT\
        POSTGRES_HOST=$POSTGRES_HOST\
        GOSU_VERSION=1.17

RUN apt-get update; \
        apt-get install -y --no-install-recommends ca-certificates gnupg wget dos2unix; \
        rm -rf /var/lib/apt/lists/*; \
        dpkgArch="$(dpkg --print-architecture | awk -F- '{ print $NF }')"; \
        wget -O /usr/local/bin/gosu "https://github.com/tianon/gosu/releases/download/$GOSU_VERSION/gosu-$dpkgArch"; \
        wget -O /usr/local/bin/gosu.asc "https://github.com/tianon/gosu/releases/download/$GOSU_VERSION/gosu-$dpkgArch.asc"; \
        export GNUPGHOME="$(mktemp -d)"; \
        gpg --batch --keyserver hkps://keys.openpgp.org --recv-keys B42F6819007F00F88E364FD4036A9C25BF357DD4; \
        gpg --batch --verify /usr/local/bin/gosu.asc /usr/local/bin/gosu; \
        gpgconf --kill all; \
        rm -rf /usr/local/bin/gosu.asc; \
        chmod +x /usr/local/bin/gosu; \
        gosu --version; \
        gosu nobody true

RUN pip3 install uwsgi

WORKDIR /app
COPY requirements.txt .

COPY . /app
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY entrypoint.sh /entrypoint.sh
RUN chown -R flyadm:flyadm /app
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
EXPOSE $DJANGO_DEV_SERVER_PORT
