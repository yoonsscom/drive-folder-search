/**
 * class: GoogleDriveClient
 * @param access_token
 * @returns
 */
function GoogleDriveClient(access_token) {
	
	
	
	var driveFilesUrl = 'https://content.googleapis.com/drive/v2/files';
	
	
	if ((!jQuery) || (!_)) {
		var error = 'Error: You must include jQuery and underscore to use this script.';
		alert(error);
		return error;
	}
	
    var prependToEach=function(valuesToPrepend, originalArray)
    {
        var rtn = [];
        _.each(valuesToPrepend,function(e){
            var a1 = [];
             a1.push(_.clone(e));
            var a2 = a1.concat(_.clone(originalArray));
            rtn.push(a2);
        });
        return rtn;
    };
	
    /**
     * array of objects to html table
     **/
    var objectArrayToTable = function(o)
    {
        var rtn = '<table><tr>';
        var headers = _.unique(_.flatten(_.map(o,function(e){return _.keys(e);}),true)).sort();
        _.each(headers,function(o){rtn+='<th>'+_.escape(o)+'</th>';});
        rtn+='</tr>';
       
        _.each(o,function(oe){
            rtn+='<tr>'; 
            _.each(headers,function(o2){rtn+='<td>'+_.escape(
                _.isObject(oe[o2])?JSON.stringify(oe[o2]):oe[o2]
                                                            )+'</td>';});
            rtn+='</tr>';
        });
        rtn+='</table>';
        return rtn;
    };
	
	
	
	/**
	 * 
	 * @returns
	 */
    var getUrlParams = function() {
        var query = window.location.search;
        var re = /([^&=]+)=?([^&]*)/g;
        var decode = function(str){return decodeURIComponent(str.replace(/\+/g, ' '));};
        var params = {}, e;
        if (query) {
            if (query.substr(0, 1) == '?') {
                query = query.substr(1);
            }

            while (e = re.exec(query)) {
                var k = decode(e[1]);
                var v = decode(e[2]);
                if (params[k] !== undefined) {
                    if (!jQuery.isArray(params[k])) {
                        params[k] = [params[k]];
                    }
                    params[k].push(v);
                } else {
                    params[k] = v;
                }
            }
        }
        return params;
    };

    /**
     * 
     * @param o
     * @returns
     */
	var log = function(o) {
		try {
			console.log(o);
		} catch (e) {
		}
	};
	
	var atoken = null;
	if (access_token) {
		atoken = accessToken;
		jQuery('.token').text(atoken);
	}

	/**
	 * 
	 */
	this.getToken = function() {
		return atoken;
	}
	/**
	 * 
	 */
	this.setToken = function(t) {
		atoken = t;
		jQuery('.token').text(atoken);
	}

	/**
	 * 
	 * @param url
	 * @param callback
	 * @param errorCallback
	 * @param requestParameters
	 * @param doNotSend
	 * @returns
	 */
	var getRequest = function(url, callback, errorCallback, requestParameters, doNotSend) {
		var xhr = new XMLHttpRequest();
		if (requestParameters) {
			if (url.indexOf('?') == -1) {
				url = url + '?';
			} else {
				url = url + '&';
			}
			url = url + jQuery.param(requestParameters);
		}
		xhr.open('GET', url);
		xhr.setRequestHeader('Authorization', 'Bearer ' + atoken);
		xhr.onload = function() {
			callback(xhr.responseText);
		};
		if (errorCallback) {
			xhr.onerror = function(p) {
				errorCallback(p);
			};
		} else {
			xhr.onerror = function(p) {
				alert('Request error: \n' + url + '\nSee console log.');
				try {
					console.log(p);
				} catch (ex) {
				}
			};
		}
		if( !doNotSend ){xhr.send();}
		return xhr;
	};

	/**
	 * 
	 * @param url
	 * @param callback
	 * @param errorCallback
	 * @param requestParameters
	 * @param doNotSend
	 * @returns
	 */
	var getJSON = function(url, callback, errorCallback, requestParameters, doNotSend) 
	{
		return getRequest(url, function(e){callback(JSON.parse(e))}, errorCallback, requestParameters, doNotSend);
	};

	/**
	 * Synchronous get request
	 * @param urlToGet
	 * @param parametersToUse
	 * @returns
	 */
	var sGetRequest = function( urlToGet, parametersToUse )
	{
		if( !parametersToUse ){ parametersToUse = {}; }
		var rtn = '';
		try{
		log('running sGetRequest("'+urlToGet+'",'+JSON.stringify(parametersToUse)+");");
		rtn = jQuery.ajax({
		   url:urlToGet,
		   data:parametersToUse,
		   async:false,
		   headers:{'Authorization': ('Bearer ' + gapi.auth.getToken().access_token)}
		   }).responseText;
		   log('returning: ');
		   log(''+rtn);
		}catch(e)
		{
			//if(error){error('Error: '+e.message);}
			log('Error: ');
			log(''+e.message);
		}
		return rtn;
	};
	var sGetJSON = function(urlToGet, parametersToUse)
	{ 
		return JSON.parse(sGetRequest( urlToGet, parametersToUse ) );
	};
	
	/**
	 * get info for a file by id
	 * @param fileid
	 * @returns
	 */
	var getFileItem = function(fileid)
	{
		var itemurl = driveFilesUrl + '/' + fileid;
		return sGetJSON(itemurl);
	};
	
	var allItemsPages = [];
	this.getAllItemsPages = function()
	{
		return allItemsPages;
	};
	var getAllItems = function()
	{
		return _.flatten( _.map( allItemsPages , function(e){if(e.items){return e.items;}else{return [];}} ) , true);
	};
	this.p_getAllItems = function()
	{
		return getAllItems();
	};
	this.getFolderElementsSorted=function()
	{
		var ii = 0;
		var all = [];
		var apa = getAllItems();
		var titles = _.pluck(apa,"title");
		var ids = _.pluck(apa,"id");
		var parentObjects = _.pluck(apa,"parents");
		var parents = _.map(parentObjects,function(parentObjectArray){
			return _.map(parentObjectArray,function(po){ return po.id; });
		});
		var idOfRoot = '';
		for(ii=0;(ii<parentObjects.length) && (idOfRoot=='');ii++)
		{
			if(parentObjects[ii].isRoot){idOfRoot=parentObjects[ii].id;}
		}
		
		var parentIdMap = _.map(ids,function(e,i){return {"id":e,"parentIds":parents[i]};});
		var parentIdsAndIdsArrays = _.map(ids,function(e){return [e];});
		for(ii=0;ii<parentIdsAndIdsArrays.length;ii++)
		{
			if(parentIdsAndIdsArrays[ii]!=idOfRoot)
			{
				//var cparents = parents[ids.indexOf(parentIdsAndIdsArrays[ii])];
				//parentIdsAndIdsArrays[ii] = prependToEach(cparents,parentIdsAndIdsArrays[ii]);
			}
		}
		return parentIdsAndIdsArrays;
		// for each entry, duplicate for each parent > 1 and unshift each parent id
		// until first entry of each is the root folder
		
		// when filling entries, folders with multiple parents will show more than once but will all fill at the same time
		
		
		
		//console.log("ParentObjects: ");
		//console.log(parentObjects);
		
		/*
		var rtn = [];
		jQuery(titles).each(function(i,e){
			rtn.push({"id":ids[i],"title":titles[i],"parentIds":_.pluck(parentObjects[i],"id"),"parentIsRoot":_.pluck(parentObjects[i],"isRoot")});
		});
		// get root and children of root
		var rootid = '';
		_.each(rtn,function(e){jQuery(e.parentIsRoot).each(function(i2,e2){
			if(e2){
				if(all.length==0){all.push([e.parentIds[i2]]);rootid = all[0][0];}
			}
		});});
		// get children of root
		_.each(rtn,function(e){jQuery(e.parentIds).each(function(i2,e2){
			if(e2==rootid){
				all.push([rootid,e.id]);
			}
		});});
		
		return all;
		*/
	};
	
	
//	var ispageworking = false;
	var getNextPage = function(r,lastcb)
	{
		allItemsPages.push(r);
		if(r.nextLink)
		{
			getJSON(r.nextLink,function(r2){getNextPage(r2,lastcb);});
		}
		else
		{
			lastcb(allItemsPages);
		}
	};

	this.showChildrenFolders=function(lastcb)
	{
		var lastcb2 = function(d){jQuery('.r').html(objectArrayToTable(d));};
		/*  '"+folderid+"' in parents AND */
		//if(!folderid){folderid='root';}
		var q = {"q":"mimeType='application/vnd.google-apps.folder' "};
		getJSON(driveFilesUrl,function(r){getNextPage(r,lastcb2);},false,q);		
	};
		// if(allItemsPages && allItemsPages.length && allItemsPages.length>0)
		// {
		// 	var lastItemsPage = allItemsPages[allItemsPages.length-1];
		// 	var u = lastItemsPage.nextLink;
		// 	if(u)
		// 	{
		// 		var cb = function(r){getJSON();};	
				
		// 	}
		// }

} // end of class
