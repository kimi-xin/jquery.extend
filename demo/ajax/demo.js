var demo = {};
demo.ajax = function(reqUrl,output){
    $.ajax_extend({
        url:reqUrl,
        cache:false,
        type:'get',
        dataType:'json',
        data:'aaa=111',
        error:function(req,status,err){
            console.log('请求失败，发生错误',err);
            output.append('请求失败，发生错误！<br/>'+ JSON.stringify(err)+'<br/>');
        },
        success:function(data){
            data = data || {};
            if(data.code != '1000'){
                output.append('请求失败！状态码错误'+'<br/>');
                return;
            }

            output.append('请求成功！<br/>'+ JSON.stringify(data)+'<br/>');
        }
    },{
        errRetryLimit:3,                            // 发生错误后，自动重试次数（默认情况下的错误是指可在 被error事件捕获到的错误），总请求次数为（默认请求1次+重试次数）
        errRetryInterval:1000,                      // 重试事件间隔（毫秒）
        customRetryErr:function(_data){
            return _data.code != '1000';
        },                       // 在获取到请求响应数据后，通过返回标示判定为请求失败，并认为需要重试的情况，可通过此配置函数定义； function(_data)，函数返回true时进行重试，返回false继续执行；如定义了 responseDataFormatFunc则在responseDataFormatFunc之后触发；重试次数共享 errRetryLimit
        errRetry:function(req,status,err,retryCount){
            output.append('进行第'+retryCount.toString()+'次重试'+'<br/>');
        },                             // 进行重试时触发此事件 function(req,status,err,retryCount)，retryCount为当前重试次数；自定义错误时err会返回获取到的data对象
        requestDataFormat:function(_data){
            return _data;
        },                    // 请求参数格式化自定义函数function(_data)，_data为ajax参数中的data对象，函数返回格式化后的data对象，用于替代jQuery.ajax.data
        responseDataFormat:function(_data){
            // 如果此处将code改为指定值，则会覆盖 json.txt中的设置
            // success事件中返回的为此处return的_data
             _data.code = '1000';
            return _data;
        }                    // 响应数据格式化自定义函数 function(_data)，_data为请求返回的原始数据，函数返回格式化后的data对象，用于替代success的参数
    });
}

$(document).ready(function(){

    // 绑定发起请求按钮
    $('#btnReq').click(function(){
        var url = $('#reqUrl').val();   // 获取设置的URL
        var output = $('#resResult');   // 获取输出DOM
        output.empty();
        demo.ajax(url,output);
    });

});