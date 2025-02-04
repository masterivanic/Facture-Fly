
start_app:
	python manage.py runserver

builddocker:
	docker build -t facture-fly:1.0.SNAPSHOT .

wait_db:
	python manage.py wait_for_db

migrate:
	python manage.py makemigrations && python manage.py migrate

flushdb:
	python manage.py flush -y

collectstatic:
	python manage.py collectstatic --noinput
