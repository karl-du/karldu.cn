---
title: "你不知道的 JavaScript 中卷（1、类型）"
description: "最近在读《你不知道的 JavaScript\n中卷》，不会像上卷那样通篇仔细阅读一章一章的写博客了，因为我没那么多精力了。我每天花一点时间去写一些简单且篇幅不长的博客，这样在地铁或在电梯里花一分钟就可以读完。"
pubDate: "2023-04-01T15:11:24.000Z"
updatedDate: "2023-04-03T11:42:53.000Z"
category: "JavaScript"
tags:
  - "JavaScript"
remoteId: "5151410157975715868"
---
## 前言

最近在读《你不知道的 JavaScript 中卷》，不会像上卷那样通篇仔细阅读一章一章的写博客了，因为我没那么多精力了。我每天花一点时间去写一些简单且篇幅不长的博客，这样在地铁或在电梯里花一分钟就可以读完。

该书第一章就是讲js的类型，学习难度不大，基本上就是复习了一遍。我结合我的实际开发，把一些工作中常见的问题和技巧都写了下来，希望能帮助到你们。

## 类型之争

JavaScript是一门弱类型语言，所以非常灵活，如下所示：

```javascript
var data = http.get('/post/data'); // [{ title: "类型", content: "..."}]
data = JSON.parse(data);
```

上面一个示例，我们先是通过`http`调用得到一个`json`数据，然后解析得到一个数组，期间我们只声明了一个变量`data`

再看看强类型语言`C#`是怎么去实现上面这段代码：

```c#
class Post
{
	string title { get; set; }
  string content { get; set; }
}
var json = HttpUtil.get('/post/data');
var data = JsonConvert.DeserializeObject<Post>(json);
```

强类型的语言更为严谨，json声明为一个String类型变量后，如果你赋值其他类型的值，编译器就会提示错误。且，同样是Json解析，C#还需要提前声明好了Post类，才能通过泛型去解析。

我们比较一下得出以下结论：

1、弱类型语言灵活，可以通过两行代码实现十几行代码的功能

2、强类型语言非常啰嗦，但是可以使得开发过程中手误导致的意外错误（变量名写错）不会跑到线上

## 类型转换

我们在实际开发中经常会去转换变量类型，比如前端开发人员对接后端接口的时候，有的时候需要把number类型的数据转换成string，或者就是把string类型的数字转换成number，还有一种常见的场景就是把日期字符串转换成Date类型。

前面我们提到，JavaScript是一门弱类型语言，所以在js中，变量是没有类型的，只有值才有类型。变量既然没有类型限制，我们就可以通过一些强制转换类型的函数实现类型转换。

### 显示类型转换

在某些情况下，程序员需要手动将一个类型转换为另一个类型。例如，您可能需要将一个字符串转换为一个数字，或者将一个布尔值转换为一个字符串。

```javascript
// 将字符串转换为数字
var str = "42";
var num = Number(str); // 显式转换，str被转换为数字
console.log(num); // 输出: 42

// 将布尔值转换为字符串
var bool = true;
var str = String(bool); // 显式转换，bool被转换为字符串
console.log(str); // 输出: "true"
```

### 隐式类型转换

JavaScript引擎在必要时会自动将一个类型转换为另一个类型，不需要程序员手动进行转换。例如，当您将数字与字符串相加时，数字会自动转换为字符串。

```javascript
var num = 42;
var str = "The answer is " + num; //隐式转换，num被转换为字符串
console.log(str); // 输出: "The answer is 42"
```

### 强制类型转换

强制类型转换是一种特殊的显式类型转换，它是将一个非布尔类型的值转换为布尔类型的值。在JavaScript中，有一些值会被转换为`false`，这些值被称为“假值”，其他所有值都被转换为`true`。

```javascript
// 强制类型转换，num被转换为布尔值
var num = 0;
var bool = Boolean(num);
console.log(bool); // 输出: false
```

## 类型判断

类型判断常见于我们封装的函数对入参的一些检查，如下：

```javascript
function httpGet(url, params) {
  if(typeof str !== 'string')
    return 'url格式错误'
  if(typeof params !== 'object')
    return 'params格式错误'
  // ....
}
```

这段代码，看上去没问题，实际上并没有达到我们想要的一个效果

```javascript
httpGet('/post/data', { category: 'js' }); // 合法
httpGet('/post/data', [{ category: 'js' }]); // 合法
```

