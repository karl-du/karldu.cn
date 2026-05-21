---
title: "Constructor"
description: "CONSTRUCTOR 的作用\n\nfunction"
pubDate: "2020-06-24T08:29:54.000Z"
updatedDate: "2021-09-24T09:11:21.000Z"
category: "JavaScript"
tags:
  - "JavaScript"
  - "构造函数"
readingTimes: 28
author: "Karl Du"
remoteId: "48360977-0277-414f-93e1-dd745e25566f"
---
## Constructor 的作用

```javascript
function Father() {
  this.color = ['red', 'green'];
}

function Child() {
  this.test = 1;
}

Child.prototype = new Father(); // 未修复 constructor 指向 Child

let instance = new Child();

console.log(instance.test); // 1
console.log(instance.color); // [ 'red', 'green' ]
```

我们没有对`Child`做构造修复，那么这个`instance.test`是哪里来的？要知道这里的此时`instance`的构造函数`instance.constructor`是`Father`。那么这里`constructor`到底有什么作用？

> constructor 属性不影响任何 JavaScript 的内部属性。constructor 其实没有什么用处，只是 JavaScript 语言设计的历史遗留物。由于 constructor 属性是可以变更的，所以未必真的指向对象的构造函数，只是一个提示。不过，从编程习惯上，我们应该尽量让对象的 constructor 指向其构造函数，以维持这个惯例。

目前我们能看到的唯一的作用就是通过构造函数给闭包中的函数增加属性、方法。

```javascript
var a,b;

(function(){
  function A (arg1,arg2) {
    this.a = 1;
    this.b = 2; 
  }

  // 原型添加一个 log 方法
  A.prototype.log = function () {
    console.log(this.a);
  }

  a = new A();
  b = new A();
})();

a.log(); // 1

b.log(); // 1

a.constructor.prototype.log2 = function () {
  console.log(this.b);
};

a.log2(); // 2
```
