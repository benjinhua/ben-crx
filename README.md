# ben-crx
chrome插件

在网页中额外插入功能性按钮并读取请求信息

1个图标（用于在扩展栏显示的图标），1个配置文件（chrome插件必需的json文件），1个js脚本（用于实现功能）

# manifest
"manifest_version" : 2, 
 /** 必选项：用整数表示manifest文件自身格式的版本号。目前为止只接受 2 （版本目前为2） **/

 ## "version" : "1.0",
/** 
  * 必选项： 字符串类型，当前创建扩展版本号 
  * 扩展的版本用一个到4个数字来表示，中间用点隔开。
  * 这些数字有些规则：必须在0到65535之间，非零数字不能0开头。
  * 比如，99999和032是不合法的。 
**/

## "name" : "扩展名",
/** 必选项：字符串类型 **/


## icons （如果只配置icons，则default_icon也使用该图片，如果不配置icons，则扩展工具界面使用默认图标）
"icons" : {
  "16" : "icon16.png"
}
/**
  * 一个或者多个图标来表示扩展 (16x16, 48x48, 128x128)
  * 建议使用以上几种大小，及png格式。
  * 可选，系统自带默认图标
**/

## browser_action （在浏览器右上角显示）
"browser_action" : {
    "default_title" : "title",
    /** 鼠标移入，显示简短扩展文本描述 **/
    "default_popup" : "popup.html",
    /** 鼠标点击，弹出扩展模态窗口，展示内容 **/
    "default_icon" : {
      "48" : "./icons/time48.png"
    }
    /** 浏览器右上角，扩展图标 。如果不设置，跟随 icon ，两者皆无，则使用默认**/
  },

## content_scripts （向页面注入脚本）
  "content_scripts" : [
    {
      "matches" : ["*://www.baidu.com/"],
      /**  匹配网址(支持正则)，成功即注入（其余属性自行查询） **/
      "js" : ["./content_scripts.js"],
      /** 需要注入的脚本 **/
    }
  ],

## options_page
  "options_page" : "options.html",
/** 给扩展设置选项内容 并激活选项按钮**/

## permissions 开启拓展权限，例如ajax的同源限制。开启后可进行跨域访问。其余权限请自行查询。
"permissions" : [
    "*://*/*"
    /** 匹配需要跨域的请求地址，解除同源限制  **/
  ],


## background 后台常驻脚本 扩展常常用一个单独的长时间运行的脚本来管理一些任务或者状态
 "background" : {
    "scripts" : ["./js/background.js"],
    /** 后台常驻脚本，自动运行，直到关闭浏览器。可根据需求自行设置 **/
    "popup" : "background.html"
    /** 调试页，background 不出现于用户视窗内的。 **/
    /** 在扩展工具页面，检查视图进行调试 (需要勾选__开发者模式__选项)**/
  }