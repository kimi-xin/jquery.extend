/**
 * Created by kimi.xin on 2016/7/15.
 * 基于JQuery类库的ajax函数，增加了更多功能支持
 */
(function($){
    $.ajax_extend = function(ajaxOpts,extraOpts){
        ajaxOpts = ajaxOpts || {};
        extraOpts = $.extend(true,$.ajax_extend.defaultOptions,extraOpts);

        // 判定是否需要将 data 格式化
        if(ajaxOpts.data && extraOpts.requestDataFormat && typeof extraOpts.requestDataFormat == 'function' ){
            ajaxOpts.data = extraOpts.requestDataFormat(ajaxOpts.data);
        }

        // 保留原错误处理
        var _error = ajaxOpts.error;
        // 重试次数
        var retryCount = 0;
        // 重试函数，可进行重试返回true，超过重试限制返回false
        var retry = function(req,status,err){
            if(retryCount < extraOpts.errRetryLimit){
                if(typeof extraOpts.errRetry == 'function')
                    extraOpts.errRetry(req,status,err,retryCount+1);
                retryCount++;
                if(extraOpts.errRetryInterval>0){
                    setTimeout(doAjax,extraOpts.errRetryInterval);
                }
                else
                    doAjax();
                return true;
            }
            return false;
        }

        ajaxOpts.error = function(req,status,err){
            if(retry(req,status,err)==true)
                return;

            if(typeof _error == 'function')
                _error(req,status,err);
        }

        // 保留原始成功函数
        var _success = ajaxOpts.success;
        ajaxOpts.success = function(_data){
            // 判定是否需要将 data 格式化
            if(_data && extraOpts.responseDataFormat && typeof extraOpts.responseDataFormat == 'function' ){
                _data = extraOpts.responseDataFormat(_data);
            }

            if(extraOpts.customRetryErr && typeof extraOpts.customRetryErr == 'function'){
                if(extraOpts.customRetryErr(_data) == true){
                    if(retry(null,null,_data)==true)
                        return;
                }
            }

            if(typeof _success == 'function')
                _success(_data);
        }

        // 执行AJAX请求
        var doAjax = function(){
            $.ajax(ajaxOpts);
        };

        doAjax();
    };

    // 额外默认参数
    $.ajax_extend.defaultOptions = {
        errRetryLimit:0,                            // 发生错误后，自动重试次数（默认情况下的错误是指可在 被error事件捕获到的错误），总请求次数为（默认请求1次+重试次数）；默认为0，不重试
        errRetryInterval:0,                         // 重试事件间隔（毫秒），默认为0不等待
        customRetryErr:null,                       // 在获取到请求响应数据后，通过返回标示判定为请求失败，并认为需要重试的情况，可通过此配置函数定义； function(_data)，函数返回true时进行重试，返回false继续执行；如定义了 responseDataFormatFunc则在responseDataFormatFunc之后触发；重试次数共享 errRetryLimit
        errRetry:null,                             // 进行重试时触发此事件 function(req,status,err,retryCount)，retryCount为当前重试次数；自定义错误时err会返回获取到的data对象
        requestDataFormat:null,                    // 请求参数格式化自定义函数function(_data)，_data为ajax参数中的data对象，函数返回格式化后的data对象，用于替代jQuery.ajax.data
        responseDataFormat:null                    // 响应数据格式化自定义函数 function(_data)，_data为请求返回的原始数据，函数返回格式化后的data对象，用于替代success的参数
    };

})(jQuery);
