# ODC 开发文档

### 环境依赖

- 安装 [Node.js](https://nodejs.org/en/)
- 使用最新版本的 [tnpm](http://web.npm.alibaba-inc.com/)

### 1. Web 开发

#### 本地开发

```bash
$ tnpm run dev #使用 mock 数据开发
$ tnpm run devs #使用接口数据开发
```

#### 私有云构建

```bash
$ tnpm run build:odc
```

#### 开发集成环境

用于开发联调  
http://100.81.152.113:9000/index.html

#### 测试集成环境

用于 QA 测试  
http://100.81.152.113:8989/index.html

### 2. 客户端开发

#### 本地开发

```bash
$ tnpm run dev-client #开发模式编译 main & renderer
$ tnpm run start-electron #启动 electron 客户端
```

#### 构建

```bash
$ tnpm run pack-client:all #构建 win32/64一体包 + mac包
```

### 3. 公有云开发

#### 本地开发

阿里云上版本，使用 qiankun 嵌入：公有云代码仓库： http://gitlab.alibaba-inc.com/aliyun-next/oceanbasepro

```bash
# oceanbasepro 项目执行
$ tnpm run start

# odc 项目下执行
$ tnpm run dev:cloudweb
```

#### 构建

```bash
$ tnpm run build
```

```

## 相关链接
- Bigfish 前端开发框架: https://bigfish.antfin-inc.com/
- Electron 客户端: https://www.electronjs.org/
- XConsole 公有云控制台: https://xconsole.aliyun-inc.com/
- Qiankun 微前端方案: https://bigfish.antfin-inc.com/doc/plugin-qiankun
- ODC 前端文档：https://yuque.antfin-inc.com/afx-oceanbase/qgheft/gpw1g5
```
