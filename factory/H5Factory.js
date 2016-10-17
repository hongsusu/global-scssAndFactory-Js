qingniwan.factory('util', ['$window', '$http', function ($window, $http) {
    /**
     * javascript实用工具类
     * Created by kang on 2015/7/5.
     */
    var util = this;

    /**
     * 检测object的length
     * @param obj 要检测的object
     * @returns {number} object的length
     */
    util.getObjectLength = function (obj) {
        var key, length = 0;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                length++;
            }
        }
        return length;
    };

    /**
     * 弹窗 loading
     * @param content [可选]弹窗中要显示的提示文本, 如: 加载中..., 如果没有定义, 则显示默认的loading图标
     * @returns {*} 返回当前弹窗的实例, 一般用于加载完成后 .close()
     */
    util.artDialogLoading = function (content) {
        var successDialog = dialog({
            fixed: true
        });
        if (content) {
            successDialog.options.content = content
        }
        successDialog.showModal();
        return successDialog;
    };

    /**
     * 弹窗 简洁提示框
     * @param content [可选]弹窗中要显示的提示文本, 如: 操作成功!, 如果没有定义, 则显示默认的loading图标
     * @param time [可选] 弹窗停留的时间, 默认为2秒
     */
    util.artDialogHint = function (content, time) {
        var successDialog = dialog({
            content   : content,
            quickClose: true,
            fixed     : true
        });
        successDialog.showModal();
        setTimeout(function () {
            successDialog.close().remove();
        }, time || 2000);
    };

    /**
     * 气泡提示框
     * @param content 气泡弹窗中要显示的提示文本, 如: 操作成功!, 如果没有定义, 则显示默认的loading图标
     * @param trigger 气泡显示依据哪个DOM元素
     */
    util.artDialogBubble = function (content, trigger) {
        var d = dialog({
            content   : content,
            quickClose: true,
            fixed     : true,
            align     : 'bottom'
        });
        d.show(trigger);
    };

    /**
     * 弹窗 单按钮模态提示框
     */
    util.artDialogAlert = function (customConfig) {

        var dialogConfig = {
            fixed: true,
            width: 500,
            okValue: '确定',
            ok: function () {

            }
        };
        if (customConfig.title) {
            dialogConfig.title = customConfig.title;
        }
        if (customConfig.content) {
            dialogConfig.content = customConfig.content;
        }
        if (customConfig.okValue) {
            dialogConfig.okValue = customConfig.okValue;
        }
        if (customConfig.ok) {
            dialogConfig.ok = customConfig.ok;
        }

        dialog(dialogConfig).showModal();
    };

    util.getUserLoginData = function () {
        return JSON.parse(localStorage.getItem('userLoginData'));
    };

    /**
     * 获取url参数
     * @param  {[type]} name [参数name]
     * @return {[type]}      [返回参数name对应值]
     */
    util.getParams = function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    }

    /**
     * 获取url中的各个部分
     * @param  {[type]} url [url地址]
     * @return {[type]}     [返回url各部分的对象]
     */
    util.parseURL = function (url) {
        var a = document.createElement('a');
        a.href = url;
        return {
            source  : url,
            protocol: a.protocol.replace(':', ''),
            host    : a.hostname,
            port    : a.port,
            query   : a.search,
            params  : (function () {
                var ret = {},
                    seg = a.search.replace(/^\?/, '').split('&'),
                    len = seg.length, i = 0, s;
                for (; i < len; i++) {
                    if (!seg[i]) {
                        continue;
                    }
                    s = seg[i].split('=');
                    ret[s[0]] = s[1];
                }
                return ret;
            })(),
            file    : (a.pathname.match(/\/([^\/?#]+)$/i) || [, ''])[1],
            hash    : a.hash.replace('#', ''),
            path    : a.pathname.replace(/^([^\/])/, '/$1'),
            relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [, ''])[1],
            segments: a.pathname.replace(/^\//, '').split('/')
        };
    }

    // 以“一个中文字符 = 两个英文空格”返回总长度 - make chinese Chars as "  " 2 letters and return the length.
    util.getStringLengthInChinese = function (text) {
        return text.replace(/[^\x00-\xff]/g, "  ").length;
    }

    //解决IOS safari在input focus弹出输入法时不支持position fixed的问题
    util.fixInputFocusPosition = function (input, inputContainer) {
        //只作用于输入框获得焦点时
        input.focus(function () {
            var _this = inputContainer;
            //无键盘时输入框到浏览器窗口顶部距离
            var noInputViewHeight = $(window).height() - $(_this).height();

            //网页正文内容高度
            var contentHeight = $(document).height() - $(_this).height();

            //控制正文内容高度大于一屏，保证输入框固定底部
            contentHeight = contentHeight > noInputViewHeight ? contentHeight : noInputViewHeight;

            //因为弹出输入法需要时间，需延时处理
            setTimeout(function () {

                //弹出输入法时滚动条的起始滚动距离
                var startScrollY = $(window).scrollTop();

                //弹出输入法时输入框到窗口顶部的距离，即到软键盘顶部的起始距离
                var inputTopHeight = $(_this).offset().top - startScrollY;

                //弹出输入法时输入框预期位置，即紧贴软键盘时的位置。因输入框此时处于居中状态，所以其到窗口顶部距离即为需往下移动的距离。
                var inputTopPos = $(_this).offset().top + inputTopHeight;

                //控制div不超出正文范围
                inputTopPos = inputTopPos > contentHeight ? contentHeight : inputTopPos;

                //设置输入框位置使其紧贴输入框
                $(_this).css({'position': 'absolute', 'top': inputTopPos});

                //给窗口对象绑定滚动事件，保证页面滚动时div能吸附软键盘
                $(window).bind('scroll', function () {

                    //表示此时有软键盘存在，输入框浮在页面上了
                    if (inputTopHeight != noInputViewHeight) {

                        //页面滑动后，输入框需跟随移动的距离
                        var offset = $(this).scrollTop() - startScrollY;

                        //输入框移动后位置
                        afterScrollTopPos = inputTopPos + offset;

                        //设置输入框位置使其紧贴输入框
                        $(_this).stop().animate({'position': 'absolute', 'top': afterScrollTopPos});
                    }
                });
            }, 200);
        }).blur(function () {//输入框失焦后还原初始状态
            inputContainer.removeAttr('style');
            $(window).unbind('scroll');
        });
    }

    /**
     * 向后端POST数据, 包含默认的 loading 提示与 error 提示
     */
    util.awesomePost = function (config) {
        // loading提示层
        var dialogLoading = util.artDialogLoading();

        // 开始与后端通信
        $http.post(config.url, config.data || {})
            // 后端返回数据
            .success(function (res) {
                dialogLoading.close();

                if (res.code != 200) {
                    util.artDialogHint(res.msg);
                    return false;
                }

                config.success(res);
            })
            // 后端返回异常
            .error(function (err) {
                if (config.error) {
                    config.error();
                } else {
                    dialogLoading.close();

                    util.artDialogHint('<p>啊哦~ 我们的管家好像有点忙, 请稍后再试...</p>');
                    console.error(err);
                }
            });

    };

    return util;

}]);