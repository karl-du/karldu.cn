---
title: "JavaScript插件化开发"
description: "这个是一个必然，因为我们要协作开发、代码重用"
pubDate: "2021-03-02T11:41:10.000Z"
updatedDate: "2021-11-15T09:22:16.000Z"
category: "JavaScript"
tags:
  - "JavaScript"
readingTimes: 54
author: "Karl Du"
remoteId: "edc5e453-3b8a-4f17-9647-57923522bdaa"
---
## 为什么要做插件化开发

这个是一个必然，因为我们要协作开发、代码重用

```javascript
function httpGet(apiUrl, params) {
  // doSomething
}

httpGet('http://localhost/api/demo/test');
```

上面这个代码示例很简单，实现了一个`get`方法调用`api`的函数，后来陆陆续续加上了`post`、`put`、`delete`

```javascript
function httpGet(apiUrl, params) {
  // doSomething
}

function httpPost(apiUrl, params) {
  // doSomething
}

function httpDelete(apiUrl, params) {
  // doSomething
}

function httpPut(apiUrl, params) {
  // doSomething
}
```

然后，我们想把这几个函数提供给别的项目上用，于是我们把这些函数放到一个`httpUtil.js`文件中

```javascript
function httpGet(apiUrl, params) {
  // doSomething
}

function httpPost(apiUrl, params) {
  // doSomething
}

function httpDelete(apiUrl, params) {
  // doSomething
}

function httpPut(apiUrl, params) {
  // doSomething
}
```

这个时候我们进入了最原始的插件开发了，因为我们写的代码被跨时间、跨空间供不同的开发人员使用，这份代码也做了重用，减少了重复劳动

## 完善之路

我们罗列了一下上面这段代码的问题，如下

待优化：

+ 方法直接暴露在全局作用域，容易命名冲突
+ 没有面向对象编程，纯程式化的函数罗列

`JavaScript`面向对象的设计使用，是一个难点，我们从对象的生成慢慢说起

### 对象生成的方式

谈起对象的生成，可能很多人只能想到声明式的构造，这不怪你们，因为声明式是最好用且最通用的构造方式

#### 声明模式

我们最常使用声明式构造对象

```javascript
var person = {
  age: 20,
  name: '王二'
}

var person = new Object();
person.age = 20;
person.name = '王二'
```

#### 工厂模式

声明式虽然能创建对象，但是有个缺点，如果要创建多个对象，就需要重复写以上的代码。工厂模式解决了这个问题

```javascript
function createPerson(name, age) {
  var person = new Object();
  person.name = name;
  person.age = age;
  return person;
}

var person1 = createPerson('王二', 20);
var person2 = createPerson('张三', 13);
```

#### 构造模式

工厂模式已经满足我们一般开发需求了，但是工厂模式太繁琐了

```javascript
function Person(name, age) {
  this.name = name;
  this.age = age;
}
var person1 = new Person('王二', 20);
var person2 = new Person('张三', 13);
```

#### 对比

我们从工厂模式跨越到了构造模式，相比工厂模式，构造模式有几处不同

+ 没有显示创建对象
+ 直接将属性赋予了`this`对象
+ 没有`return`

构造函数模式隐含了很多步骤，虽然代码相对来说简洁了很多，但是对于初学者来说不太友好。假如你熟悉面向对象编程，那么你一定更倾向于使用`new Person()`

还有一个重要的好处：使用构造函数模式产生的对象式该函数的实例。也就是说工厂模式下，得到的`person`是`Object`的实例，而构造函数模式下得到的`person`是更为具体的`Person`的实例。我们可以用`instanceof`关键字来判断一个实例属于哪个类型，或者我们可以通过实例的`constructor`来看构造函数是谁

到此为止，如果不考虑构造函数模式的一些细节问题，这种插件的写法已经可以应用到我们当前项目里了，代码如下：