我们注意到，上面这个代码，我们实际上是期望params是一个对象，但是数组类型的入参并没有被类型判断出来

这种bug对于js新手程序员来说，是经常犯的错误。实际上，这不仅是你没有好好学习JavaScript的类型，同时也是js语言本身的缺陷

下面，我们简单回顾一下js的对象类型

### 内置类型

先了解一下JavaScript的七种类型

+ 空值（null）
+ 未定义（undefined）
+ 布尔值（boolean）
+ 数字（number）
+ 字符串（string）
+ 对象（object）
+ 符号（symbol）

> 除对象外，其他统称为基本类型

我们用typeof分别看一下值的类型，它返回的是类型的字符串。有意思的是，这七种类型和它们的字符串值并不一一对应：

```javascript
typeof undefined === "undefined" // true
typeof true === "boolean"        // true
typeof 42 === "number"           // true
typeof "42" === "string"         // true
typeof { life: 42 } === "object" // true
typeof Symbol() === "symbol"     // true
console.log(typeof null)         // object
```

以上六种类型均有同名的字符串值与之对应，但是null却对应object类型，实际上，这是一个历史遗留bug，现在已经有无数JS项目在全球各地运行着，一旦修复，造成的影响太大，所以ECMA不会去修复这个bug了，可以说，这个问题将永远不会被修复

我们需要使用符合条件来检测null值的类型：

```javascript
var a = null;
(!a && typeof a === "object") // true
```

### 对象子类型

我们知道Array、Date、String、Number等等这些对象子类型，它们在typeof下结果是什么呢？

```JavaScript
typeof [] // object
typeof new Date() // object
typeof new String('foo') // object
```

我们看到，返回结果都是：object。这是因为它们都是object的子类型，所以返回的是object

我们知道在JavaScript里“万物皆类型”（并不完全正确），而函数是一等公民，那么函数的返回是什么呢？

```javascript
function foo() {}
typeof foo // function
```

到这里，我们明白了对象子类型用typeof判断是无效的，那怎么办

### toString

`toString.call()`是一种常见的JavaScript技巧，用于确定变量的数据类型。它是通过调用内置`Object.prototype.toString()`方法来实现的，该方法返回一个表示该对象的类型的字符串。

以下是使用`toString.call()`方法的示例：

```javascript
var num = 42;
var str = "Hello, world!";
var arr = [1, 2, 3];

console.log(toString.call(num)); // 输出: "[object Number]"
console.log(toString.call(str)); // 输出: "[object String]"
console.log(toString.call(arr)); // 输出: "[object Array]"
```

使用`toString.call()`的好处在于它对所有类型的值都有效，包括原始类型和对象类型。因此，您可以使用它来判断一个值是否是数组、日期、正则表达式等等。

例如，以下是使用`toString.call()`来判断一个值是否是数组的示例：

```javascript
var arr = [1, 2, 3];

if (toString.call(arr) === "[object Array]") {
  console.log("arr is an array");
} else {
  console.log("arr is not an array");
}
```

好，到此为止，问题完美解决了，我们可以通过toString.call来判断这个变量是不是数组

### 第三方库

如今，有很多第三方库可以帮助我们实现判断变量类型，以下是一些常用的：

**Lodash**：Lodash是一个实用的JavaScript工具库，提供了许多常见操作的函数，包括类型检查。它的`_.is*()`函数系列可用于检查各种类型，例如`_.isNumber()`、`_.isString()`、`_.isObject()`等等。

```javascript
var _ = require('lodash');

console.log(_.isNumber(42)); // 输出: true
console.log(_.isString("Hello, world!")); // 输出: true
console.log(_.isObject({ key: "value" })); // 输出: true
```

**jQuery**：jQuery是一个流行的JavaScript库，用于操作DOM元素和处理事件等。它也提供了一些类型检查函数，例如`$.isNumeric()`、`$.isArray()`等等。

```javascript
console.log($.isNumeric(42)); // 输出: true
console.log($.isArray([1, 2, 3])); // 输出: true
```

**Underscore.js**：Underscore.js是另一个常用的JavaScript工具库，类似于Lodash，提供了许多实用函数，包括类型检查函数。

```javascript
var _ = require('underscore');

console.log(_.isNumber(42)); // 输出: true
console.log(_.isString("Hello, world!")); // 输出: true
console.log(_.isObject({ key: "value" })); // 输出: true
```
