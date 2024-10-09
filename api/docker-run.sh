docker build . --tag shopping-api && docker run --rm --init --name shopping-api -p 8004:80 -v .:/code/ -d shopping-api
