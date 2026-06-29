# GET con parámetro

``` bash
curl http://localhost:3000/usuarios/1
```

# POST

``` bash
curl -X POST http://localhost:3000/usuarios \
-H "Content-Type: application/json" \
-d '{"usuario":"pedro","password":"9999","rol":"user"}'
```
# PUT con parámetro

``` bash
curl -X PUT http://localhost:3000/usuarios/1 \
-H "Content-Type: application/json" \
-d '{"usuario":"juan_editado","password":"12345","rol":"admin"}'
```
# DELETE con parámetro
```bash
curl -X DELETE http://localhost:3000/usuarios/2
```