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

## Additional practical languages

PowerShell formatting targets PowerShell 7; Rust uses the 2021 edition. The new formatters run locally and never execute these examples.

### powershell

```powershell
function Get-Greeting{
param([string]$Name)
Write-Output "Hello, $Name"
}
```

### lua

```lua
local values={1,2,3}
for _,value in ipairs(values) do print(value) end
```

### dart

```dart
void main(){final names=["Ada","Leonard"];print(names.join(", "));}
```

### rust

```rust
fn main(){let values=vec![1,2,3];println!("{:?}",values);}
```

### dockerfile

```dockerfile
from alpine:3.20
workdir /app
copy . .
run printf "Hello from Code Block Studio\n"
```

### terraform

```terraform
locals {
project="code-block-studio"
enabled=true
}
```

### hcl

```hcl
service "example" {
port=8080
tags=["local","demo"]
}
```

### plsql

```plsql
select id,name from users where rownum<=5;
```

### snowflake

```snowflake
select id,name from users qualify row_number() over (order by id)=1;
```

### duckdb

```duckdb
select * from range(5);
```

### redshift

```redshift
select top 5 id,name from users;
```

### db2

```db2
select id,name from users fetch first 5 rows only;
```

### hive

```hive
select id,name from users limit 5;
```

## Retro BASIC listings

These text listings keep their original program numbers, case, statements, strings, comments and DATA. Formatting aligns program numbers and indents recognised blocks; it does not renumber or split lines. Use explicit dialect labels for the relevant loop/block rules. Generic BASIC colouring does not recognise every machine-specific command.

### basic

```basic
10 FOR I=1 TO 3
20 PRINT "HELLO";I
30 NEXT I
100 END
```

### bbc-basic

```bbc-basic
10 counter%=0
20 REPEAT
30 counter%=counter%+1
40 PRINT counter%
50 UNTIL counter%=3
60 END
```

### sinclair-basic

```sinclair-basic
10 FOR n=1 TO 3
20 PRINT "HELLO ";n
30 NEXT n
40 STOP
```

### commodore-basic

```commodore-basic
10 REM COMMODORE DEMO
20 FOR I=1 TO 3
30 PRINT "HELLO";I
40 NEXT I
50 END
```

### locomotive-basic

```locomotive-basic
10 MODE 1
20 FOR i=1 TO 3
30 PRINT "HELLO";i
40 NEXT i
50 END
```

### applesoft

```applesoft
10 HOME
20 FOR I=1 TO 3
30 PRINT "HELLO";I
40 NEXT I
50 END
```

### gwbasic

```gwbasic
10 CLS
20 FOR I=1 TO 3
30 PRINT "HELLO";I
40 NEXT I
50 END
```

### qbasic

```qbasic
FOR n=1 TO 3
IF n=2 THEN
PRINT "MIDDLE"
ELSE
PRINT n
END IF
NEXT n
```

### atari-basic

```atari-basic
10 GRAPHICS 0
20 FOR I=1 TO 3
30 PRINT "HELLO";I
40 NEXT I
50 END
```

### amos

```amos
For I=1 To 3
Print "HELLO";I
Next I
End
```
