# efes 
e代驾前端助手 edaijia fe assistant<br>
PS：efes的git commit检测规则中，eslint、csslint，和图片必须add提交为强制检测，error将导致提交失败。version字符串检测只做提示，供开发人员参考。

## node 版本要求

node要求4.1.0+<br>
下载地址：http://npm.taobao.org/mirrors/node<br>
python要求2.x版本<br>

## 安装/跟新

<code>
npm install -g efes
或
cnpm install -g efes
</code>

## 初始化git commit提交验证
git根目录下运行下面的命令
<code>
efes hook
</code>
此命令会在.git/hooks目录下添加pre-commit文件，在git commit时，会触发此文件中的操作，进行lint和version字符串检查（只针对新添加或修改的文件）。

## 初始化项目验证规则/脚手架
在开发的项目根目录下运行下面的命令<br>
PS：为了避免错误，efes init在windows下请在cmd下运行。
<code>
efes init
</code>
选择脚手架为：no时，此命令会在项目根目录下创建如下三个文件：<br>
.eslintrc：eslint监测规则(此文件同时也是Sublime的插件Sublime-contrib-eslint配置文件)<br>
.csslintrc：csslint监测规则\<br>
.efesconfig：efes配置文件<br>
选择脚手架为：yes时，此命令会在项目根目录创建完整的目录结构，和gulp配置：<br>
生成后，请先运行下面的命令安装npm插件：
<code>
    npm install
    或
    cnpm install
</code>
然后运行，下面命令启动gulp任务：
<code>
    gulp
</code>
### a 生成文件目录结构
    |— fonts                字体<br>
    |— images               图片<br>
    |— styles               样式<br>
    |— scripts              脚本<br>
    |— concatfile.json      合并配置文件<br>
    |— gulpfile.js gulp     任务配置文件<br>
    |— package.json         npm配置文件<br>
    |— .eslintrc            eslint规则文件<br>
    |— .csslintrc           csslint规则文件<br>
    |— .efesconfig          efes项目配置文件<br>
    |— index.html           首页<br>
    |— src                  开发目录<br>
        |— coffee           coffee文件开发目录<br>
        |— es6              es6文件开发目录<br>
        |— js               js文件开发目录<br>
        |— less             less文件开发目录<br>
            |— includes     less引用文件目录，如：header.less等。<br>
            |— publishs     less发布文件目录，如：index.less等。concatfile.json中只能配置合并此目录下的文件。<br>
        |— css              css文件开发目录<br>
        |— jade             jade文件开发目录，jade不需要在concatfile.json中配置合并。<br>
            |— includes     jade引用文件目录，如：header.jade等。<br>
            |— publishs     jade发布目录文件。<br>

### b gulp自动化功能：
    1)、自动编译coffee、es6、less、jade<br>
    2)、根据concatfile.json配置的内容，自动合并js(coffee、es6)、css(less)<br>
    3)、支持sourcemap功能。
    4)、文件有改变时自动刷新页面。<br>

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

## git commit 中文乱码解决方案

  git 中文文件名 乱码 mac<br>
  git 默认中文文件名是 xx%<br>
  是因为 对0x80以上的字符进行quote<br>
  只需要<br>
  git config core.quotepath false<br>
  core.quotepath设为false的话，就不会对0x80以上的字符进行quote。中文显示正常<br>


## v0.1.8更新
1、调整init命令的脚手架选项，改为选择是否使用脚手架。<br>
2、支持脚手架生成文件结构<br>
3、支持sourcemap功能<br>

遗留bug：<br>
1、sourcemap 对同名的css、js文件不能正确区分。<br>
