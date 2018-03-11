## 合约的基本结构

**程序版本(Version Pragma)**：Solidity 大多都是开源的程序，在代码中加上程序版本是为了方便社区合作。描述程序版本的规则和 npm 的一样。

```
pragma solidity ^0.4.19;
```


**合同(contract)声明**：合同类似于面向对象语言中的类(Class)。

```
contract SimpleStorage {

}
```


**状态变量(State variable)声明**：状态变量是永久存储在合同存储中的值。

```
contract SimpleStorage {
    uint storedData; // State variable
}
```


**函数(function)声明**：函数是合约内代码的可执行单元。


```
contract SimpleStorage {
    function get () {
    }
}
```



## 类型

**bool**：`false` / `true`



操作符：`!` , `&&` , `||` , `==` , `!=`

**uinit/int**：无符整型、有符整型


操作符： 
- 比较：`<=` , `<` , `==` , `>=` , `>`
- 位计算：`&` , `|` , `^` , `~`
- 计算：`+` , `-` , `*` , `/` , `%` , `**`

注意：solidity 暂时没有浮点数，有定点数但也支持性不好。

**address**：在以太坊中账户有两种类型：[普通账户](https://etherscan.io/address/0x2d7c76202834a11a99576acf2ca95a7e66928ba0)和[智能合约账户](https://etherscan.io/address/0xcbe1060ee68bc0fed3c00f13d6f110b7eb6434f6)。普通账户只存储 ETH 的账户，智能合约账户不仅存储 ETH，同时也有可以运行的代码。


```
address x = 0xdCad3a6d3569DF655070DEd06cb7A1b2Ccd1D3AF
```

成员：
- `address.banlance` (`uint256`)：地址余额，单位 Wei。合约的 balance 不能直接接改，而是自动计算的。
- `address.transfer(uint256 value)` ：给 address 转账 value(Wei)，且调用异常会抛出。
- `address.send(value)`：和 transfer 类似，但调用后的异常将不会被返回，只会返回一个 false。
- `address.call`, `address.callcode`, `address.delegatecall`：智能合约相互调用时使用

注意：在 solidity 源码中，address 不需要加双引号。但在 Remix 的对话界面中输入 address 时，务必加上双引号，否则会报错，且报错的消息非常诡异。


## 全局变量

**ether 变量**：1 ether 代表数字 1*10^x18 ，而不是币的单位。

- `wei` == 1
- `szabo` == 10^12 `wei`
- `finney` == 10^15 `wei`
- `ether` == 10^18 `wei`

**时间变量**：1 seconds 代表数字 1，而不是时间的单位。同理 1 years 代表的是数字 365*24*60*60， 而不是现实世界中的一年，因为现实世界中有会有 [闰秒](https://en.wikipedia.org/wiki/Leap_second)。如合同中需用到准确的一年，需要外部预言机(oracle)。

- 1 `seconds` == 1
- 1 `minutes` == 60 `seconds`
- 1 `hours` == 60 `minutes`
- 1 `days` == 24 `hours`
- 1 `weeks` == 7 `days`
- 1 `years` == 365 `days`

**block**：块
- `block.blockhash(uint blockNumber) returns (bytes32)`: 传入 blockNumber，返回块的哈希值
- `block.coinbase` (`address`): 挖到当前块矿工的地址
- `block.difficulty` (`uint`): 当前块的难度
- `block.gaslimit` (`uint`): 当前块最多的 gas
- `block.number` (`uint`): 当前块是第几个
- `block.timestamp` (`uint`): 当前块创建的时间戳
- `now` (`uint`): block.timestamp 的别名


**msg**: 当执行某一个函数的时候，函数想要知道调用函数的数据信息
- `msg.data` (`bytes`): 包括函数名字等等，一些没有经过加工的信息。
- `msg.gas` (`uint`): 函数调用方携带的 gas
- `msg.sender` (`address`): 函数调用方的地址
- `msg.sig` (`bytes4`):  整个 `msg.data` 的前 4 个 `byte`
- `msg.value` (`uint`):  函数调用方携带的 `gas`，以 `wei` 为单位计价。

**关键词**：
- `constant` 用于变量: 表明当前变量不可修改。如果修改，编辑器会报错。
- `constant` 用于函数: 表明当前函数中，不应该修改状态。但要十分小心，因为即便修改了，编译器也不会报错。
- `view` : 和 constant 用于函数时功能一样。
- `payable`: 表明调用函数可以接受以太币。
- `this`: 指向的是当前合同的 `address`。
- `revert`: 函数执行失败，需要通过调用 `revert()` 抛异常告诉函数调用方。调用后恢复合同状态，并将剩余 gas 返还。`throw` 已被废弃。



## 省币秘诀


当你激活一个智能合约的时候，你在要求整个网络内的每个矿工个体分别执行里面的运算。这会花费他们的时间和精力，Gas是你为这项服务向矿工们支付的机制。 报酬是小额的以太币，想要运行智能合约的人的需要支付报酬来使合约工作。付款款项（单位以太币）＝ Gas数量（单位Gas） x Gas price（单位以太币／Gas） 智能合约越复杂（计算步骤的数量和类型，占用的内存等），用来完成运行就需要越多Gas。

Gas是由一开始发起transaction的地址进行支付。再比如"合约A调用合约B再调用合约C"这个过程中所产生的所有计算步骤所消耗的Gas也都是由调用合约A的人来承担的。



- 用 `fn()` 代替 `this.fn()`：通过 `this.fn()` 调用函数，在 EVM 底层是通过 `msg`来调用合约函数的。相对于直接调用 `fn()` 花费的 gas 更多。

- 减少重复计算。Solidity 编译器没有对重复计算做优化，需开发者手动使用临时变量保存重复计算的值。

```
function(int a, int b){
    // 错误。应该使用 int x = a + b 减少重复计算
    if(a + b > 0) {
        int y = a + b; 
    }
}
```


## 安全

- 一定要把内部变量修改完成之后，再给外部钱。涉及到以太坊智能合约的re-entry攻击的问题。

```
frank.transfer(salary);
// 错误，应该将先修改内部变量，再 transfer。
lastPayday = lastPayday + payDuration;
```


## 其他

- 合约是中介：由于调用函数的动作是在挖矿时执行的，所以Solidity 没有原生定时器，不通过合约本身自动触发函数执行。应该将合约看做一个中介，需要外部来触发合约函数的执行。

- 本地状态变量声明提升：类似于 JS 用 `val` 声明变量。

```
contract SimpleStorage {
    function set(uint data){
        if (true) {
            uint temp = 1; // 本地状态变量
        }
        uint temp; // 报错，因为声明本地状态变量的作用域是函数，而不是 {}。
    }
}
```



参考资料：

- [solidity-notes](https://github.com/jiangleo/solidity-notes)
- [第一课问题整理](https://github.com/Guigulive/Wiki/blob/master/FAQ/%E6%99%BA%E8%83%BD%E5%90%88%E7%BA%A6%E5%BC%80%E5%8F%91FAQ-1.md)




