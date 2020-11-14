# thor-validation

## Description
A JavaScript validation toolkit.

## Installation

```
npm i thor-validation
```

## Getting Start

1. Import 'Schema' class and used rule

```javascript
import {Schema, string} from 'thor-validation';
```

2. Define some rule to validate input

```javascript
import {Schema, string} from 'thor-validation';

let rule = string();
```

3. Build validator instance

```javascript
import {Schema, string} from 'thor-validation';

let rule = string();
try {
  let schema = new Schema(rule);
} catch (e) {
  // If schema definition have some problem, the invoking of build function will throw the 'SchemaError' exception.
  console.log(e.message);
}
```

4. Validate input

```javascript
import {Schema, string} from 'thor-validation';

let rule = string();
try {
  let schema = new Schema(rule);
  schema.validate('Hello World!');
} catch (e) {
  // If validation failed, it will throw the 'ValidationError' exception.
  console.log(e.message);
}
```

### Major Rule Definitions

1. need()

```javascript
// input can not be undefined or null
let rule = need();
// input can not be undefined or null and it must be a string 
let rule = need(string());
// must be a number
let rule = need(number())
// must be a string or a number
let rule = need(union(string(), number()));
...
```

***need*** rule can only have primitive rule as it's sub rule, all supported sub rules are:
```
object, string, number, array, boolean, date, union
```


2. string()

```javascript
// input should be a string, but if input not provide or it is null, it won't be regarded as error.
let rule = string();
// must be a string and cannot be null or undefined
let rule = need(string());
// string length must at least have 10 characters
let rule = string(min(10));
// string length must at most have 100 characters
let rule = string(max(100));
// string must match the regular expression
let rule = string(pattern(/^\d+$/));
// string must be a particular value
let rule = string(equal('abc'));
// verfication successful if all of the following conditions are met
let rule = string(min(10), max(100));
// verfication successful if any of the following conditions are met
let rule = string(any(equal('abc'), equal('def'), min(10), pattern(/^\d+$/)));
...
```

3. number()

```javascript
let rule = number();
// value should great or equal to 10
let rule = number(min(10));
// value should great to 10
let rule = number(more(10));
// value should less or equal to 100
let rule = number(max(100));
// value should less 100
let rule = number(less(100));
let rule = number(range(10, 100));
let rule = number(equal(33));
let rule = number(any(equal(33), equal(44), equal(55)));
```

4. boolean()

```javascript
let rule = boolean();
let rule = boolean(equal(true));
```

5. date()

```javascript
let rule = date();
let rule = date(equal('2019-1-1'));
let rule = date(begin('2019-1-1'));
let rule = date(end('2020-1-1'));
let rule = date(before('2020-1-1'));
let rule = date(after('2019-1-1'));
let rule = date(between('2019-1-1', '2020-1-1'));
let rule = date(any(before('2019-1-1', between('2020-3-1', '2020-5-1'))));
```

6. object()

```javascript
let rule = object();
let rule = object(
  prop('name', string()),
  prop('age', number()),
  prop('extra', need()),
  prop('detail', need(
    object(
      prop('id', need(number())),
      prop('account', need(string()))
    )
  ))
);
```

7. array()

```javascript
let rule = array();
let rule = array(
  item(need(
    union(
      object(
        prop('id', need(number())),
        prop('account', need(string()))
      ),
      string()
    )
  )),
  min(10), max(20)
);
```

8. union()

That's means value can be multiple types.

```javascript
let rule = union(string(), number());
...
```

### Rename Rule Name

You can rename any rule name as what your like, this usually can shorten your code:

```javascript
import {Schema, string as s, number as n, need as r, object as o, prop as p} from 'thor-validation';

let rule = r(o(
  p('name', r(s(min(1), max(30)))),
  p('age', r(n(min(18))))
));
```

### Split Definition

To make the code clearly, usually you can split a complex definition to several parts:

```javascript
let detail = need(object(
  prop('name', need(string())),
  prop('account', need(string())),
));
let users = need(array(
  item(detail),
  min(1), max(1000)
));
let rule = need(object(
  prop('action', need(string())),
  prop('users', users)
));
try {
  let schema = new Schema(rule);
  schema.validate({
    action: 'show',
    users: [{
      name: 'user 1',
      account: 'account1'
    },{
      name: 'user 2',
      account: 'account2'
    }]
  });
} catch (e) {
  console.log(e.message);
}
```

### Specify Custom Message

1. mismatch()

There have a particular rule ```mismatch()```, it can under the primitive type rule used to specify error message when input type doesn't match the expected type. 

```javascript
let rule = string(mismatch('There need a string'));
```

2. need()

```javascript
let rule = need(object(), 'use custom message');
```

3. Other check rules

Any check rules can accept a string as last parameter as custom message.

```javascript
let rule = string(max(20, 'String length cannot be more than 20 characters'));

```

**NOTE:**

**Usually you don't need to specify any custom message, because the builtin error message will provide more detailed info.**

---

That's all

If you find any problem please feel free to report to [issues](https://gitee.com/thor.qin/thor-validation/issues), I would appreciate your contribution.
