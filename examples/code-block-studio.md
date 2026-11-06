# Code Block Studio — language and retro examples

A fresh sample collection for Code Block Studio 1.7.3 or later: the main programming languages come first, followed by web, data, configuration and SQL. The retro computers and BBC display modes are grouped at the end.

Import this file into Joplin using **File → Import → MD – Markdown (file)**, or paste its Markdown source into a new note. View the cards in Markdown preview or the Rich Text editor. The Markdown source editor remains a source view.

## Try these controls

1. Choose **Format** to compare Original and Formatted. Many examples deliberately have untidy spacing. **Cancel** and the two Copy options leave the note unchanged; **Apply formatting** changes only that block. Use normal **Undo** to restore it.
2. **Copy** copies the original code without the toolbar or display line numbers. **Wrap** keeps long lines inside the card.
3. The machine-specific examples near the end start with **Retro display** ticked. Untick and retick it to compare the original-style screen with ordinary syntax highlighting. BBC blocks also have a display-mode selector.
4. In Rich Text, edit a code block and use the searchable **Language** field to change its language. After saving, try the Retro checkbox again. Leave different blocks on and off, then reopen the note to check their saved choices.

All highlighting and formatting happen locally; none of these examples is executed. The collection covers every supported formatter language or dialect, without repeating its aliases. Short labels such as `py`, `js`, `c64`, `bbc`, `spectrum` and `amstrad` work too.

## Find a section

