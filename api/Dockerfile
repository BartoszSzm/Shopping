FROM python:3.10

RUN apt-get update && \
    apt-get install -y redis-server && \
    rm -rf /var/lib/apt/lists/*

RUN redis-server --daemonize yes

WORKDIR /code

COPY ./requirements.txt /code/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

COPY . /code

CMD [ "uvicorn", "shoppingAPI.app:app", "--host", "0.0.0.0", "--port", "80" ]