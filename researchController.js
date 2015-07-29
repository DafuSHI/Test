
define([ "dojo/_base/declare", "dojo/query", "dojo/aspect", "dijit/registry",
		"dijit/_WidgetBase", "dojo/dom-attr", "dojo/dom-construct",
		"dojo/dom-style", "dojo/dom", "dojo/on","dojo/_base/array","dojo/_base/lang","dojox/gesture/swipe","dojo/dom-class"],
		function(declare, query, aspect, registry, _WidgetBase, domAttr,
				domConstruct, domStyle, dom, on,array,lang,swipe,domClass) {
		
			declare("js.controllers.researchController", [], {
				
				/*
				 * Properties
				 */
				instance:null,
				typingTimer:null,       
				doneTypingInterval :350,
				
				constructor : function(args) {
					instance = this;
				},
				onStart : function() {
					   var  tempThis = this;
					    $(".global-menuBtn").click(openPanel);
						$(".global-searchBtn").click(tempThis.gotoSearch);
						$("#research_typeTabs .tabsBtn").click(tempThis.changeTabs);
						$("#research-tagsId li span").on("click",tempThis.removeTags);
						$("#rs_sendNotesDialog").click(function(event){
							event.stopPropagation();
						});
						$("#rs_searchTxt").on("keydown", function(e) {
							if(e.which == 13) {
								$(this).blur();
								researchController.searchTags();
						    }
						}); 
						$("#rs_search_btn").on("click",function(){
							$(this).blur();
							researchController.searchTags();
						});
						$(".global-leftBtn").on("click",function(){
							toast("Number of given sessions.");
						});
						$(".global-rightBtn").on("click",function(){
							toast("Number of available hours.");
						});
						$("#imageFaceSmall_research").on("click",homeController.goToMyProfile);
						$("#rs_searchTxt")
						.on("keyup",function(e){
							clearTimeout(researchController.typingTimer);
							researchController.typingTimer = setTimeout(function(){
								researchController.autoCompleSearchTxt(e);
						    }, researchController.doneTypingInterval);
							
						})
						.on("keydown",function(){
						    clearTimeout(researchController.typingTimer);
						}); 
						
						var rsPro = dom.byId("rsPro");
						var screenHeight = document.body.scrollHeight;
						domStyle.set(rsPro, "height", screenHeight + "px");

						
						
//						.on("keydown",researchController.autoCompleSearchTxt).on("keyup",function(e){
//							if($(this).val()==''){
//								$("#autoCompleBRS").hide();
//							}
//						}); 
						$(document).click(function(){
							$("#autoCompleBRS").hide();
						});
				},
				initView:function(){
					$("#r_profile").find(".global-leftBtn").html(userObj_global.sessionHours);
					$("#r_profile").find(".global-rightBtn").html(userObj_global.availabilityHours+"h");
					var lv,rv;
					if($("#r_profile").width()<400){
						 lv=$("#r_profile").find(".global-leftBtn").width()+8;
						 rv=$("#r_profile").find(".global-rightBtn").width()+8;
					}else{
						 lv=$("#r_profile").find(".global-leftBtn").width()+7;
						 rv=$("#r_profile").find(".global-rightBtn").width()+7;
					}
					researchController.resizeAutoComDiv();
					$("#r_profile").find(".global-leftBtn-border").css("width",lv+"px");
					$("#r_profile").find(".global-rightBtn-border").css("width",rv+"px");
					$("#availabilitiesBtn").click();
				},
				gotoSearch: function(){
					var evt = {
							data : {
								viewName : {}
							}
						};
					evt.data.viewName = "homeView";
					transViews(evt);
				},
				gotoMA:function(id,email,tagName){
					var evt = {
							data : {
								viewName : {}
							}
						};
					evt.data.viewName = "myAvailabilitiesView";
					transViews(evt);
					myAvailabilitiesController.fromSearch(id,email,tagName);
					setScrollViewHeight("maListDiv",$("#myAvaDivView").height()+1);
					
				},
				gotoMP:function(id,email){
					var evt = {
							data : {
								viewName : {}
							}
						};
					evt.data.viewName = "myProfileView";
					transViews(evt);
					myProfileController.formSearch("researchView",id,email);
					setScrollViewHeight("domainPanel",$("#myProfileDivView").height()+1);
				},
				changeTabs:function(event){
					$(".typeTabs").children(".tabsBtn-selected").removeClass("tabsBtn-selected");
					$(this).addClass("tabsBtn-selected");
					researchController.getResults($(this).html());
					event.stopPropagation();
				},
				searchTags:function(){
					if($("#rs_searchTxt").val()==""){
							myAlert("Prompt","Search criteria is required!","OK");
							return false;
					}
					if($("#research-tagsId li").length<=4){
						var tempTxt=$("#rs_searchTxt").val();
						var flag= true;
						$.each($("#research-tagsId li "),function(i,n){
							if($(n).find("a").text()==tempTxt){
								flag=false;
								return false;
							}
						});
						if(flag){
							$("#research-tagsId").append("<li><a>"+$("#rs_searchTxt").val()+"</a><span>X</span></li>");
							$("#research-tagsId li span").on("click",researchController.removeTags);
							$("#rs_searchTxt").val("");
							researchController.getResults();
						}else{
							myAlert("","You have searched this domain!","OK");
						}
					}else {
						myAlert("","You can only input 4 tags!","OK");
					}
					
				},
				outSearchTags:function(tag){
					if(tag==""){
//						myAlert("","this is Required!","OK");
						return false;
					}
					if($("#research-tagsId li").length<=4){
						var tempTxt=tag;
						var flag= true;
						$.each($("#research-tagsId li "),function(i,n){
							if($(n).find("a").text()==tempTxt){
								flag=false;
								return false;
							}
						});
						if(flag){
							$("#research-tagsId").append("<li><a>"+tag+"</a><span>X</span></li>");
							$("#research-tagsId li span").on("click",researchController.removeTags);
							$("#rs_searchTxt").val("");
						}else{
							myAlert("","You have search this domain!","OK");
						}
					}else {
						myAlert("","You can only input 5 tags!","OK");
					}
				
				},
				removeTags : function(){
					$(this).parent().remove();
					researchController.getResults();
				},
				showDialog: function(obj){
					if($("#rs-sendNotesDialog").is(":hidden")==true){
						$("#researchPanel").append("<div id='shade' style='z-index:2;background:black;position:fixed;top:0;left:0;width:"+$(window).width()+"px;height:"+($("body").height()+20)+"px;'>&nbsp;</div>");
						$("#shade").fadeTo(0,0,function(){$("#shade").fadeTo(500,0.5);});
						$("#rs-sendNotesDialog").css("z-index","9999").show();
						var str="";
						$.each(obj.parent().siblings(".research-listView-c").children(".rs_tags_item").find("span"),function(i,n){
							str+=$(n).html()+"&";
						});
						if(str!=""){
							str=str.substring(0,str.length-1);
						}
						$("#rs-dialog-tag").html(str);
						$("#rs_sendNotesBtn").unbind("click").bind("click",function(event){
							researchController.sendNote(obj);
							event.stopPropagation();
						});
						$("#rs_cancelBtn").unbind("click").bind("click",hideShade);
					}
				},
				getResults:function(tabVal,queue){
					if(tabVal==undefined){
						tabVal=$(".typeTabs").children(".tabsBtn-selected").html();
					}
					if($("#research-tagsId li").length!=0){
						startIndicator("Loading...","getResults");
						var array=new Array();
						$.each($("#research-tagsId li"),function(i,n){
							array.push($(n).find("a").text().toLocaleLowerCase());
						});
						if("Around Me"==tabVal){
							tabVal="0";
						}else if("All Availabilities"==tabVal){
							tabVal="1";
						}else if("By Expertise"==tabVal){
							tabVal="2";
						}else{
							tabVal="0";
						}
						var json={
								tagName:array,
								type:tabVal,
								country:userObj_global.co,
								location:userObj_global.location,
								timeZone:userObj_global.timeZone,
								userID:userObj_global.id
						};
						var para=JSON.stringify(json);
						var invocationData = {
			        			adapter : 'CoachMeAdapter',
			        			procedure : 'getAvailabilityBySearch',
			        			parameters : [para]
			        		};
						callHTTPAdapter(invocationData,researchController.getResultSuccessCallback,queue);
					}else{
						$("#researchUl").html("");
						var noData='<li >'+
							'<div  style="font-size: 12px;text-align: center;">'+
							'No one available is mKKJLKjatching your search criteria.'+
							'</div>'+
							'</li>';
						$("#researchUl").append(noData);
						if(queue!=undefined&&queue!=""){
							$("body").dequeue(queue);
						}
					}
					
				},
				// RESULT : à modif pour afficher les coach sans availibility 
				getResultSuccessCallback:function(data,queue){
					console.log("getResultSuccessCallback");
					stopIndicator("getResultSuccessCallback");
					//Recuperation des tags 
					var tagsStr= "";
					var array = new Array();
					$.each($("#research-tagsId li"),function(i,n){
						tagsStr=tagsStr+$(n).find("a").text().toLocaleLowerCase();
						array.push($(n).find("a").text().toLocaleLowerCase());
					});
					if(data.invocationResult.array!=null){
					$("#researchUl").html("");
					
					if(data.invocationResult.array.length==0){
						var noData='<li >'+
							'<div style="font-size: 12px;text-align: center;">'+
							'No one available is matching your search criteria.'+ tagsStr+
							'</div>'+
							'</li>';
						$("#researchUl").append(noData);
						return false;
					}
					$.each(data.invocationResult.array,function(i,n){
						var tagsStr="";
						if(n.userID==userObj_global.id){
							return true;
						}
						if(n.tagName!=""){
							var tagArray=n.tagName;
							$.each(tagArray.split(","),function(u,v){
								tagsStr=tagsStr+'<span class="research-listView-c-btn">'+v+'</span>';
							});
						}
						var timeForm=formatDateToSpecial3(n.timeFrom);
						var str='<li id=research'+n.ID+'  data-uuid='+n.ID+' data-owner-uuid='+n.userID+' data-owner-email="'+n.IIPID+'">'+
						'<span class="research-listView-l">'+
							'<div align="center" class=" listViewImageBorder imageFaceBorderSmall  gradient-background">'+
								'<img src="'+getBPImg(n.IIPID)+'" class=" listViewImage imageFaceSmall" />'+
		    				'</div>'+
		    				'<div class="gradient-background research-listView-l-lb">'+
			    				'<div class="research-listView-l-l">'+n.sessionHours+'</div>'+
		    				'</div>'+
		    				'<div class="gradient-background research-listView-l-rb">'+
			    				'<div class="research-listView-l-r">'+n.availabilityHours+'h</div>'+
		    				'</div>'+
						'</span>'+
						'<span align="center" class="research-listView-c">'+
							'<div class="rs_nameAndLanguage">'+n.lastName+' '+n.firstName+' '+n.language+'</div>'+
							'<div class="rs_date">'+formatDateToSpecial2(n.timeFrom)+'</div>'+
							'<div class="rs_times">'+
							timeForm.substring(0,timeForm.length-2)+"-"+formatDateToSpecial3(n.timeTo)+
							'</div>'+
							'<div class="rs_location">'+n.location+'</div>'+
							'<div class="rs_tags_item" style="margin-top: 4px;">'+
								tagsStr+
							'</div>'+
						'</span>'+
						'<span class="research-listView-r">'+
							'<div class="research-listView-r-btn">CoachMe!</div>'+
						'</span>'+
					'</li>';
						$("#researchUl").append(str);
						var lv,rv;
						if($("#r_profile").width()<400){
							 lv=$("#research"+n.ID).find(".research-listView-l-l").width()+8;
							 rv=$("#research"+n.ID).find(".research-listView-l-r").width()+8;
						}else{
							 lv=$("#research"+n.ID).find(".research-listView-l-l").width()+7;
							 rv=$("#research"+n.ID).find(".research-listView-l-r").width()+7;
						}
						$("#research"+n.ID).find(".research-listView-l-lb").css("width",lv+"px");
						$("#research"+n.ID).find(".research-listView-l-rb").css("width",rv+"px");
					});
					$("#researchUl li").on("click",function(event){
						var array=new Array();
						$.each($(this).find(".research-listView-c").find(".rs_tags_item").children(".research-listView-c-btn"),function(i,n){
							array.push($(n).html());
						});
						researchController.gotoMA($(this).data("ownerUuid"),$(this).data("ownerEmail"),array);
						event.stopPropagation();});
					$("#researchUl li").find(".research-listView-c-btn").on("click",function(event){
						researchController.gotoMP($(this).parent().parent().parent().data("ownerUuid"),$(this).parent().parent().parent().data("ownerEmail"));
						event.stopPropagation();
						});
					$(".research-listView-r-btn").on("click",function(event){researchController.showDialog($(this));event.stopPropagation();});
					}
					ScrollableViewToTop("researchPanel");
					if(queue!=undefined&&queue!=""){
						$("body").dequeue(queue);
					}
					
				},
				sendNote:function(obj){
					startIndicator("Loading...","sendNote");
					var array=new Array();
					//search domain
					$.each($("#research-tagsId li"),function(i,n){
						array.push($(n).find("a").html().toLocaleLowerCase());
					});
					//item domain
//					$.each(obj.parent().siblings(".research-listView-c").find(".rs_tags_item").children(".research-listView-c-btn"),function(i,n){
//						array.push($(n).html());
//					});
					var json={  
							availabilityID:obj.parent().parent().data("uuid")+"",
							userID:userObj_global.id,
							subject:"",
							description:"",
							tagName:array
					};
					var para=JSON.stringify(json);
					var invocationData = {
		        			adapter : 'CoachMeAdapter',
		        			procedure : 'sendNote',
		        			parameters : [para]
		        		};
					WL.Client.invokeProcedure(invocationData,{
				        onSuccess: researchController.sendNoteSuccessCallback,
				        onFailure : function(data){
				        	stopIndicator();
				        	myAlert("",data.invocationResult.msg,"OK");
				        },
				        onConnectionFailure : function(response)
				        {
				     	   WL.SimpleDialog.show(
									" ",
									"Oops! There seems to be a server issue. Please try again soon. ",
									[ {
										text : "OK",
										handler : function() {
										}
									} ]);
				            stopIndicator();
				        },
				        timeout : 30000
				    });
//					callHTTPAdapter(invocationData,researchController.sendNoteSuccessCallback);
				},
				sendNoteSuccessCallback:function(data){
					console.log("sendNoteSuccessCallback");
					hideShade();
					stopIndicator("sendNoteSuccessCallback");
					if(data.invocationResult.isSuccessful==true){
						toast("Send Notes is done!");
						
						var _rsQueue=[
						       	function(){
						       		researchController.getResults(undefined,'rsQueue');
//						       		loginController.getUserHours(userObj_global.id,'rsQueue');
						       	},
						       	function(){
						       		loginController.getUserHours(userObj_global.id,'rsQueue');
						       	},	
						       	function(){
						       		stopIndicator("_rsQueue");
						       		$("#r_profile").find(".global-leftBtn").html(userObj_global.sessionHours);
									$("#r_profile").find(".global-rightBtn").html(userObj_global.availabilityHours+"h");
						       	}];
						$("body").queue('rsQueue',_rsQueue);
						$("body").dequeue('rsQueue');
					}
					
				},
				autoCompleSearchTxt:function(e){
					e.stopPropagation();
					console.log("call autoCompleSearchTxt");
			    	if($("#rs_searchTxt").val()!=''){
			    		var json={  
								tagName:$("#rs_searchTxt").val()
								};
						var para=JSON.stringify(json);
			    		var invocationData = {
			        			adapter : 'CoachMeAdapter',
			        			procedure : 'getTagSearch',
			        			parameters : [para]
			        		};
						callHTTPAdapter(invocationData,researchController.getTagSearchSuccessCallback);
			    	}else{
			    		$("#autoCompleBRS").hide();
			    	}
					
				},
				getTagSearchSuccessCallback:function(data){
					console.log("getTagSearchSuccessCallback");
					if(data.invocationResult.array!=null){
						 if($("#rs_searchTxt").val()==''){
							 $("#autoCompleBRS").hide();
							 return false;
						 }else if(data.invocationResult.array.length==0){
							 $("#autoCompleBRS").hide();
							 return false;
						 }
						var myTemplate = Handlebars.compile($("#serarchTagCloudByRS-template").html());
					    $('#autoCompleBRSList').html(myTemplate(data.invocationResult.array));
						$("#autoCompleBRSList li a").on("click",researchController.getAutoCoTag);
						researchController.resizeAutoComDiv();
						ScrollableViewToTop("autoCompleBRS");
						$("#autoCompleBRS").show();
					}
					stopIndicator();
				},
				getAutoCoTag:function(){
					researchController.outSearchTags($(this).text());
					$("#autoCompleBRS").hide();
					researchController.getResults();
					
				},
				resizeAutoComDiv:function(){
					$("#autoCompleBRS").css("left",$("#rs_searchTxt").offset().left);
					$("#autoCompleBRS").css("top",$("#rs_searchTxt").offset().top+$("#rs_searchTxt").height()+2);
					$("#autoCompleBRS").css("width",$("#rs_searchTxt").width()+15);
				},
				
			});
		});