- [Everyday programming and scripting](#everyday-programming-and-scripting)
- [Web languages and frameworks](#web-languages-and-frameworks)
- [Data and configuration](#data-and-configuration)
- [SQL and database dialects](#sql-and-database-dialects)
- [Retro computers and BASIC](#retro-computers-and-basic)
- [BBC Micro display modes](#bbc-micro-display-modes)

## Everyday programming and scripting

Start here to try the main languages. PowerShell formatting targets PowerShell 7; Rust uses the 2021 edition.

### Python

```python
def greet( name ):
 return {"name":name,"items":[1,2,3]}
```

### PowerShell

```powershell
function Get-Greeting{
param([string]$Name)
Write-Output "Hello, $Name"
}
```

### Bash

```bash
#!/bin/bash
if [ "$x" = y ];then echo "ok";else echo "no";fi
```

### POSIX shell

```sh
for x in a b;do echo "$x";done
```

### JavaScript

```javascript
const greet=(name)=>{return {name:name,items:[1,2,3]}};
```

### TypeScript

```typescript
interface Person{name:string;age:number}
const greet=(person:Person):string=>{return `Hello ${person.name}`};
```

### C

```c
int main(){return 0;}
```

### C++

```cpp
#include <iostream>
int main(){std::cout<<"Hi";return 0;}
```

### C#

```csharp
class Example{static void Main(){System.Console.WriteLine("Hi");}}
```

### Java

```java
class Example{public static void main(String[] args){System.out.println("Hi");}}
```

### Go

```go
package main
func main(){println("hello")}
```

### Rust

```rust
fn main(){let values=vec![1,2,3];println!("{:?}",values);}
```

### Lua

```lua
local values={1,2,3}
for _,value in ipairs(values) do print(value) end
```

### Dart

```dart
void main(){final names=["Ada","Leonard"];print(names.join(", "));}
```

### PHP

```php
<?php function greet($name){return "Hello ".$name;}
```

### Objective-C

```objc
@interface Example:NSObject
-(void)hello;
@end
```

### Protocol Buffers

```proto
syntax="proto3";message Example{string name=1;}
```

## Web languages and frameworks

Try syntax highlighting, formatting and wrapping on markup, styles and components.

### HTML

```html
<section><h1>Code Block Studio</h1><p>Local formatting, with a preview.</p></section>
```

### CSS

```css
.card{color:#369;padding:8px 16px;margin:0 auto;}
```

### SCSS

```scss
$accent:#369;.card{color:$accent;&:hover{color:white;}}
```

### Less

```less
@accent:#369;.card{color:@accent;&:hover{color:white;}}
```

### React JSX

```jsx
const Greeting=({name})=><section><h1>Hello {name}</h1><p>Welcome!</p></section>;
```

### React TSX

```tsx
const Greeting=({name}:{name:string})=><section><h1>Hello {name}</h1></section>;
```

### Vue

```vue
<template><div>{{name}}</div></template>
```

### Angular

```angular
<div>{{name}}</div>
```

## Data and configuration

Structured data, documents and infrastructure configuration use their own explicit language labels.

### JSON

```json
{"name":"Code Block Studio","enabled":true,"items":[1,2,3]}
```

### JSON with comments

```jsonc
// A comment that should survive formatting.
{"enabled":true,"items":[1,2,3]}
```

### JSON5

```json5
{name:'Code Block Studio',enabled:true,items:[1,2,3,],}
```

### YAML

```yaml
name: Code Block Studio
items: [one,two,three]
settings: {enabled: true, count: 3}
```

### XML

```xml
<root><item key="x">value</item></root>
```

### TOML

```toml
# Configuration
name="example"
items=[1,2,3]
```

### Markdown

```markdown
# A small sample

*   First item
*   Second item with **bold** text

[Example](https://example.com)
```

### GraphQL

```graphql
query{user(id:1){id name}}
```

### Dockerfile

```dockerfile
from alpine:3.20
workdir /app
copy . .
run printf "Hello from Code Block Studio\n"
```

### Terraform / OpenTofu

```terraform
locals {
project="code-block-studio"
enabled=true
}
```

### HCL

```hcl
service "example" {
port=8080
tags=["local","demo"]
}
```

## SQL and database dialects

Choose the dialect that matches your database. Formatting previews do not connect to a database or run queries.

### SQL

```sql
select id,name from users where active=1 order by name;
```

### PostgreSQL

```postgresql
select id,name from users where active=true limit 5;
```

### MySQL

```mysql
select `id`,`name` from `users` limit 5;
```

### MariaDB

```mariadb
select `id`,`name` from `users` limit 5;
```

### SQLite

```sqlite
select id,name from users limit 5;
```

### SQL Server / T-SQL

```tsql
select top 5 [id],[name] from [users];
```

### BigQuery

```bigquery
select id,name from `project.dataset.users` limit 5;
```

### Oracle / PL/SQL

```plsql
select id,name from users where rownum<=5;
```

### Snowflake

```snowflake
select id,name from users qualify row_number() over (order by id)=1;
```

### DuckDB

```duckdb
select * from range(5);
```

### Redshift

```redshift
select top 5 id,name from users;
```

### DB2

```db2
select id,name from users fetch first 5 rows only;
```

### Hive

```hive
select id,name from users limit 5;
```

## Retro computers and BASIC

The computer collection starts here. Machine-specific blocks have **Retro display** enabled, using their bundled fonts and screen palettes. Untick it for ordinary highlighting; tick it again to restore the screen. Both formatting comparison panes follow the selected display. Generic BASIC has no single machine profile.

These text listings keep their program numbers, case, statements, strings, comments and DATA. Formatting aligns program numbers and indents recognised blocks; it does not renumber or split lines. The display is a preset: MODE, VDU, INK and similar commands are not executed.

### Generic BASIC

```basic
10 FOR I=1 TO 3
20 PRINT "HELLO";I
30 NEXT I
100 END
```

### Commodore 64 — BASIC V2

```commodore-basic retro title="c64-demo.bas"
10 REM COMMODORE DEMO
20 FOR I=1 TO 3
30 PRINT "HELLO";I
40 NEXT I
50 END
```

### BBC Micro / Master — BBC BASIC

```bbc-basic retro title="bbc-micro-demo.bas"
10 counter%=0
20 REPEAT
30 counter%=counter%+1
40 PRINT counter%
50 UNTIL counter%=3
60 END
```

### ZX Spectrum — Sinclair BASIC

```sinclair-basic retro title="zx-spectrum-demo.bas"
10 FOR n=1 TO 3
20 PRINT "HELLO ";n
30 NEXT n
40 STOP
```

### Sinclair ZX81

ZX81 BASIC — black on white. The listing is uppercase, as on the original machine.

```zx81-basic retro title="zx81-basic-demo.bas"
10 FOR N=1 TO 3
20 PRINT "HELLO, ZX81";N
30 NEXT N
40 STOP
```

### Amstrad CPC — Locomotive BASIC

```locomotive-basic retro title="amstrad-cpc-demo.bas"
10 MODE 1
20 FOR i=1 TO 3
30 PRINT "HELLO";i
40 NEXT i
50 END
```

### Apple II — Applesoft BASIC

```applesoft retro title="apple-ii-demo.bas"
10 HOME
20 FOR I=1 TO 3
30 PRINT "HELLO";I
40 NEXT I
50 END
```

### Macintosh — Microsoft BASIC

Macintosh Microsoft BASIC — Monaco code font, Chicago caption, black on white.

```mac-basic retro title="mac-basic-demo.bas"
10 FOR I=1 TO 3
20 PRINT "Hello, Macintosh!";I
30 NEXT I
40 END
```

### Macintosh — QuickBASIC

Macintosh QuickBASIC — the same classic Macintosh screen, with structured BASIC layout.

```mac-quickbasic retro title="mac-quickbasic-demo.bas"
FOR I=1 TO 3
IF I=2 THEN
PRINT "Hello, QuickBASIC!"
END IF
NEXT I
```

### Atari 8-bit — Atari BASIC

```atari-basic retro title="atari-demo.bas"
10 GRAPHICS 0
20 FOR I=1 TO 3
30 PRINT "HELLO";I
40 NEXT I
50 END
```

### Atari ST — STOS

Atari ST / STOS — ST low-resolution characters, white on black.

```stos retro title="stos-demo.bas"
10 MODE 0
20 FOR I=1 TO 3
30 PRINT "HELLO, STOS!";I
40 NEXT I
50 END
```

### Atari ST — GFA BASIC

Atari ST / GFA BASIC — ST characters with conservative structured layout.

```gfa-basic retro title="gfa-basic-demo.bas"
FOR i=1 TO 3
IF i=2
PRINT "Hello, GFA BASIC!"
ENDIF
NEXT i
```

### Amiga — AMOS

```amos retro title="amiga-amos-demo.bas"
For I=1 To 3
Print "HELLO";I
Next I
End
```

### MSX / MSX2 — MSX BASIC

MSX BASIC — international character set, white on the familiar TMS9918 blue.

```msx-basic retro title="msx-basic-demo.bas"
10 SCREEN 0
20 COLOR 15,4,4
30 FOR I=1 TO 3
40 PRINT "HELLO, MSX!";I
50 NEXT I
60 END
```

### Dragon 32 / 64

Dragon 32/64 BASIC — the original MC6847 character design, dark green on bright green. Lowercase codes in this font appear as inverse uppercase; the source and Copy output retain their original case.

```dragon-basic retro title="dragon-basic-demo.bas"
10 CLS
20 FOR I=1 TO 3
30 PRINT "HELLO, DRAGON!";I
40 NEXT I
50 END
```

### Acorn Archimedes — BBC BASIC V / VI

Acorn Archimedes / BBC BASIC V and VI — tall bitmap characters, white on black.

```archimedes-basic retro title="archimedes-basic-demo.bas"
10 MODE 12
20 count%=0
30 REPEAT
40 count%=count%+1
50 PRINT "Hello, Archimedes! ";count%
60 UNTIL count%=3
70 END
```

### Oric Atmos

Oric Atmos BASIC — black on white, including lowercase. Characters absent from the reproduction fall back visibly to the normal code font.

```oric-basic retro title="oric-basic-demo.bas"
10 PAPER 7:INK 0:CLS
20 FOR I=1 TO 3
30 PRINT "Hello, Oric Atmos!";I
40 NEXT I
50 END
```

### IBM PC — GW-BASIC

```gwbasic retro title="gw-basic-demo.bas"
10 CLS
20 FOR I=1 TO 3
30 PRINT "HELLO";I
40 NEXT I
50 END
```

### IBM PC — QBasic

```qbasic retro title="qbasic-demo.bas"
FOR n=1 TO 3
IF n=2 THEN
PRINT "MIDDLE"
ELSE
PRINT n
END IF
NEXT n
```

## BBC Micro display modes

The **BBC display mode** selector appears while Retro display is ticked. Its choice is saved per block, retained while Retro display is off, and used in the formatting comparison. Modes 3 and 6 have black inter-row gaps. Mode 6 includes blue and red screens with white text. These presets change character proportions and row spacing; they do not restrict line lengths or interpret commands. The repeated listing makes the differences easy to compare.

### BBC Mode 0

```bbc-basic retro retro-mode=0 title="bbc-mode-0.bas"
10 MODE 0
20 FOR I=1 TO 3
30 PRINT "HELLO, BBC MICRO!";I
40 NEXT I
50 END
```

### BBC Mode 1

```bbc-basic retro retro-mode=1 title="bbc-mode-1.bas"
10 MODE 1
20 FOR I=1 TO 3
30 PRINT "HELLO, BBC MICRO!";I
40 NEXT I
50 END
```

### BBC Mode 2

```bbc-basic retro retro-mode=2 title="bbc-mode-2.bas"
10 MODE 2
20 FOR I=1 TO 3
30 PRINT "HELLO, BBC MICRO!";I
40 NEXT I
50 END
```

### BBC Mode 3

```bbc-basic retro retro-mode=3 title="bbc-mode-3.bas"
10 MODE 3
20 FOR I=1 TO 3
30 PRINT "HELLO, BBC MICRO!";I
40 NEXT I
50 END
```

### BBC Mode 4

```bbc-basic retro retro-mode=4 title="bbc-mode-4.bas"
10 MODE 4
20 FOR I=1 TO 3
30 PRINT "HELLO, BBC MICRO!";I
40 NEXT I
50 END
```

### BBC Mode 5

```bbc-basic retro retro-mode=5 title="bbc-mode-5.bas"
10 MODE 5
20 FOR I=1 TO 3
30 PRINT "HELLO, BBC MICRO!";I
40 NEXT I
50 END
```

### BBC Mode 6 — blue

```bbc-basic retro retro-mode=6-blue title="bbc-mode-6-blue.bas"
10 MODE 6
15 VDU 19,0,4,0,0,0
20 FOR I=1 TO 3
30 PRINT "HELLO, BBC MICRO!";I
40 NEXT I
50 END
```

### BBC Mode 6 — red

```bbc-basic retro retro-mode=6-red title="bbc-mode-6-red.bas"
10 MODE 6
15 VDU 19,0,1,0,0,0
20 FOR I=1 TO 3
30 PRINT "HELLO, BBC MICRO!";I
40 NEXT I
50 END
```

### BBC Mode 7

```bbc-basic retro retro-mode=7 title="bbc-mode-7.bas"
10 MODE 7
20 FOR I=1 TO 3
30 PRINT "HELLO, BBC MICRO!";I
40 NEXT I
50 END
```
