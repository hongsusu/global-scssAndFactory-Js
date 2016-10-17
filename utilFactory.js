quanziCRMApp
    .factory('util', ['$http', function ($http) {
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
            var loadingDialog = dialog({
                fixed: true
            });
            if (content) {
                loadingDialog.options.content = content
            }
            loadingDialog.showModal();
            return loadingDialog;
        };

        /**
         * 弹窗 简洁提示框
         * @param content [可选] 弹窗中要显示的提示文本, 如: 操作成功!, 如果没有定义, 则显示默认的loading图标
         * @param time [可选] 弹窗停留的时间, 默认为3秒
         * @param allowQuickClose [可选] 弹窗是否可以通过点击背景层来关闭
         */
        util.artDialogHint = function (content, time, allowQuickClose) {
            var hintDialog = dialog({
                content: content,
                quickClose: typeof allowQuickClose == 'undefined',
                fixed: true
            });
            hintDialog.showModal();
            setTimeout(function () {
                hintDialog.close().remove();
            }, time || 3000);
        };

        /**
         * 气泡提示框
         * @param content 气泡弹窗中要显示的提示文本, 如: 操作成功!, 如果没有定义, 则显示默认的loading图标
         * @param trigger 气泡显示依据哪个DOM元素
         * @param onshow [可选] 显示气泡弹窗时的回调函数
         * @param onclose [可选] 显示气泡弹窗时的回调函数
         */
        util.artDialogBubble = function (content, trigger, onshow, onclose) {
            var d = dialog({
                content: content,
                align: 'bottom',
                quickClose: true
            });
            if (onshow) {
                d.onshow = onshow;
            }
            if (onclose) {
                d.onclose = onclose;
            }
            d.show(trigger[0]);
        };

        /**
         * 模态提示框
         * @param content [可选]弹窗中要显示的提示文本, 如: 操作成功!, 如果没有定义, 则显示默认的loading图标
         */
        util.artDialogModal = function (content) {
            var hintDialog = dialog({
                content: content,
                quickClose: true
            });
            hintDialog.showModal();
            return hintDialog;
        };


        //WEI GAI

        /**
         * 弹窗 单按钮模态提示框
         */
        util.artDialogAlert = function (content, title, buttonValue, callback) {

            var dialogConfig = {
                quickClose: true,
                fixed: true,
                content: content,
                title: title || ' ',
                okValue: buttonValue || '知道了',
                ok: callback || function () {

                }
            };

            dialog(dialogConfig).showModal();
        };


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
        };

        /**
         * 获取url中的各个部分
         * @param  {[type]} url [url地址]
         * @return {[type]}     [返回url各部分的对象]
         */
        util.parseURL = function (url) {
            var a = document.createElement('a');
            a.href = url;
            return {
                source: url,
                protocol: a.protocol.replace(':', ''),
                host: a.hostname,
                port: a.port,
                query: a.search,
                params: (function () {
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
                file: (a.pathname.match(/\/([^\/?#]+)$/i) || [, ''])[1],
                hash: a.hash.replace('#', ''),
                path: a.pathname.replace(/^([^\/])/, '/$1'),
                relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [, ''])[1],
                segments: a.pathname.replace(/^\//, '').split('/')
            };
        };

        // 以“一个中文字符 = 两个英文空格”返回总长度 - make chinese Chars as "  " 2 letters and return the length.
        util.getStringLengthInChinese = function (text) {
            return text.replace(/[^\x00-\xff]/g, "  ").length;
        };

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
        };

        /**
         * php 对应方法 数组 key 转大写的 JavaScript 实现
         * @param array The array to work on
         * @param cs Either CASE_UPPER or CASE_LOWER (default)
         * @returns {*} Returns an array with its keys lower or uppercased, or FALSE if array is not an array.
         */
        util.php_array_change_key_case = function (array, cs) {
            //  discuss at: http://phpjs.org/functions/array_change_key_case/
            // original by: Ates Goral (http://magnetiq.com)
            // improved by: marrtins
            // improved by: Brett Zamir (http://brett-zamir.me)
            //   example 1: array_change_key_case(42);
            //   returns 1: false
            //   example 2: array_change_key_case([ 3, 5 ]);
            //   returns 2: [3, 5]
            //   example 3: array_change_key_case({ FuBaR: 42 });
            //   returns 3: {"fubar": 42}
            //   example 4: array_change_key_case({ FuBaR: 42 }, 'CASE_LOWER');
            //   returns 4: {"fubar": 42}
            //   example 5: array_change_key_case({ FuBaR: 42 }, 'CASE_UPPER');
            //   returns 5: {"FUBAR": 42}
            //   example 6: array_change_key_case({ FuBaR: 42 }, 2);
            //   returns 6: {"FUBAR": 42}
            //   example 7: ini_set('phpjs.return_phpjs_arrays', 'on');
            //   example 7: var arr = [{a: 0}, {B: 1}, {c: 2}];
            //   example 7: var newArr = array_change_key_case(arr);
            //   example 7: newArr.splice(1, 1);
            //   returns 7: {b: 1}

            var case_fn, key, tmp_ar = {};

            if (Object.prototype.toString.call(array) === '[object Array]') {
                return array;
            }
            if (array && typeof array === 'object' && array.change_key_case) { // Duck-type check for our own array()-created PHPJS_Array
                return array.change_key_case(cs);

            }
            if (array && typeof array === 'object') {
                case_fn = (!cs || cs === 'CASE_LOWER') ? 'toLowerCase' : 'toUpperCase';
                for (key in array) {
                    tmp_ar[key[case_fn]()] = array[key];
                }
                return tmp_ar;
            }

            return false;
        };

        /**
         * php 对应方法 数组排序的 JavaScript 实现
         * @param inputArr
         * @param sort_flags
         * @returns {boolean|{}}
         */
        util.php_ksort = function (inputArr, sort_flags) {
            //  discuss at: http://phpjs.org/functions/ksort/
            // original by: GeekFG (http://geekfg.blogspot.com)
            // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // improved by: Brett Zamir (http://brett-zamir.me)
            //        note: The examples are correct, this is a new way
            //        note: This function deviates from PHP in returning a copy of the array instead
            //        note: of acting by reference and returning true; this was necessary because
            //        note: IE does not allow deleting and re-adding of properties without caching
            //        note: of property position; you can set the ini of "phpjs.strictForIn" to true to
            //        note: get the PHP behavior, but use this only if you are in an environment
            //        note: such as Firefox extensions where for-in iteration order is fixed and true
            //        note: property deletion is supported. Note that we intend to implement the PHP
            //        note: behavior by default if IE ever does allow it; only gives shallow copy since
            //        note: is by reference in PHP anyways
            //        note: Since JS objects' keys are always strings, and (the
            //        note: default) SORT_REGULAR flag distinguishes by key type,
            //        note: if the content is a numeric string, we treat the
            //        note: "original type" as numeric.
            //  depends on: i18n_loc_get_default
            //  depends on: strnatcmp
            //   example 1: data = {d: 'lemon', a: 'orange', b: 'banana', c: 'apple'};
            //   example 1: data = ksort(data);
            //   example 1: $result = data
            //   returns 1: {a: 'orange', b: 'banana', c: 'apple', d: 'lemon'}
            //   example 2: ini_set('phpjs.strictForIn', true);
            //   example 2: data = {2: 'van', 3: 'Zonneveld', 1: 'Kevin'};
            //   example 2: ksort(data);
            //   example 2: $result = data
            //   returns 2: {1: 'Kevin', 2: 'van', 3: 'Zonneveld'}

            var tmp_arr = {},
                keys = [],
                sorter, i, k, that = this,
                strictForIn = false,
                populateArr = {};

            switch (sort_flags) {
                case 'SORT_STRING':
                    // compare items as strings
                    sorter = function (a, b) {
                        return that.strnatcmp(a, b);
                    };
                    break;
                case 'SORT_LOCALE_STRING':
                    // compare items as strings, original by the current locale (set with  i18n_loc_set_default() as of PHP6)
                    var loc = this.i18n_loc_get_default();
                    sorter = this.php_js.i18nLocales[loc].sorting;
                    break;
                case 'SORT_NUMERIC':
                    // compare items numerically
                    sorter = function (a, b) {
                        return ((a + 0) - (b + 0));
                    };
                    break;
                // case 'SORT_REGULAR': // compare items normally (don't change types)
                default:
                    sorter = function (a, b) {
                        var aFloat = parseFloat(a),
                            bFloat = parseFloat(b),
                            aNumeric = aFloat + '' === a,
                            bNumeric = bFloat + '' === b;
                        if (aNumeric && bNumeric) {
                            return aFloat > bFloat ? 1 : aFloat < bFloat ? -1 : 0;
                        } else if (aNumeric && !bNumeric) {
                            return 1;
                        } else if (!aNumeric && bNumeric) {
                            return -1;
                        }
                        return a > b ? 1 : a < b ? -1 : 0;
                    };
                    break;
            }

            // Make a list of key names
            for (k in inputArr) {
                if (inputArr.hasOwnProperty(k)) {
                    keys.push(k);
                }
            }
            keys.sort(sorter);

            // BEGIN REDUNDANT
            this.php_js = this.php_js || {};
            this.php_js.ini = this.php_js.ini || {};
            // END REDUNDANT
            strictForIn = this.php_js.ini['phpjs.strictForIn'] && this.php_js.ini['phpjs.strictForIn'].local_value && this.php_js
                    .ini['phpjs.strictForIn'].local_value !== 'off';
            populateArr = strictForIn ? inputArr : populateArr;

            // Rebuild array with sorted key names
            for (i = 0; i < keys.length; i++) {
                k = keys[i];
                tmp_arr[k] = inputArr[k];
                if (strictForIn) {
                    delete inputArr[k];
                }
            }
            for (i in tmp_arr) {
                if (tmp_arr.hasOwnProperty(i)) {
                    populateArr[i] = tmp_arr[i];
                }
            }

            return strictForIn || populateArr;
        };

        /**
         * 把要post到后端的数据加一个token
         * @param postData 要发送的json数据
         * @returns {*}
         */
        util.generateDataWithToken = function (postData) {

            var token = util.php_array_change_key_case(postData, 'CASE_UPPER');
            token = util.php_ksort(token);

            var strToken = '';
            for (var keyItem in token) {
                if (token.hasOwnProperty(keyItem)) {
                    strToken += keyItem + token[keyItem];
                }
            }
            strToken += 'quanziCRM';

            var dataWithToken = angular.copy(postData);
            dataWithToken.token = md5(md5(strToken));
            return dataWithToken;
        };

        return util;

    }]);