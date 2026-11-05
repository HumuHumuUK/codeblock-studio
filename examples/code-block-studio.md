# Code Block Studio examples

These examples are deliberately compact. Open this Markdown file as a note in Joplin with Code Block Studio enabled, then choose **Format** on a code card to preview the result. Apply, copy, or cancel. Normal editor Undo restores an applied change. Code is never executed.

## python

```python
def greet( name ):
 return {"name":name,"items":[1,2,3]}
```

## bash

```bash
#!/bin/bash
if [ "$x" = y ];then echo "ok";else echo "no";fi
```

## sh

```sh
for x in a b;do echo "$x";done
```

## go

```go
package main
func main(){println("hello")}
```

## c

```c
int main(){return 0;}
```

## cpp

```cpp
#include <iostream>
int main(){std::cout<<"Hi";return 0;}
```

## csharp

```csharp
class Example{static void Main(){System.Console.WriteLine("Hi");}}
```

## java

```java
class Example{public static void main(String[] args){System.out.println("Hi");}}
```

## objc

```objc
@interface Example:NSObject
-(void)hello;
@end
```

## proto

```proto
syntax="proto3";message Example{string name=1;}
```

## sql

```sql
select id,name from users where active=1 order by name;
```

## postgresql

```postgresql
select id,name from users where active=true limit 5;
```

## mysql

```mysql
select `id`,`name` from `users` limit 5;
```

## mariadb

```mariadb
select `id`,`name` from `users` limit 5;
```

## sqlite

```sqlite
select id,name from users limit 5;
```

## tsql

```tsql
select top 5 [id],[name] from [users];
```

## bigquery

```bigquery
select id,name from `project.dataset.users` limit 5;
```

## xml

```xml
<root><item key="x">value</item></root>
```

## toml

```toml
# Configuration
name="example"
items=[1,2,3]
```

## php

```php
<?php function greet($name){return "Hello ".$name;}
```

## graphql

```graphql
query{user(id:1){id name}}
```

## vue

```vue
<template><div>{{name}}</div></template>
```

## angular

```angular
<div>{{name}}</div>
```
