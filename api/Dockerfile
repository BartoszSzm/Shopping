FROM python:3.10

# Update package lists and install Redis server
RUN apt-get update && \
    apt-get install -y redis-server && \
    rm -rf /var/lib/apt/lists/*

# Install Redis Python client
RUN pip install redis

WORKDIR /code

COPY ./requirements.txt /code/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

COPY . /code

CMD [ "uvicorn", "shoppingAPI.app:app", "--host", "0.0.0.0", "--port", "80" ]