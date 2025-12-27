FROM python:3.10

RUN apt-get update && \
    apt-get install -y redis-server && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /code

RUN pip install poetry

COPY . /code

RUN poetry install --no-root

CMD [ "/code/run.sh" ]