```javascript
function HttpUtil() {
  this.get = function(apiUrl, params) {
    // ...
  }
  this.post = function(apiUrl, params) {
    // ...
  }
  this.delete = function(apiUrl, params) {
    // ...
  }
  this.put = function(apiUrl, params) {
    // ...
  }
}

// 使用方法
var httpUtil = new HttpUtil();
httpUtil.get('http://localhost/api/Demo/test');
```

这样一来插件就实现了面向对象的抽象过程，且将需要的各种变量封装了起来

看到这里，似乎已经解决了，其实不然，构造函数模式还是有一些小问题

### 避免重复创建

问题在于`httpUtil`函数体中的方法都是对象（函数也是对象），每当我们`new`一个新实例时，实例方法一样，但是重复了创建了，显然这是没必要的。对于精益求精的前端开发，这点不能容忍

最简单粗暴的方法时把相关函数提取出来

```javascript
function httpGet(apiUrl, params) {
  // doSomething
}

function httpPost(apiUrl, params) {
  // doSomething
}

function httpDelete(apiUrl, params) {
  // doSomething
}

function httpPut(apiUrl, params) {
  // doSomething
}

function HttpUtil() {
  this.get = httpGet;
  this.post = httpPost;
  this.delete = httpDelete;
  this.put = httpPut;
}
```

以上改造之后，如果`new`多个`HttpUtil`的实例后，`get`函数只有一个实例，那就是指向了和`HttpUtil`平级的`get`函数，其他函数也一样

但是从实际操作来讲，还不如多消耗一点性能，不将插件的函数提取出来。因为这样依赖暴露出来的变量急剧增加，很不好控制

那有没有办法解决这个问题？即多个实例的共同方法、对象指向一个，复用方法。答案就是：原型模式

```javascript
var HttpUtil = function() {};

HttpUtil.prototype = {
  constructor: HttpUtil,
  get: function(apiUrl, params) {
    // ...
  },
  post: function(apiUrl, params) {
    // ...
  },
  delete: function(apiUrl, params) {
    // ...
  },
  put: function(apiUrl, params) {
    // ...
  }
}
```

看上去原型模式很完美，但是还是有两个比较突出的问题：

+ 无初始化变量入口
+ 属性篡改

我们现在想在`HttpUtil`上增加版本信息和根据报错`code`自定义错误信息

```javascript
var HttpUtil = function() {};

HttpUtil.prototype = {
  constructor: HttpUtil,
  version: '1.0',
  errorMessageList: [{ code: 401, message: '未授权' }, { code: 500, message: '服务器内部错误' }],
  get: function(apiUrl, params) {
    // ...
  },
  post: function(apiUrl, params) {
    // ...
  },
  delete: function(apiUrl, params) {
    // ...
  },
  put: function(apiUrl, params) {
    // ...
  }
}
```

对于`HttpUtil`这个函数，无初始化变量入口意思就是在`new`出一个新实例时想直接将`version`传入，覆盖默认值。但是，以上的设计明显是做不到

再说属性篡改问题，导致这个问题的原因是引用类型浅拷贝。也就是说如果声明多个`HttpUtil`实例，它们将共享`errorMessageList`这个数组

解决方法很简单，我们改造一下构造函数接受参数，并将引用类型`errorMessageList`放到构造函数里：

```javascript
var HttpUtil = function(version, errorMessageList) {
  this.version = version;
  this.errorMessageList = errorMessageList;
}

HttpUtil.prototype = {
  constructor: HttpUtil,
  get: function(apiUrl, params) {
    // ...
  },
  post: function(apiUrl, params) {
    // ...
  },
  delete: function(apiUrl, params) {
    // ...
  },
  put: function(apiUrl, params) {
    // ...
  }
}
```

## 参考

+ [1] [JavaScript插件开发从入门到精通系列](https://www.iteye.com/blog/pigkiller-2225561)
+ [2] 《你不知道的JavaScript》
