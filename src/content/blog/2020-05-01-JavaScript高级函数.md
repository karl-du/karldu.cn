---
title: "JavaScript 高级函数"
description: "reduce 的语法："
pubDate: "2020-05-01T13:51:12.000Z"
updatedDate: "2021-09-24T09:13:27.000Z"
category: "JavaScript"
tags:
  - "JavaScript"
remoteId: "1b139ef4-d1a6-46f9-8272-54fac6f466cb"
---
# JavaScript的高阶函数

## Reduce

reduce 的语法：

```javascript
Array.reduce(callback, init)
```

callback里包含了四个参数

 1. previousValue 上一次调用的返回值
 2. currentValue 当前处理的元素的值
 3. index 当前元素的**索引**
 4. array 调用reduce的数组
 5. initialValue参数，默认从**第二个元素**开始

### 我们常用的数组求和

求一个数组的合计, 我们常用的方式是用 **for** 循环

```javascript
var arr = [1, 2, 5, 4, 7, 10, 1];
function sum(arr) {
  let total = 0;
  for (let i = 0; i < arr.length; i++) {
    total += arr[i];
  }
  return total;
}
```

求一个数组的合计，如果数组里的元素是对象，那么用 **of** 去求和会更好

```javascript
var arr2 = [{ amount: 20 }, { amount: 30 }];
function sum2(arr) {
  let total = 0;
  for (const item of arr) {
    total += item;
  }
  return total;
}
```

## Reduce数组求和

```javascript
function sum3(arr) {
  return arr.reduce((pre, cur) => pre + cur);
}
```

用 reduce 则用 **很少** 的代码解决，尤其是采用了 ==es6== 语法后，更加简单
但是 reduce 并不仅此而已，还有很多高级使用方法

## 统计每个元素出现次数

```javascript
function count(arr) {
  return arr.reduce((pre, cur) => {
    if (cur in pre) {
      pre[cur]++;
    } else {
      pre[cur] = 1;
    }
    return pre;
  }, []);
}
```

## 数组去重

```javascript
function distinct(arr) {
  return arr.reduce((pre, cur) => {
    if (pre.includes(cur)) {
      return pre;
    } else {
      return pre.concat(cur);
    }
  }, []);
}
```

待更新
