# efes 
e代驾前端助手 edaijia fe assistant<br>
<br>
PS：efes的git commit检测规则中，eslint、csslint，和图片必须add提交为强制检测，error将导致提交失败。version字符串检测只做提示，供开发人员参考。<br>
PS：本助手是初期是在前端自动化工具 [gsp](https://github.com/viclm/gsp) 的基础上做的定制开发。后期对整个结构做了重构，采用类REST风格，每个命令作为一个独立的模块（放置在commonds目录下，通过load自动加载）。在此感谢 gsp 的开发者 [viclm](https://github.com/viclm)

## node 版本要求

node要求4.1.0+<br>
下载地址：http://npm.taobao.org/mirrors/node<br>
<br>
python要求2.x版本<br>

## 安装/更新

<code>
npm install -g efes
</code>
<br>
或<br>
<code>
cnpm install -g efes
</code>

## hook 
初始化git commit提交验证<br>
<br>
git仓库根目录下运行下面的命令<br>
<br>
<code>
efes hook
</code>
<br>
<br>
此命令会在.git/hooks目录下添加pre-commit文件，在git commit时，会触发此文件中的操作，进行lint、图片Add提交、version字符串检查（只针对新添加或修改的文件）。

## ver 
为引用的js、css增加版本号字符串，默认：VERSION<br>
<br>
<br>
<code>
efes ver [-s versionstring]
// -s 自定义版本字符串。
</code>
<br>
<br>
此命令会在会遍历当前目录和子目录下所有的html文件，监测使用相对路径的js和css为其添加/替换版本号字符串。

## init
初始化项目验证规则/脚手架<br>
<br>
在开发的项目根目录下运行下面的命令<br>
PS：为了避免错误，efes init在windows下请在cmd下运行。<br>
<br>
<code>
efes init
</code>
<br>
<br>
选择脚手架为：no，此时，efes会在项目根目录下创建如下三个文件：<br>
.eslintrc：eslint监测规则(此文件同时也是Sublime的插件Sublime-contrib-eslint配置文件)<br>
.csslintrc：csslint监测规则\<br>
.efesconfig：efes配置文件<br>
<br>
选择脚手架为：yes，此时，efes会在项目根目录创建完整的目录结构，和gulp配置。<br>
生成后，请先运行下面的命令安装npm插件：<br>
<br>
<code>
npm install
</code>
<br>
<code>
cnpm install
</code>
<br>
<br>
然后运行，下面命令启动gulp任务：<br>
<br>
<code>
gulp
</code>
<br>
<br>
#### a 生成文件目录结构
    |— fonts                字体
    |— images               图片
    |- webps                webp图片目录
    |— styles               样式
    |— scripts              脚本
    |— concatfile.json      合并配置文件
    |— gulpfile.js gulp     任务配置文件
    |— package.json         npm配置文件
    |— .eslintrc            eslint规则文件
    |— .csslintrc           csslint规则文件
    |— .efesconfig          efes项目配置文件
    |— index.html           首页
    |— src                  开发目录
        |— coffee           coffee文件开发目录
        |— es6              es6文件开发目录
        |— js               js文件开发目录
        |- icons            icons精灵图小图片文件目录
        |- images           图片文件（将自动压缩至根目录下的images文件夹中。对不需要压缩的文件在concatfile.json中配置）
        |— less             less文件开发目录
            |— includes     less引用文件目录，如：header.less等。
            |— publishs     less发布文件目录，如：index.less等。concatfile.json中只能配置合并此目录下的文件
        |— css              css文件开发目录
        |- html             html文件开发目录，将自动复制至根目录。
        |— jade             jade文件开发目录，jade不需要在concatfile.json中配置合并
            |— includes     jade引用文件目录，如：header.jade等
            |— publishs     jade发布目录文件

#### b gulp自动化功能：
1)、自动编译coffee、es6、less、jade<br>
2)、根据concatfile.json配置的内容，自动合并js(coffee、es6)、css(less)<br>
3)、支持sourcemap功能。<br>
4)、文件有改变时自动刷新页面。<br>
5)、图片自动压缩；icons精灵图自动合并；自动转换为webp图片

## Sublime 配套插件(建议安装Sublime3)

