
/**
 * Created by Zi on 2016/8.
 */

var config = {};
var cheerio = require('cheerio');
var fs = require('fs');
    
module.exports = {
    ini : iniInfo,
    print : printer()
};

function iniInfo(which, url, path){
    config = JSON.parse(fs.readFileSync(path, 'utf8'));

    var info = Info(config, which);
    console.log('logging from tools...');
    console.log(info);
    module.exports.info = info;
};   

/****************************返回的对象结构*****************************/
  
function Info(config, which) {
    var data = {
        route : config.route, //路由配置
    
        detail : {
                author : config.author,
                newsTag : config.newsTag,
                seed : config.seed,
                domain : config.domain,
                language : config.language,
                country : config.country, 
                detail : config.detail.detailSelectors,
                modifyContent : modifyContent(config.detail.remove, config.detail.addPic),
                modifyDate : modifyDate(config.detail.dateFn),
                catMatcher : getCatDtl(config.detail.getCatMethod)
        }        
    }
    return data[which];
    
}; 
/********************************************************************/

// 数据打印以方便校验，主要用于detail.js
function printer() {
	return {
	    all : function(data){
	        for (var item in data){
	            var j = 1;
	            for (; j < arguments.length; j++){
	                if (arguments[j] == item) break;
	            }
	            if (j < arguments.length) continue;
	            console.log(item + '数据为:' + data[item]);  
	        } //参数中...others为不希望log出来的数据
	    },
	    pic : function(comments, pic){
	        console.log((comments||'') + '封面图:' + pic);
	    },
	    date : function(comments, date){
	        console.log((comments||'') + '日期:' + date);
	    },
	    cat : function(comments, cat){
	        console.log((comments||'') + '一级分类' + cat);
	    }		
	}
};

/***************************内容处理***************************/    
function modifyContent(removeList, toAddPic){
	return (function(content, pic){
		this.remove = (function (stuff){
			console.log('被删除内容:' + $(stuff));
			$(stuff).remove();
		}); //remove函数：打印并删除多余文案
        
		this.addPic = (function (pic, add){
			if (pic && add){
				console.log('添加图片:' + pic);
				return '<img src="' + pic + '"/><br>';
			}else return '';
		}); //addPic函数：根据是否需要在正文上方添加图片

		// 加载前根据需要先在正文上部添加封面图
        var content = this.addPic(pic, toAddPic) + content;
		var $ = cheerio.load(content),
			that = this;
		// 去除能直接定位的多余文案
		for (var i = 0; i < removeList.length; i++){
			that.remove($(removeList[i]));
		}
		// 执行cinfig.js里设定的自定义函数
		var FnList = config.detail.contentFn;
		for (var k = 0; k < FnList.length; k++){
			FnList[k]($);
		}
		return $.html();
	});
}
/*************************************************************/
    
    
/***************************时间处理***************************/
function modifyDate(dateFn){
	if (dateFn) {
	    // 此方法针对该站来处理时间
	    // 具体方法在config.js里填写
		return dateFn;
	}
    return createDate;
} //处理时间，默认用createDate函数，或者用自定义构造的函数
function createDate(datePassed){
	if (datePassed){
		var timePassed = /.{0,}\s+(\d{2}\:\d{2}).{0,}/.exec(datePassed);
		timePassed = timePassed? timePassed[1]:'';
	}
	var now = new Date();
	var bdNow = new Date(now.getTime() - config.timeDiff*3600*1000);
	var year = bdNow.getFullYear(),
		month = bdNow.getMonth() + 1,
		date = bdNow.getDate(),
		minutes = /^\d{2}$/.test(bdNow.getMinutes())?bdNow.getMinutes():'0'+bdNow.getMinutes()
		time = bdNow.getHours() + ":" + minutes;
	time = timePassed || time;
	console.log('最终处理时间:' + year + "-" + month + "-" + date + " " + time)
	this.timeDisplayed = year + "-" + month + "-" + date + " " + time;
	this.timeStamp = now.getTime();
}
/***********************************************************/

/*************************详情页一级分类处理***********************/
// 不根据源URL而是根据详情页字段或详情页URL打分类的情况
function parseCatFromPage() {
	return (function(cat){
		var catRet = 'others';
		var catFromPage = config.detail.catFromPage;
		for (var i in catFromPage){
			if (cat == i){
				catRet = catFromPage[i];
			}
		}
		return catRet;
	});
}
function parseCatFromUrl(regex){
	return (function(url){
		var re = new RegExp(regex);
        var catRet = re.exec(url)[1];
        return catRet;
    })
};

function getCatDtl(num) {
    var varRet = {
        0 : {
            catDtl : '',
            inputType : '', 
            parse : ''
        },
        1 : {
            catDtl : config.detail.catFromPage,
            inputType : 'webPage', 
            parse : parseCatFromPage()        
        },
        2 : {
            catDtl : config.detail.catFromUrl,
            inputType : 'url', 
            parse : parseCatFromUrl(config.detail.catFromUrl)
        }         
    }
    return varRet[num];
}
/****************************************************************/
