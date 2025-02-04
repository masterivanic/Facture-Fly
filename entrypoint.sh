while ! PGPASSWORD=8Fny?aXEFkh9ePA3 psql -h ${POSTGRES_HOST} -U postgres -c '\q'; do echo "En attente du demarrage de postgresql..." && sleep 1; done
echo "BD demarré avec succès.......>>"
if ! PGPASSWORD=8Fny?aXEFkh9ePA3 psql -U postgres -h ${POSTGRES_HOST} -p ${POSTGRES_PORT} -lqt | cut -d \| -f 1 | cut -d ' ' -f 2 | grep -q "^facture_fly$"; then
    PGPASSWORD=8Fny?aXEFkh9ePA3 createdb -U postgres -h ${POSTGRES_HOST} -p ${POSTGRES_PORT} facture_fly
else
    echo "La database existe déjà..."
fi

mkdir -p ${DJANGO_STATIC_ROOT} && chown flyadm:www-data ${DJANGO_STATIC_ROOT}
mkdir -p ${DJANGO_MEDIA_ROOT} && chown flyadm:www-data ${DJANGO_MEDIA_ROOT}
mkdir -p ${POSTGRES_DATA} && chown flyadm:www-data ${POSTGRES_DATA}

gosu flyadm make wait_db
gosu flyadm make migrate
gosu flyadm make collectstatic

exec gosu flyadm uwsgi --http-socket :${DJANGO_DEV_SERVER_PORT} --uid ekiladm --ini config_files/basic-docker.ini --processes 4 --threads 2 --wsgi-file fature_fly/wsgi.py