下面的插件，请先确认下列 npm 包是否已经安装：<br>
elint<br>
安装命令：cnpm install -g elint<br>
csslint<br>
安装命令：cnpm install -g csslint<br>
<br>
Sub­limeLin­ter：https://sublime.wbond.net/packages/SublimeLinter<br>
SublimeLinter-csslint：https://sublime.wbond.net/packages/SublimeLinter-csslint<br>
Sublime​Linter-contrib-eslint：https://packagecontrol.io/packages/SublimeLinter-contrib-eslint<br>
Js​Format：https://packagecontrol.io/packages/JsFormat<br>

## h5 脚手架包含功能
1、loading模板<br>
2、横屏提示模板<br>
3、重力感应示例<br>
4、webp监测，自动替换<br>
5、唤起客户端或跳转到下载<br>
PS：由于使用的是WebViewJavascriptBridge，作为和客户端通讯的规则，调用时需要和客户端定好WebViewJavascriptBridge接口<br>
6、客户端内部调用原生功能插件<br>
PS：经测试，ios9和Android有新的测试，现有代码只能在微信中唤起客户端。

## h5 脚手架目录结构
    |— fonts                字体
    |— images               图片
    |— styles               样式
    |— scripts              脚本
    |— concatfile.json      合并配置文件
    |— gulpfile.js gulp     任务配置文件
    |— package.json         npm配置文件
    |— .eslintrc            eslint规则文件
    |— .csslintrc           csslint规则文件
    |— .efesconfig          efes项目配置文件
    |— index.html           首页
    |— src                  开发目录
        |— coffee           coffee文件开发目录
        |— es6              es6文件开发目录
        |— js               js文件开发目录
            |- index.js
            |- mod
                |- call-client.js       客户端内部调用原生功能
                |- download.js          唤起客户端或跳转到下载
                |- landscape-tip.js     横屏提示js
                |- loading.js           loading
                |- transation.js        滑屏js
                |- webp.js              webp监测，手动触发替换
                |- webp.lazy.js         webp监测，自动触发替换，有lazy效果
                |- weight.js            重力感应示例
        |- images            图片文件（将自动压缩至根目录下的images文件夹中。对不需要压缩的文件在concatfile.json中配置）
        |— less             less文件开发目录
            |— includes     less引用文件目录，如：header.less等。
            |— publishs     less发布文件目录，如：index.less等。concatfile.json中只能配置合并此目录下的文件
        |— css              css文件开发目录
            |- index.css
            |- mod
                |- animations.css       滑屏css
                |- swipe-page.css       滑屏css
                |- landscape-tip.css    横屏提示css
                |- loading.css          loading
                |- weight.css           重力感应示例
        |- html             html文件开发目录，将自动复制至根目录。
        |— jade             jade文件开发目录，jade不需要在concatfile.json中配置合并
            |— includes     jade引用文件目录，如：header.jade等
            |— publishs     jade发布目录文件



## git commit 中文乱码解决方案

  git 中文文件名 乱码 mac<br>
  git 默认中文文件名是 xx%<br>
  是因为 对0x80以上的字符进行quote<br>
  只需要<br>
  git config core.quotepath false<br>
  core.quotepath设为false的话，就不会对0x80以上的字符进行quote。中文显示正常<br>

## v0.1.14更新
1、添加 efes scaffold 脚手架h5模块代码
2、添加图片 webp 自动转换功能

## v0.1.13更新
脚手架添加icons精灵图自动合并功能。

## v0.1.12更新
修复init生成项目初始文件时，部分文件不能正确生成bug

## v0.1.10更新
1、新增替换版本号字符串命令『efes ver』。<br>
2、gulp提供图片压缩支持（使用pngquant压缩引擎）。<br>
3、src目录中增加html，方便自动刷新。<br>
bugs fixed<br>
1、修复gulp编译es6时的错误。<br>
2、优化commit的速度。

## v0.1.9更新
bugs fixed<br>
1、修复windows下不能init不能生成文件、目录的bug。


## v0.1.8更新
1、调整init命令的脚手架选项，改为选择是否使用脚手架。<br>
2、支持脚手架生成文件结构<br>
3、支持sourcemap功能<br>

遗留bug：<br>
1、sourcemap 对同名的css、js文件不能正确区分。<br>
