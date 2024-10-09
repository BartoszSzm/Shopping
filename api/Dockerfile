FROM python:3.10

WORKDIR /code

COPY ./requirements.txt /code/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

RUN ./redis-install.sh

COPY . /code

CMD [ "uvicorn", "shoppingAPI.app:app", "--host", "0.0.0.0", "--port", "80" ]